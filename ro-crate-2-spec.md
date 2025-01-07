
THIS IS A DRAFT, testing out some ideas for structuring v2 of Research Object Crate (RO-Crate)

Design goals:
-  Focus on tool implementers (as per the stated goal of RO-Crate) NOT just examples <https://github.com/ResearchObject/ro-crate/issues/386>
-  Make the core spec very tight -- remove distractions such as the PCDM things I put in, these are useful but should be considered matters for profiles 
-  Cut down the context to ONLY things mentioned in the spec?  <https://github.com/ResearchObject/ro-crate/issues/385>
- Deal with JSON-LD features such as @value and @language (instead of plain string values) which are note explicitly covered  -- TODO NOT SURE HOW YET
- Add new levels of conformance so that a document can be parsed and THEN checked to see if it is a package.
  - New Built-in Profiles that handle RO-Crate Packaging - Local vs Detatched??
  -  Strip back context to only terms used 


# Specification outline

RO-Crate is a data _Packaging_ specification which allows for detailed, rigorous linked-data metadata to be provided for a dataset, with a _Local_ collection of files or _Detached_, web-based, data. RO-Crate allows for detailed context to be provided for data down to and inside-of the File level.

While RO-Crate metada is compliant JSON-LD it is designed so that it may be processed by tools which _do not_ implement the full JSON-LD specification. 

RO-Crate conventions can also be used for describing entities other than datasets for applications where an easy-to-implement linked-data tool-set is required. As an example, the abstract the Schema.org vocabulary, which is a set of RDF classes and properties can be described and extended using an RO-Crate Metadata Document as a container. 



RO-Crate 2.0 specifies two levels of conformance for a text-string known as the RO-Crate Metadata Document.

- *Syntactically valid*: The string can be parsed into an _RO-Crate Metadata Object_ which has structural conformance with this specification. (It is JSON, it is valid JSON-LD with a `@graph` and `@context` key which meet certain constraints).
  
  RO-Crate Metadata objects are the basis of RO-Crate packaging, but can be used for non-packaging purposes as well.

  An RO-Crate Metadata Document (whether or not is is a valid package) may have rich contextual information about the data, how it was collected  and by whom, with details of funding, related information, equipment and facilities, or about abstract entities.  The details of this contextual information are the domain of `RO-Crate Profiles` which are concerned with semantics. Profiles are guides with optional validation services that describe how to use RO Crate Metadata for a particular purpose, such as interchanging workflow software, or structuring a archival repository of document.

- *Valid Package*: The _Syntactically Valid RO-Crate Metadata Document_ also meets the semantic constraints to need to be an _RO_Crate Package_:
    - The _Root Entity_ conformsTo the _Default RO-Crate Packaging Profile_, which specifies the required  and recommended properties of the _Root Entity_ . In RO-Crate v2 conformance with this profile  is  optional and is indicated by the a reference to the _Default RO-Crate Packaging Profile_ as one of the values of the `conformsTo` proprties. When processing legacy crates with version <2 this conformance is assumed, as previous versions of RO-Crate included these requirements.

    There are two types of _RO-Crate Package_:
    -  A _Detached RO-Crate Package_:
        - Is defined by a stand alone RO-Crate metadata document which may be stored in a file or distributed via an API
        - If stored in a file, the filename SHOULD be `${slug}-ro-crate-metadata.json` where the variable `$slug` is a human readable version of the dataset's ID or name.
        - The _Root Entity_ has a conformsTo property which references the _Detached RO-Crate Package Profile_
    -  A _Local RO-Crate Package_ meets all the criteria of a _Detached RO-Crate Package_ with the additional constraints that it:
       - Is defined within a file-system-like service as a directory (the _RO-Crate Root_) with the RO-Crate Metadata Document saved in a file-like entity with a file name of `ro-crate-metadata.json`.
       - References to files and directories in the RO-Crate Metadata Document are present in the RO-Crate.
       - The _Root Entity_ has a conformsTo property which references the _Local RO-Crate Package Profile_






# RO-Crate rules

## Rule ROCOBJ _RO-Crate metadata document_ is a JSON_LD document which can be parsed to make an _RO-Crate Metadata Object_

This section specifies the rules that are used to check that a potential _RO-Crate Metadata Document is a string which conforms to this general structure.

`
{
    "@context" : "",
    "@graph" : [

    ]
}
`


`
### Rule ROCJSON: The RO-Crate metadata document MUST be valid JSON 

Implementation hint: Client software should attempt to parse a potential RO-Crate Metadata Document as a JSON string using the language's default JSON parser.

Error Code: ERR_RCOJSON `The document does not parse as JSON: ${Pass though error from the JSON parser}`


### Rule ROC-CXT: The _RO-Crate metadata Object_ MUST have a  compliant @context 

#### Rule ROC-CXT-KEY: The _RO-Crate metadata Object_ has a top level key `@context`

Implementation hint: Clients should check for the existence of a key "@context" in the _RO-Crate metadata Object_.

Error Code: ERR_ROCCTXKY `The RO-Crate metadata Object does not have a top level key, @context `.


### Rule: ROC-CXT-ROC one value of `@context` MUST be a string starting with INSERT URL TO CONTEXT

Implementation note: Cast the value of `@context` to an array. The Context array must contain one value that matches the RO-Crate 2 context URL


Error: `The RO-Crate Metadata Object does not have a Context beginning with https://TOTO`


## ROC-GPH : The @graph is an array of JSON-LD entities which are flattened and compacted according to the JSON-LD specification

### Rule ROC-GPH-KEY: There MUST  a `@graph` key

There must be a top-level

Error: `The document does not have a top level key @context `.


TODO:
 Each entity in the graph MUST have a @id property which is unique in the @graph array

 Each entity in the graph MUST have a @type with at least one string value
 
 Each entity in the graph MUST be flattened - that is embedded objects must ONLY have @id, @value, @language properties 

## Rule ROC-MED There MUST be an entity with the @id of "ro-crate-metadata.json" 

The entity with @id `ro-crate-metadata.json`  is known as the RO-Crate Metadata Descriptor

### Rule ROC-MED-TYP: The RO-Crate Metadata Descriptor MUST have one @type of "Creative Work"

### Rule ROC-MED-COT: The RO-Crate Metadata Descriptor MUST have a at least one conformsTo property that matches {"@id": "TODO"}


### Rule ROC-MED-ABT:The RO-Crate Metadata Descriptor MUST have an `about` property which is a reference to an another entity present in the '@graph',  which entity is known as the  _Root Entity_


### Rule ROC-MED-ONE: If the Context indicates that this is an RO-Crate version is less than 2.0 then clients MUST act as if the _Root Entity_ has a conformsTo property that references the "_Base RO-Crate Distribution Profile_"* 

\*Conversely if the RO-Crate version is 2.x then no assumption is made that that an _Syntactially Valid RO-Crate Metadata Document_ is intended to be a data distribution.

If all the points in 1 are satisfied the RO-Crate Metadata Document is said to be "Syntactically Correct RO-Crate compliant JSON"

# Default RO-Crate Packaging Profile




# RO-Crate Packaging

When RO-Crate conventions are used to package data

## Rule ROC-PAK-DST: All RO-Crate packages, Local or Detatched MUST conform to the _Base RO-Crate Distribution Profile_

### Rule ROC-PAK-DET 


Data entities may have @ids that are Relative URIs - if they do then they MUST have contentURL

else @ids must be fully qualifies URIs




### Rule ROC-PAK-LOC-URL

Data entities (of type File or Dataset) MAY have URL IDs

#### Rule ROC-PAK-LOC-REL DATA entities may have relative URIs for IDs

IF there is a contentURL then the File  may or may not be present, and it is assumed that it may be fetched from contentUrl

ELSE the file must be present




