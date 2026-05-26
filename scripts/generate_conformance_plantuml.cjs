#!/usr/bin/env node
/*
 * Generate a PlantUML flowchart for RO-Crate conformance levels and rules.
 * Usage: node scripts/generate_conformance_plantuml.cjs --detail-level 0|1|2
 * - detail-level 0: Only conformance levels
 * - detail-level 1: + top-level rules (###)
 * - detail-level 2: + nested rules (####, etc)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const LEVEL_HEADING_RE = /^#{1,6}\s*Conformance\s+Level\s*(\d+)\s*:(.*)$/i;
const RULE_HEADING_RE = /^(#{3,7})\s*Rule(?:\s+Group)?\s*(?:`([^`]+)`\s*:|:\s*(.+)|\s+`([^`]+)`\s*(.+)?)\s*$/i;
const SUMMARY_HEADING_RE = /^#{1,6}\s*Summary\s*$/i;
const EXIT_HEADING_RE = /^#{1,6}\s*Exit point\s*$/i;
const ANY_HEADING_RE = /^(#{1,6})\s+.*$/;

function cleanText(text) {
  return text.replace(/<a\s+name=['"].*?['"]>\s*/gi, '')
    .replace(/<\/a>\s*/gi, '')
    .replace(/`/g, '')
    .trim();
}

// Convert Markdown-style text to multiline PlantUML note content, with Creole list support
function toMultilineNote(text) {
  // Split into lines, trim trailing whitespace, preserve blank lines
  return text.split(/\r?\n/)
    .map(line => {
      // Substitute lines starting with '-' to '*'
      if (/^-(\s)/.test(line)) return line.replace(/^-(\s)/, '*$1').trimEnd();
      return line.trimEnd();
    })
    .join('\n'); // Multiline, not escaped
}

function parseArgs(argv) {
  let detailLevel = 0;
  for (let i = 2; i < argv.length; i++) {
    if ((argv[i] === '--detail-level' || argv[i] === '-d') && argv[i + 1]) {
      detailLevel = parseInt(argv[i + 1], 10);
      i++;
    }
  }
  return { detailLevel };
}

function parseLevelsAndRules(lines) {
  // Parse conformance levels and their rules (nested)
  const levels = [];
  let curLevel = null;
  let inSummary = false, inExit = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m = line.match(LEVEL_HEADING_RE);
    if (m) {
      if (curLevel) levels.push(curLevel);
      curLevel = {
        number: Number(m[1]),
        title: cleanText(m[2]),
        summary: '',
        exit: '',
        rules: [],
        start: i,
        end: null
      };
      inSummary = false; inExit = false;
      continue;
    }
    if (!curLevel) continue;
    if (SUMMARY_HEADING_RE.test(line)) {
      inSummary = true; inExit = false; continue;
    }
    if (EXIT_HEADING_RE.test(line)) {
      inExit = true; inSummary = false; continue;
    }
    if (ANY_HEADING_RE.test(line) && !SUMMARY_HEADING_RE.test(line) && !EXIT_HEADING_RE.test(line)) {
      inSummary = false; inExit = false;
    }
    if (inSummary && line.trim()) curLevel.summary += (curLevel.summary ? '\n' : '') + line;
    if (inExit && line.trim()) curLevel.exit += (curLevel.exit ? '\n' : '') + line;
    // Parse rules (### or deeper)
    let ruleMatch = line.match(RULE_HEADING_RE);
    if (ruleMatch) {
      const hashLevel = ruleMatch[1].length;
      let rawTitle = ruleMatch[2] || ruleMatch[3] || '';
      if (ruleMatch[4]) rawTitle = `${ruleMatch[4]}${ruleMatch[5] ? ` ${ruleMatch[5]}` : ''}`;
      const title = cleanText(rawTitle);
      if (!title) continue;
      curLevel.rules.push({
        title,
        hashLevel,
        children: [],
        parent: null,
        idx: i
      });
    }
  }
  if (curLevel) levels.push(curLevel);
  // Nest rules by hashLevel
  for (const level of levels) {
    const stack = [];
    const nested = [];
    for (const rule of level.rules) {
      while (stack.length && stack[stack.length - 1].hashLevel >= rule.hashLevel) stack.pop();
      if (stack.length) {
        rule.parent = stack[stack.length - 1];
        stack[stack.length - 1].children.push(rule);
      } else {
        nested.push(rule);
      }
      stack.push(rule);
    }
    level.rules = nested;
  }
  return levels;
}

function plantumlForLevels(levels, detailLevel) {
  const lines = [];
  lines.push('@startuml');
  lines.push('!include ../generated/style.puml');
  lines.push('start');
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i];
    // Level box: only heading
    lines.push(`:Level ${level.number}: ${level.title};`);
    // Add summary as a yellow multiline note to the left
    if (level.summary) {
      lines.push('note left #ffff99');
      lines.push(toMultilineNote(level.summary));
      lines.push('end note');
    }
    // Always add exit point as a red multiline note if present
    if (level.exit) {
      lines.push('note right #ff6666');
      lines.push(toMultilineNote(level.exit));
      lines.push('end note');
    }
    // Rules (if detailLevel >= 1)
    if (detailLevel >= 1 && level.rules.length) {
      function emitRules(rules, depth) {
        for (const rule of rules) {
          if (depth > detailLevel) continue;
          lines.push(`note right: Rule: ${rule.title}`);
          if (rule.children.length) emitRules(rule.children, depth + 1);
        }
      }
      emitRules(level.rules, 1);
    }
    // Gate
    lines.push('if ("Conforms?") then ([Yes])');
    // Next or stop
    if (i === levels.length - 1) {
      lines.push('  stop');
    } else {
      // Continue to next level
      continue;
    }
    lines.push('else ([No])');
    lines.push(`  :Does not conform to Level ${level.number};`);
    lines.push('  stop');
    lines.push('endif');
  }
  lines.push('@enduml');
  return lines.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  const input = fs.readFileSync('ro-crate-metadata-document.md', 'utf8');
  const lines = input.split(/\r?\n/);
  const levels = parseLevelsAndRules(lines);
  const plantuml = plantumlForLevels(levels, args.detailLevel);
  const outPath = path.join('generated', `ro-crate-conformance-flowchart-level${args.detailLevel}.puml`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, plantuml, 'utf8');
  console.log('Wrote PlantUML flowchart to:', outPath);

  // Render SVG using PlantUML CLI if available
  try {
    execSync(`plantuml -tsvg "${outPath}"`, { stdio: 'inherit' });
    const svgPath = outPath.replace(/\.puml$/, '.svg');
    if (fs.existsSync(svgPath)) {
      console.log('Rendered SVG to:', svgPath);
    } else {
      console.warn('PlantUML did not produce an SVG as expected.');
    }
  } catch (err) {
    console.warn('Could not render SVG with PlantUML CLI:', err.message);
  }
}

main();
