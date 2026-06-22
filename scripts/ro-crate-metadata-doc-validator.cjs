// RO-Crate Metadata Document Validator (Roc2Validator)
// Usage: Import Roc2Validator and call its methods in your tests

const ContextResolver = require('jsonld/lib/ContextResolver');
const jsonldContext = require('jsonld/lib/context');
const fs = require('fs');
const path = require('path');

class Roc2Validator {
  constructor() {}

  _isAbsoluteIri(value) {
    return typeof value === 'string' && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
  }

  _isRelativeIri(value) {
    return typeof value === 'string' && !value.startsWith('#') && !value.startsWith('_') && !this._isAbsoluteIri(value);
  }

  _entityHasFileType(entity) {
    const typeValue = entity && entity['@type'];
    return typeValue === 'File' || (Array.isArray(typeValue) && typeValue.includes('File'));
  }

  attachedModeMetadataFileNameIsRoCrateMetadataJson(crateDirPath) {
    if (typeof crateDirPath !== 'string' || crateDirPath.length === 0) {
      return { pass: false, error: 'crateDirPath must be a directory path string' };
    }

    let stats;
    try {
      stats = fs.statSync(crateDirPath);
    } catch (error) {
      return { pass: false, error: `Could not access crate directory: ${error.message}` };
    }

    if (!stats.isDirectory()) {
      return { pass: false, error: 'crateDirPath must point to a directory' };
    }

    const metadataPath = path.join(crateDirPath, 'ro-crate-metadata.json');
    if (!fs.existsSync(metadataPath) || !fs.statSync(metadataPath).isFile()) {
      return { pass: false, error: 'crate directory does not contain ro-crate-metadata.json at its root' };
    }

    return { pass: true, error: null };
  }

  attachedFilesPresent(crateDirPath) {
    if (typeof crateDirPath !== 'string' || crateDirPath.length === 0) {
      return { pass: false, error: 'crateDirPath must be a directory path string' };
    }

    let stats;
    try {
      stats = fs.statSync(crateDirPath);
    } catch (error) {
      return { pass: false, error: `Could not access crate directory: ${error.message}` };
    }

    if (!stats.isDirectory()) {
      return { pass: false, error: 'crateDirPath must point to a directory' };
    }

    const metadataPath = path.join(crateDirPath, 'ro-crate-metadata.json');
    if (!fs.existsSync(metadataPath) || !fs.statSync(metadataPath).isFile()) {
      return { pass: false, error: 'crate directory does not contain ro-crate-metadata.json at its root' };
    }

    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    } catch (error) {
      return { pass: false, error: `Could not parse ro-crate-metadata.json: ${error.message}` };
    }

    if (!Array.isArray(doc['@graph'])) {
      return { pass: false, error: 'ro-crate-metadata.json does not have an @graph array' };
    }

    for (const entity of doc['@graph']) {
      if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
        continue;
      }

      if (!this._entityHasFileType(entity)) {
        continue;
      }

      const id = entity['@id'];
      if (!this._isRelativeIri(id)) {
        continue;
      }

      const resolvedPath = path.resolve(crateDirPath, id);
      if (!resolvedPath.startsWith(path.resolve(crateDirPath) + path.sep)) {
        return { pass: false, error: `Relative file @id resolves outside crate root: ${id}` };
      }

      if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
        return { pass: false, error: `Relative file with @id must be present on disk: ${id}` };
      }

      const hasContentSize = Object.prototype.hasOwnProperty.call(entity, 'contentSize');
      if (hasContentSize && entity.contentSize !== undefined && entity.contentSize !== null) {
        const fileStats = fs.statSync(resolvedPath);
        const fileSizeBytes = fileStats.size;
        const contentSizeInt = parseInt(entity.contentSize, 10);
        if (contentSizeInt !== fileSizeBytes) {
          return { pass: false, error: `File ${id} has contentSize ${entity.contentSize} but actual size is ${fileSizeBytes} bytes` };
        }
      }
    }

    return { pass: true, error: null };
  }

  _createContextDocumentLoader(contextDocuments = {}) {
    return async url => {
      if (Object.prototype.hasOwnProperty.call(contextDocuments, url)) {
        return {
          contextUrl: null,
          documentUrl: url,
          document: contextDocuments[url]
        };
      }
      throw new Error(`No local context document configured for URL: ${url}`);
    };
  }

  async _resolveTermWithContext(term, context, contextDocuments = {}) {
    const sharedCache = new Map();
    const contextResolver = new ContextResolver({ sharedCache });
    const options = {
      base: '',
      processingMode: 'json-ld-1.1',
      contextResolver,
      documentLoader: this._createContextDocumentLoader(contextDocuments)
    };

    const initialContext = jsonldContext.getInitialContext(options);
    const activeContext = await jsonldContext.process({
      activeCtx: initialContext,
      localCtx: context,
      options
    });

    return jsonldContext.expandIri(activeContext, term, { vocab: true, base: true }, options);
  }

  // Rule: roc-metadata-doc-is-JSON
  roCrateIsJSON(inputString) {
    try {
      JSON.parse(inputString);
      return { pass: true, error: null };
    } catch (e) {
      return { pass: false, error: e.message };
    }
  }

  // Rule: roc-metadata-doc-has-context
  rocMetadataDocHasContext(inputString) {
    let doc;
    try {
      doc = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Document is not valid JSON' };
    }
    if (!Object.prototype.hasOwnProperty.call(doc, '@context')) {
      return { pass: false, error: 'Document does not have a @context key' };
    }
    return { pass: true, error: null };
  }

  // Rule: roc-metadata-doc-has-ro-crate-context
  rocMetadataDocHasRoCrateContext(inputString) {
    let doc;
    try {
      doc = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Document is not valid JSON' };
    }
    const context = doc['@context'];
    if (context === undefined) {
      return { pass: false, error: 'Document does not have a @context key' };
    }
    const RO_CRATE_CONTEXT_PATTERN = /^https:\/\/w3id\.org\/ro\/crate\/\d+\.\d+\/context$/;
    const items = Array.isArray(context) ? context : [context];
    const matches = items.filter(item => typeof item === 'string' && RO_CRATE_CONTEXT_PATTERN.test(item));
    if (matches.length === 0) {
      return { pass: false, error: '@context does not include an RO-Crate context URI' };
    }
    if (matches.length > 1) {
      return { pass: false, error: `@context includes ${matches.length} RO-Crate context URIs, expected exactly one` };
    }
    return { pass: true, error: null };
  }

  // Rule: roc-metadata-doc-has-graph
  rocMetadataDocHasGraph(inputString) {
    let doc;
    try {
      doc = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Document is not valid JSON' };
    }
    if (!Object.prototype.hasOwnProperty.call(doc, '@graph')) {
      return { pass: false, error: 'Document does not have a @graph key' };
    }
    if (!Array.isArray(doc['@graph'])) {
      return { pass: false, error: 'Document @graph value is not an array' };
    }
    return { pass: true, error: null };
  }

  // Rule: roc-metadata-doc-has-metadata-descriptor
  rocMetadataDocHasMetadataDescriptor(inputString) {
    let doc;
    try {
      doc = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Document is not valid JSON' };
    }
    const graph = doc['@graph'];
    if (!Array.isArray(graph)) {
      return { pass: false, error: 'Document does not have an @graph array' };
    }
    const descriptor = graph.find(entity =>
      entity && typeof entity === 'object' && entity['@id'] === 'ro-crate-metadata.json');
    if (!descriptor) {
      return { pass: false, error: 'Document does not contain a RO-Crate Metadata Descriptor with @id = "ro-crate-metadata.json"' };
    }
    const about = descriptor['about'];
    if (!about || typeof about !== 'object' || !about['@id']) {
      return { pass: false, error: 'RO-Crate Metadata Descriptor does not have an "about" property referencing another entity' };
    }
    const rootEntityId = about['@id'];
    const rootEntityExists = graph.some(entity =>
      entity && typeof entity === 'object' && entity['@id'] === rootEntityId);
    if (!rootEntityExists) {
      return { pass: false, error: `RO-Crate Metadata Descriptor "about" references "${rootEntityId}" which does not exist in @graph` };
    }
    return { pass: true, error: null };
  }

  // Rule: entity-id
  entityId(inputString) {
    let entity;
    try {
      entity = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Entity is not valid JSON' };
    }
    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      return { pass: false, error: 'Entity must be a JSON object' };
    }
    if (!Object.prototype.hasOwnProperty.call(entity, '@id')) {
      return { pass: false, error: 'Entity does not have an @id key' };
    }
    return { pass: true, error: null };
  }

  // Rule: entity-type
  entityType(inputString) {
    let entity;
    try {
      entity = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Entity is not valid JSON' };
    }
    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      return { pass: false, error: 'Entity must be a JSON object' };
    }
    if (!Object.prototype.hasOwnProperty.call(entity, '@type')) {
      return { pass: false, error: 'Entity does not have an @type key' };
    }
    const typeValue = entity['@type'];
    if (typeof typeValue === 'string') {
      return { pass: true, error: null };
    }
    if (Array.isArray(typeValue) && typeValue.length > 0 && typeValue.every(value => typeof value === 'string')) {
      return { pass: true, error: null };
    }
    return { pass: false, error: 'Entity @type must be a string or a non-empty array of strings' };
  }

  // Rule: entity-values
  entityValues(inputString) {
    let entity;
    try {
      entity = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Entity is not valid JSON' };
    }
    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      return { pass: false, error: 'Entity must be a JSON object' };
    }

    const allowedValueObjectKeys = new Set(['@value', '@type', '@language', '@direction', '@index']);

    const isEntityReference = value => {
      return value && typeof value === 'object' && !Array.isArray(value) &&
        Object.keys(value).length === 1 && typeof value['@id'] === 'string';
    };

    const isValueObject = value => {
      if (!value || typeof value !== 'object' || Array.isArray(value) || !Object.prototype.hasOwnProperty.call(value, '@value')) {
        return false;
      }
      if (Object.prototype.hasOwnProperty.call(value, '@context')) {
        return false;
      }
      return Object.keys(value).every(key => allowedValueObjectKeys.has(key));
    };

    const isAllowedValue = value => {
      if (typeof value === 'string') {
        return true;
      }
      if (isEntityReference(value) || isValueObject(value)) {
        return true;
      }
      if (Array.isArray(value)) {
        return value.every(item => typeof item === 'string' || isEntityReference(item) || isValueObject(item));
      }
      return false;
    };

    for (const [key, value] of Object.entries(entity)) {
      if (key === '@id' || key === '@type') {
        continue;
      }
      if (!isAllowedValue(value)) {
        return { pass: false, error: `Entity property "${key}" is not a string, array of allowed values, JSON-LD value object, or entity reference` };
      }
    }

    return { pass: true, error: null };
  }

  // Rule: keys-resolve-to-ro-crate-context
  async entityKeysResolveToRoCrateContext(inputString, crateContext, roCrateContext, contextDocuments = {}) {
    let entity;
    try {
      entity = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Entity is not valid JSON' };
    }

    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      return { pass: false, error: 'Entity must be a JSON object' };
    }

    if (crateContext === undefined || roCrateContext === undefined) {
      return { pass: false, error: 'Both crateContext and roCrateContext are required' };
    }

    try {
      for (const key of Object.keys(entity)) {
        if (key.startsWith('@')) {
          continue;
        }

        const resolvedWithCrateContext = await this._resolveTermWithContext(key, crateContext, contextDocuments);
        const resolvedWithRoCrateContext = await this._resolveTermWithContext(key, roCrateContext, contextDocuments);

        if (typeof resolvedWithRoCrateContext !== 'string' || !resolvedWithRoCrateContext.includes(':')) {
          return {
            pass: false,
            error: `Entity key "${key}" does not resolve to an absolute URI with the RO-Crate context`
          };
        }

        if (resolvedWithCrateContext !== resolvedWithRoCrateContext) {
          return {
            pass: false,
            error: `Entity key "${key}" resolves differently with crate context (${resolvedWithCrateContext}) than RO-Crate context (${resolvedWithRoCrateContext})`
          };
        }
      }
    } catch (e) {
      return { pass: false, error: `Failed to resolve entity keys against context: ${e.message}` };
    }

    return { pass: true, error: null };
  }

  // Rule: detached-file-ids
  detachedFileIdsEntity(inputString) {
    let entity;
    try {
      entity = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Entity is not valid JSON' };
    }

    if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
      return { pass: false, error: 'Entity must be a JSON object' };
    }

    if (!this._entityHasFileType(entity)) {
      return { pass: true, error: null };
    }

    const id = entity['@id'];
    if (typeof id !== 'string' || (!this._isAbsoluteIri(id) && !this._isRelativeIri(id))) {
      return { pass: false, error: 'File entity @id must be a fully specified IRI or a relative IRI' };
    }

    const idIsRelative = this._isRelativeIri(id);
    const hasContentUrl = Object.prototype.hasOwnProperty.call(entity, 'contentUrl') || Object.prototype.hasOwnProperty.call(entity, 'contentURL');
    if (idIsRelative && !hasContentUrl) {
      return { pass: false, error: 'File entities with a relative @id must have a contentUrl property' };
    }

    if (hasContentUrl) {
      const contentUrl = Object.prototype.hasOwnProperty.call(entity, 'contentUrl') ? entity.contentUrl : entity.contentURL;
      const contentUrls = Array.isArray(contentUrl) ? contentUrl : [contentUrl];
      if (contentUrls.length === 0 || !contentUrls.every(value => this._isAbsoluteIri(value))) {
        return { pass: false, error: 'File entity contentUrl must be a fully specified IRI or an array of fully specified IRIs' };
      }
    }

    if (!Object.prototype.hasOwnProperty.call(entity, 'contentSize') || entity.contentSize === undefined || entity.contentSize === null) {
      return { pass: false, error: 'File entity must have a contentSize property' };
    }

    return { pass: true, error: null };
  }

  // Rule: detached-mode-constraints-satisfied
  detachedModePackagingConstraintsSatisfied(inputString) {
    let doc;
    try {
      doc = JSON.parse(inputString);
    } catch (e) {
      return { pass: false, error: 'Document is not valid JSON' };
    }

    const graph = doc['@graph'];
    if (!Array.isArray(graph)) {
      return { pass: false, error: 'Document does not have an @graph array' };
    }

    for (const entity of graph) {
      if (!entity || typeof entity !== 'object' || Array.isArray(entity)) {
        continue;
      }

      if (!this._entityHasFileType(entity)) {
        continue;
      }

      const result = this.detachedFileIdsEntity(JSON.stringify(entity));
      if (!result.pass) {
        return {
          pass: false,
          error: entity['@id']
            ? `File entity ${entity['@id']} failed detached-file-ids validation: ${result.error}`
            : `A File entity failed detached-file-ids validation: ${result.error}`
        };
      }
    }

    return { pass: true, error: null };
  }

  // Add more rule methods as needed
}

module.exports = { Roc2Validator };
