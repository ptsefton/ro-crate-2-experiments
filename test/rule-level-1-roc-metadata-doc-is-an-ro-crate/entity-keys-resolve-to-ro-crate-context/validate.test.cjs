// Test for keys-resolve-to-ro-crate-context rule
const fs = require('fs');
const path = require('path');
const { Roc2Validator } = require('../../../scripts/ro-crate-metadata-doc-validator.cjs');

describe('entity-keys-resolve-to-ro-crate-context', () => {
  const validator = new Roc2Validator();
  const goodDir = path.join(__dirname, 'data', 'good');
  const badDir = path.join(__dirname, 'data', 'bad');
  const contextPath = path.join(__dirname, 'data', 'contexts', 'ro-crate-1.2-DRAFT-context.jsonld');

  // The canonical 2.0 context endpoint currently resolves to a missing document,
  // so this test uses the latest resolvable official RO-Crate context URI.
  const roCrateContextUri = 'https://w3id.org/ro/crate/1.2-DRAFT/context';
  const contextDocuments = {
    [roCrateContextUri]: JSON.parse(fs.readFileSync(contextPath, 'utf8'))
  };

  it('should pass for all good RO-Crate metadata documents', async () => {
    const files = fs.readdirSync(goodDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(goodDir, file), 'utf8');
      const doc = JSON.parse(content);
      const crateContext = doc['@context'];
      const graph = doc['@graph'];
      if (!Array.isArray(graph)) {
        throw new Error(`Test fixture ${file} must include an @graph array`);
      }

      for (const entity of graph) {
        const result = await validator.entityKeysResolveToRoCrateContext(
          JSON.stringify(entity),
          crateContext,
          roCrateContextUri,
          contextDocuments
        );
        if (!result.pass) {
          throw new Error(`Expected to pass: ${file} (${result.error})`);
        }
      }
    }
  });

  it('should fail for all bad RO-Crate metadata documents', async () => {
    const files = fs.readdirSync(badDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(badDir, file), 'utf8');
      const doc = JSON.parse(content);
      const crateContext = doc['@context'];
      const graph = doc['@graph'];
      if (!Array.isArray(graph)) {
        throw new Error(`Test fixture ${file} must include an @graph array`);
      }

      let hasFailure = false;
      for (const entity of graph) {
        const result = await validator.entityKeysResolveToRoCrateContext(
          JSON.stringify(entity),
          crateContext,
          roCrateContextUri,
          contextDocuments
        );
        if (!result.pass) {
          hasFailure = true;
          break;
        }
      }

      if (!hasFailure) {
        throw new Error(`Expected to fail: ${file}`);
      }
    }
  });
});
