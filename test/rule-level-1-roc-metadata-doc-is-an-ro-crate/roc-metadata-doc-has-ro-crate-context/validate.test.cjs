// Test for roc-metadata-doc-has-ro-crate-context rule
const fs = require('fs');
const path = require('path');
const { Roc2Validator } = require('../../../scripts/ro-crate-metadata-doc-validator.cjs');

describe('roc-metadata-doc-has-ro-crate-context', () => {
  const validator = new Roc2Validator();
  const goodDir = path.join(__dirname, 'data', 'good');
  const badDir = path.join(__dirname, 'data', 'bad');

  it('should pass for all good files', () => {
    const files = fs.readdirSync(goodDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(goodDir, file), 'utf8');
      const result = validator.rocMetadataDocHasRoCrateContext(content);
      if (!result.pass) {
        throw new Error(`Expected to pass: ${file} (${result.error})`);
      }
    }
  });

  it('should fail for all bad files', () => {
    const files = fs.readdirSync(badDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(badDir, file), 'utf8');
      const result = validator.rocMetadataDocHasRoCrateContext(content);
      if (result.pass) {
        throw new Error(`Expected to fail: ${file}`);
      }
    }
  });
});
