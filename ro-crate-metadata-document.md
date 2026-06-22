# RO-Crate metadata document    

This part of the RO-Crate specification sets out the requirements for a document (a string) to be considered an RO-Crate Metadata Document.

There are three conformance levels as shown in this summary:


![RO-Crate Conformance Level 0 Flowchart](generated/ro-crate-conformance-flowchart-level0.svg)



## Conformance Level 0: Structurally correct RO-Crate Metadata Document <a name='rule:level-0-roc-metadata-doc'>

### Summary

The document-string:
- parses as JSON
- has a basic JSON-LD flattened @graph structure 
 - a single @context at the root level and 
 - *RO-Crate Metadata descriptor entity* with a singleton @type value of `http://schema.org/CreativeWork` that references another entity in the graph, known as the RO-Crate Root Entity. 
- Entities in the graph are flattenend, and contain only scalar values, references by `@id` or `@value` nodes. 

### Exit point

Documents that comply with the following rules can be used in linked-data applications that require a graph of entities in a predicatable format.

### Rule: Document is valid  JSON <a name='rule:roc-metadata-doc-is-JSON'>

The RO-Crate Document String is valid JSON.

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-is-JSON/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-is-JSON/validate.test.cjs)


#### Rule: Document has a @context key <a name='rule:roc-metadata-doc-has-context'>

The @context may be a single scalar value or an array.

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-has-context/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-has-context/validate.test.cjs)





### Rule: Document has a @graph key whose value is an array <a name='rule:roc-metadata-doc-has-graph'>

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-has-graph/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-has-graph/validate.test.cjs)



##### Rule: Every entity in the @graph array conforms to RO-Crate constraints <a name='rule:entities-conform'>



###### Rule: Entity has an @id <a name='rule:entity-id'>

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/entity-id/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/entity-id/validate.test.cjs)

###### Rule: Entity has an @type with at least one string value <a name='rule:entity-type'>

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/entity-type/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/entity-type/validate.test.cjs)

###### Rule: Each key in the entity has either a singleton or an array of string values, a JSON-LD @value with no @context key,  or is an entity reference  <a name='rule:entity-values'>

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/entity-values/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/entity-values/validate.test.cjs)

NOTE: the definition of a value object is per the JSON-LD 1.1 specification but RO-Crate does NOT allow for @context [JSON-LD Value Object](https://www.w3.org/TR/json-ld11/#value-objects)



####### Rule: file Entity id is a path or a URI <a name='rule:filentity-id'>

#### Rule: @graph contains a RO-Crate Metadata Descriptor with @id = "ro-crate-metadata.json" <a name='rule:@graph-has-a-metadata-descriptor'> and an "about" property referencing another entity in the graph

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-has-metadata-descriptor/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-0-roc-metadata-doc/roc-metadata-doc-has-metadata-descriptor/validate.test.cjs)

NOTE: conformance to a particular RO-Crate version can be checked using MASP 


## Conformance Level 1:  RO-Crate Metadata Document indicates RO-Crate conformance  <a name='rule:level-1-roc-metadata-doc-is-an-ro-crate'>

### Summary
Document indicates sytactic/structural conformance with a published version of RO-Crate, and validates against the relevant RO-Crate profile.

TODO: Specify an end point to download a list of allowable versions.

TODO: Other general guidance (how do I represent people’s contributions, funding, provenance) covered in a series of general-purpose MASP schemas and profiles which may be illustrative or formal.

### Exit point
Documents that comply with this level can be used to generate a visualization such as ro-crate-preview.html or processed for analytical purposes.

### Summary
Documents that comply with this level:
-  Are explicitly versioned RO-Crate metadata Documents


### Rule: @context includes exactly one RO-Crate URI  <a name='rule:roc-metadata-doc-has-ro-crate-context'>

[Test data](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-1-roc-metadata-doc-is-an-ro-crate/roc-metadata-doc-has-ro-crate-context/data/)

[Tests](/Users/pt/working/ptsefton/ro-crate-2-experiments/test/rule-level-1-roc-metadata-doc-is-an-ro-crate/roc-metadata-doc-has-ro-crate-context/validate.test.cjs)

TODO: Given that we have this context -- do we really need to duplicate this in a conformsTo that points to an RO-Crate?

### Rule: each key in the entity resolves to URI in a way that does not change the way it would resolve with only the relevant RO-Crate context <a href="#rule:keys-resolve-to-ro-crate-context">

The intent of this rule is that the @context for the RO-Crate does not break 'native' RO-Crate mappings, eg a crate wich maps "name" to something other than "http://schema.org/name"

TODO: (copilot) If we later need to validate this beyond a simple URI pattern match, the jsonld.js library already has the internal `ContextResolver` used by `jsonld.processContext()`, `jsonld.expand()`, and `jsonld.frame()`. The relevant internals are `ContextResolver.resolve()`, `_resolveRemoteContext()`, `_fetchContext()`, and `_resolveContextUrls()`, but these are not exposed as a separate public context-resolver API, so we would need to wire that in through the library options or import the internal module directly.

### Rule: <a name='rule:metadata-descriptor-has-conformsTo'>

TODO: Not sure if we need this??

#### Rule: conformsTo includes a published RO-Crate specification URI <a name='rule:conformsTo-includes-published-spec-uri'>

#### Rule: RO-Crate version URI is recognized as allowable <a name='rule:ro-crate-version-uri-recognized'>

### Rule: RO-Crate Metadata-document MASP-validates agains the relevant versioned RO-Crate <a name='rule:metadata-doc-validates-against-versioned-ro-crate'>


- Minimum metadata on root data entity
name, date etc

File entity @id constraints  must be a URI, full or relative -- not # not _

NOTE: MASP can't do this yet needs regex language use SCHACL's version?

SHACL regex is SPARQL https://www.w3.org/TR/sparql11-query/#func-regex -- which is XPath/XQuery 




## Conformance Level 2: Packaging Conformance Level 2


### Summary

The for a valid RO-Crate data package:
 There must be always be an RO-Crate Metadata Document which conforms to the basic RO-Crate Core Profile (Has a name, date, license whatever)


Then this can be validated against the metadata profile for RO-Crate 2.0 (or an earlier version) using a MASP profile.


-  Detached
   - All Data Entities must have full URIs
- Attached Any data entities with relative URIs must be present
- Attached-sparse all data entites with relative URIs for @ids must be present OR have one or more url parameters where a file may be fetched, and a checksum  
-  Archival - Data entities with relative URIs must be present and all files must be described in the RO-Crate Metadata Document with a checksum


TODO: Could we indicate this

#### Rule: Detached mode packaging constraints are satisfied <a name='rule:detached-mode-constraints-satisfied'>


##### Rule: For every entity which has a @type value of "File" entity must have an "@id" property which is a fully specified IRI, or a relative IRI. If the @id is relative, then a contentURL property must also be present, either as a singleton or a list where all the values are fully specified IRIs, and a contentSize property must also be present <a name='rule:detached-file-ids'>


TODO: Checksum method

Note: The potential for a list of contentURLs allows for a some redundancy.

#### Rule: Attached mode packaging constraints are satisfied <a name='rule:attached-mode-constraints-satisfied'>

##### Rule: the *RO-Crate Root Directory* contains an RO-Crate metadata document named ro-crate-metadata.json <a name='rule:metadata-file-name-ro-crate-metadata-json'>

##### Rule: For every entity which has a @type value of "File" entity, if the @id is relative there must be a file present at the path represented by the @id, relative to the RO-Crate Root Directory. If there is a contentSize, that must match the file's length in bytes  <a name='rule:attached-files-present'>










