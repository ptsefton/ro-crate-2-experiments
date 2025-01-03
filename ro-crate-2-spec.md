
THIS IS A DRAFT, testing out some ideas for structuring v2 of Research Object Crate (RO-Crate)

Design goals:
-  Focus on tool implementers (as per the stated goal of RO-Crate) NOT just examples
-  Make the core spec very tight -- remove distractions such as the PCDM things I put in, these are useful but should be considered matters for profiles
-  Cut down the context to ONLY things mentioned in the spec, while still defaulting to 
- Deal with JSON-LD features such as @value and @language (instead of plain string values) which are note explicitly covered  -- TODO NOT SURE HOW YET
- Add new levels of conformance so that a document can be parsed and THEN checked to see if it is a package.
  - New Built-in Profiles that handle RO-Crate Packaging - Local vs Detatched??
  -  Strip back context to only terms used 


# Specification outline

RO-Crate is a data _Packaging_ specification which allows for detailed, rigorous metadata to be provided for a data set, with a _Local_ collection of files or a _Detached_. 

RO-Crate 2.0 specifies two levels of conformance for a text-string known as the RO-Crate Metadata Document.

- *Syntactic*: The string can be parsed into an _RO-Crate Metadata Object_ which has structural conformance with this specification. (It is JSON, it is valid JSON-LD with a `@graph` and `@context` key which meet certain constraints). RO-Crate Metadata objects are the basis of RO-Crate packaging, but can be used for non-packaging purposes as well.
- *Package Semantics*: The _Syntactically Valid RO-Crate Metadata Document_ also meets the semantic constraints to need to be an _RO_Crate Package_:
    - The _Root Entity_ has "Dataset" as one of its types.
    - Must have a set of basic interoperability and discovery metadata (a license for re-use, identifier, author (creator), name, date)

    There are two types of _RO-Crate Package_:
    -  A _Detached RO-Crate Package_:
        - Is defined by a stand alone RO-Crate metadata document which may be stored in a file or distributed via an API
        - If stored in a file, the filename SHOULD be `${slug}-ro-crate-metadata.json` where the variable `$slug` is a human readable version of the dataset's ID or name.
    -  A _Local RO-Crate Package_ meets all the criteria of a _Detached RO-Crate Package_ with the additional constraints that it:
       - Is defined within a file-system-like service as a directory (the _RO-Crate Root_) with the RO-Crate Metadata Document saved in a file-like entity with a file name of `ro-crate-metadata.json`.
       - References to files and directories in the RO-Crate Metadata Document are present in the RO-Crate.

An RO-Crate Metadata Document (whether or not is is a valid package) may have rich contextual information about the data, how it was collected  and by whom, with details of funding, related information, equipment and facilities, or about abstract entities.  The details of this contextual information fall outside of the RO-Crate 2.0 specification, and are the domain of `RO-Crate Profiles`. Profiles are guides with optional validation services that describe how to use RO Crate Metadata for a particular purpose, such as interchanging workflow software, or structuring a archival repository of document.


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


### Rule ROCCXT: The _RO-Crate metadata Object_ MUST have a  compliant @context 

#### Rule ROCXTKY: The _RO-Crate metadata Object_ has a top level key `@context`

Implementation hint: Clients should check for the existence of a key "@context" in the _RO-Crate metadata Object_.

Error Code: ERR_ROCCTXKY `The RO-Crate metadata Object does not have a top level key, @context `.




### Rule: ROCCXTO one value of `@context` MUST be a string starting with INSERT URL TO CONTEXT

Implementation note: Cast the value of `@context` to an array. The Context array must contain one value that matches the RO-Crate 2 context URL



## ROCCXT_: 

Error Code: ERR_ROCCTX `The RO-Crate Metadata Object does not have a Context beginning with https://TOTO`


## ROCGPH : The @graph is an array of JSON-LD entities which are flattened and compacted according to the JSON-LD specification

### Rule ROCGPHKY: There MUST  a `@graph` key

There must be a top-level

Error Code: ERR_ROCCTXKY `The document does not have a top level key @context `.


 Each entity in the graph MUST have a @id property which is unique in the @graph array

 Each entity in the graph MUST have a @type with at least one string value

1.2.5 There MUST be an entity with the @id of "ro-crate-metadata.json" 

The entity with @id "ro-crate-metadata.json"  is known as the RO-Crate Metadata Descriptor

1.2.6 The RO-Crate Metadata Descriptor MUST have one @type of "Creative Work"

1.2.7 The RO-Crate Metadata Descriptor MUST have a at least one conformsTo property that matches {"@id": "TODO"}

1.2.8 The RO-Crate Metadata Descriptor MUST have an `about` property which is a reference to an another entity present in the '@graph',  which entity is known as the  _Root Entity_


If all the points in 1 are satisfied the RO-Crate Metadata Document is said to be "Syntactically Correct RO-Crate compliant JSON"

# RO-Crate Packaging

The main funciton of RO-Crate is as a packaging method to describe locally present or remote file.


