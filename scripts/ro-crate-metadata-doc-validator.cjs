// RO-Crate Metadata Document Validator (Roc2Validator)
// Usage: Import Roc2Validator and call its methods in your tests

class Roc2Validator {
  constructor() {}

  // Rule: roc-metadata-doc-is-JSON
  roCrateIsJSON(inputString) {
    try {
      JSON.parse(inputString);
      return { pass: true, error: null };
    } catch (e) {
      return { pass: false, error: e.message };
    }
  }

  // Add more rule methods as needed
}

module.exports = { Roc2Validator };
