const fs = require('fs');
const path = require('path');
const { Roc2Validator } = require('../../../../scripts/ro-crate-metadata-doc-validator.cjs');

describe('metadata-file-name-ro-crate-metadata-json', () => {
  const validator = new Roc2Validator();
  const goodDir = path.join(__dirname, 'data', 'good');
  const badDir = path.join(__dirname, 'data', 'bad');

  const getCrateDirs = rootDir => {
    return fs.readdirSync(rootDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => path.join(rootDir, entry.name));
  };

  it('should pass for all good RO-Crate directories', () => {
    const crateDirs = getCrateDirs(goodDir);
    for (const crateDir of crateDirs) {
      const result = validator.attachedModeMetadataFileNameIsRoCrateMetadataJson(crateDir);
      if (!result.pass) {
        throw new Error(`Expected to pass: ${path.basename(crateDir)} (${result.error})`);
      }
    }
  });

  it('should fail for all bad RO-Crate directories', () => {
    const crateDirs = getCrateDirs(badDir);
    for (const crateDir of crateDirs) {
      const result = validator.attachedModeMetadataFileNameIsRoCrateMetadataJson(crateDir);
      if (result.pass) {
        throw new Error(`Expected to fail: ${path.basename(crateDir)}`);
      }
    }
  });
});