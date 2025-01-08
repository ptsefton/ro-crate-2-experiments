


_RO-Crate 2.0 Specification URL_: https://w3id.org/ro/crate/2.0-DRAFT
_RO-Crate 2.0 Specification Syntax URL_: https://w3id.org/ro/crate/2.0-DRAFT#Syntax
_RO-Crate 2.0 Specification Detached Package URL_: https://w3id.org/ro/crate/2.0-DRAFT#DetatchedPackage
_RO-Crate 2.0 Specification LOCAL Package URL_: https://w3id.org/ro/crate/2.0-DRAFT#LocalPackage
_RO-Crate 2.0 Default Distribution Profile_: https://w3id.org/ro/crate/2.0/default-disto-profile

_RO-Crate 2.O Context URL_: "https://w3id.org/ro/crate/2.0-DRAFT/context"

## Changes from previous RO-Crate versions

RO-Crate version 1.x crates are included in this specification - which specifies modes of operation for software to process, repair and upgrade RO-Crate metadata documents.

The core RO-Crate specification now specifies ONLY:
- The structure and syntax of an RO-Crate Metadata Document
- The rules for detached and local data packages (presence of Files, how to download a detatched crate etc)

The sections of the 1.x specification dealing with metadata, the root data entity etc have moved to a Profile (https://w3id.org/ro/crate/2.0/default-disto-profile)


All other parts of the specification will be moved to guidelines which do not form part of the specification.




# Specification summary

RO-Crate is a data _Packaging_ specification which allows for detailed, rigorous linked-data metadata to be provided for a dataset, with a _Local_ collection of files or _Detached_, web-based, data. RO-Crate allows for detailed context to be provided for data down to and inside-of the File level.

While RO-Crate metadata is compliant JSON-LD it is designed so that it may be processed by tools which _do not_ implement the full JSON-LD specification. 

RO-Crate conventions can also be used for describing entities other than datasets for applications where an easy-to-implement linked-data tool-set is required. As an example, the abstract the Schema.org vocabulary, which is a set of RDF classes and properties can be described and extended using an RO-Crate Metadata Document as a container. 


RO-Crate 2.0 specifies two levels of conformance for a text-string, known as the _RO-Crate Metadata Document_.

- *Syntactically valid*: The _RO-Crate Metadata Document_ string can be parsed into an _RO-Crate Metadata Object_ which has structural conformance with this specification. (It is JSON, it is valid JSON-LD with a `@graph` and `@context` key which meet certain constraints).
  
  _RO-Crate Metadata Objects_ are the basis of RO-Crate packaging, but can be used for non-packaging purposes as well.

  An RO-Crate Metadata Document (whether or not is is a valid package) may have rich contextual information about the data, how it was collected  and by whom, with details of funding, related information, equipment and facilities, or about abstract entities.  
  
  The details of this contextual information are the domain of _RO-Crate Profiles_ which are concerned with semantics. Profiles are guides with optional validation services that describe how to use RO Crate Metadata for a particular purpose, such as; interchanging workflow software, describing vocabularies/schemas, or structuring archival repositories.

- *Valid Package*: The _Syntactically Valid RO-Crate Metadata Document_ also meets the semantic constraints to need to be an _RO_Crate Package_:
    - The _Root Entity_ conformsTo the _Default RO-Crate Distribution Profile_, which specifies the required  and recommended properties of the _Root Entity_ . In RO-Crate v2 conformance  with this profile  is  optional and is indicated by the a reference to the URL of _Default RO-Crate Distribution Profile_ as one of the values of the `conformsTo` properties. When processing legacy crates with version <2 this conformance is assumed (as previous versions of RO-Crate included these requirements as part of the specification).

    There are two types of _RO-Crate Package_:
    -  A _Detached RO-Crate Package_:
        - Is defined by a stand alone RO-Crate metadata document which may be stored in a file or distributed via an API.
        - If stored in a file, the filename SHOULD be `${slug}-ro-crate-metadata.json` where the variable `$slug` is a human readable version of the dataset's ID or name.
        - The _Root Entity_ has a conformsTo property which references the $URL#
    -  A _Local RO-Crate Package_ has the following constraints:
       - It is defined within a file-system-like service as a directory (known as the _RO-Crate Root_) with the RO-Crate Metadata Document saved in a file-like entity with a file name of `ro-crate-metadata.json`.
       - References to files and directories in the RO-Crate Metadata Document are present in the RO-Crate.
       - The _Root Entity_ has a conformsTo property which references the _Local RO-Crate Package Profile_

TODO: Potential new "RO-Crate Fragment"????


# RO-Crate rules

The Core RO-Crate 2.0 specification is concerned with the syntactical correctness of RO-Crate Metadata documents, and teh conformance of packages and is ordered in a way to guide implementers building RO-Crate software, such as parsers or libraries.

The specification has a number of `Rules`, each of which is assigned a code. Rules are hierarchically grouped.

There are two modes of operation:
- Default: software should run, emit as many errors and success codes as possible, only terminating if it cannot continue (such as the input is not in JSON format)
- Repair Mode: when correctable errors are encountered, software MUST modify the _RO-Crate Metadata Object_ to make it compliant. NOTE: This mode changes the input document in a non-deterministic way so there needs to a be an option for users to save the result as new file, or over-write the original, with informed consent
- Upgrade mode(packageType): This mode will automatically update a pre-v2.0 crate to the new standard creating a new RO-Crate Metadata Object clients SHOULD NOT automatically write this new metadata document over an existing ro-crate-metadata.json file without user consent as this may compromise the integrity of an archival or scholarly process.  This mode may also take a packageType parameter where the value of Package type is "Local" or "Distributed"

Software MUST return an error code for each error that is detected and MUST return a success code if all of the nested rules return no errors.

In JSON-LD values may be presented as singleton values or arrays. In the following rules a singleton value or an an array of length one with the same value are considered to be the same.

<a id="syntax">
</a>

## Rule ROCOBJ _RO-Crate metadata document_ is a JSON_LD document which can be parsed to make an _RO-Crate Metadata Object_

This section specifies the rules that are used to check that a potential _RO-Crate Metadata Document is a string which conforms to this general structure.

The core structure of an RO-Crate is

```javascript
{
    "@context" : "",
    "@graph" : [

    ]
}
```



### Rule ROC-JSN: The RO-Crate metadata document MUST be valid JSON 

Implementation note: Client-software should attempt to parse a potential RO-Crate Metadata Document as a JSON string using the language's default JSON parser and catpture an error message in `$err`.

FATAL Error Code: ERR_RCOJSON `The document does not parse as JSON: ${err}`


### Rule ROC-CXT: The _RO-Crate metadata Object_ MUST have a  compliant @context 

#### Rule ROC-CXT-KEY: The _RO-Crate metadata Object_ has a top level key `@context`

Implementation hint: Clients should check for the existence of a key "@context" in the _RO-Crate metadata Object_.

REPAIR-MODE: The client MUST add  a "@context" key

UPDATE-MODE: Replace older "@context" with latest default context

Error:`The RO-Crate metadata Object does not have a top level key, @context `.


### Rule: ROC-CXT-ROC one value of `@context` MUST be a string starting with INSERT URL TO CONTEXT

Implementation note: Cast the value of `@context` to an array. The Context array must contain one value that matches the RO-Crate 2 context URL


Error: `The RO-Crate Metadata Object does not have a Context beginning with https://TOTO`


## ROC-GPH : The @graph is an array of JSON-LD entities which are flattened and compacted according to the JSON-LD specification

### Rule `ROC-GPH-KEY`: There MUST  a `@graph` key

There must be a top-level

Error: `The document does not have a top level key @graph`.


### Rule `ROC-GPH-ARR`: The value of the `@graph` entry must be a an array

Error: `The @graph is not an array`

### Rule `ROC-GPG-ENT`: Each entity in the @graph must be conformant

Clients MUST iterate over each `$entity` in the @graph array and check it using the following nested rulea.

Implementation note: Building a map of entity `@id`s is a useful thing to here.

#### Rule `ROC-GPG-ENT-IDR`: Each entity in the graph MUST have a @id property

REPAIR-MODE: Assign  `$entity["@id`] to a unique value starting with `#`.


Error: `Entity does not have an @id property: ${entity}`

Implementation note: this simplest way to ensure uniqueness of IDs is to use a UUID - otherwise a scan of all existing `@id`s

#### Rule `ROC-GPG-ENT-UID`: @id property must be unique

Id an @id has been previously detected on another enity then produce an error

REPAIR-MODE: Assign a unique `@id` string which starts with `#` 

Error: `@ids in the graph must be unique - entity["@id"] is not unique`

#### Rule `ROC-GPH-ENT-TYP` Each entity in the graph MUST have a @type with at least one string value

REPAIR-MODE: Add `@type`: "Thing"

Error: `Entity does not have an @type property: ${entity}`

#### Rule `ROC-GPH-ENT-PRP` Each property on the entity other than `@id` and `@type` has a conformant value

#### Rule `ROC-GPH-ENT-PRP-VAL` All properties other than `@id` and `@type` MUST consist of either a single `value` OR an array of values where each value is either a string or a object which is a reference to an identifier of the form `{"@id": "some-value"}`

For each value check that it is either a string or and object that has one `@id` property with a string value.

REPAIR-MODE: IF `value` is a scalar object other than a string  cast it to a string

REPAIR-MODE: ELSE IF `$value` is an object which has a `@value` key. Create a new entity with a unique id beginning with `_` and a type of `PropertyValue` with a `value` property equal to the string containing the value of `@value`. 

REPAIR-MODE: ELSE IF `value` is an object which is not of the form {"@id": "some-value"} add a copy value to the `@graph` array and replace `value` with a reference to the `@id`,  and recursively call the code that deals with Rule `ROC-GPG-ENT` (NOTE: This repair step is a simple JSON-LD flattening algorithm)

\* NOTE: This form of identifier is a JSON-LD _Blank Node_ identifier which in RO-Crate indicates that it should be considered as a nested value that should be displayed inline. 


Error: `Value for property ${property} must be a string or an @id reference: ${value}`

### Rule `ROC-MED` There MUST be an entity with the @id of "ro-crate-metadata.json" 

The entity with @id `ro-crate-metadata.json`  is known as the _RO-Crate Metadata Descriptor_

### Rule `ROC-MED-TY1`: The _RO-Crate Metadata Descriptor_ MUST have `@type` property with a single value 


### Rule `ROC-MED-TYP`: The _RO-Crate Metadata Descriptor_ MUST have `@type` where the value is "Creative Work" or ["Creative Work"]


### Rule `ROC-GPG-MED-CO1`: The RO-Crate Metadata Descriptor MUST have a `conformsTo` property that has one value 


### Rule `ROC-GPG-MED-COT: The RO-Crate Metadata Descriptor conformsTo property is a reference to the _RO-Crate 2.0 Specification URI_ OR to a previous RO-Crate Specificiation URI 


### Rule ROC-MED-ABT:The RO-Crate Metadata Descriptor MUST have an `about` property which has a single value

 is a reference to an another entity present in the '@graph',  which entity is known as the  _Root Entity_


### Rule ROC-MED-ONE: If the Context indicates that this is an RO-Crate version is less than 2.0 then clients MUST act as if the _Root Entity_ has a conformsTo property that references the "_Base RO-Crate Distribution Profile_"* 

\*NOTE: Conversely if the RO-Crate version is 2.x then no assumption is made that that an _Syntactially Valid RO-Crate Metadata Document_ is intended to be a data distribution.

If all the points above are satisfied the RO-Crate Metadata Document is said to be "Syntactically Correct RO-Crate compliant JSON"

# Default RO-Crate Packaging Profile



# RO-Crate Packaging

## Rule ROC-PAK: Data packaging

### Rule ROC-PAK-DAE: Entities of type File or Dataset are considered to be _Data Entities_ which are subject to some constraints on @ids

Rules for interpreting the `@id` of a [File] _Data Entity_ differ in the context of use.
1. For a _Local RO-Crate Package_:
  
2. For a _Detached RO-Crate Package_:
  


<a name="https://w3id.org/ro/crate/2.0-DRAFT#DetachedPackage">
</a>

### Rule ROC-PAK-DET: An _RO-Crate Metadata Object_ is considered to be a Detached RO-Crate Package if it has a conformsTo value that references the _RO-Crate Detached Package Profile_ OR it confoema RO-Crate v1.x and is being processed in "Detached Mode"

### Rule ROC-PAK-DET-DST: Detatched Packages  MUST conform to the _Base RO-Crate Distribution Profile_


### Rule 
 *  IF there is a `contentUrl`: 
      * FOR EACH `$URL` 
        * IF the URL is valid:
            * IF `@id` is a relative URL (`$path`) then this @id is taken to be a hint about when to store the contents of `contentUrl` if the crate is converted from Detatched to Attached
            * ELSE entity is not compliant -- there must be a path to match the content URL
   *  ELSE IF `@id` is an absolute URL entity is considered to a Web based Data Entity EXIT
   *  ELSE entity is not compliant



<a name="https://w3id.org/ro/crate/2.0-DRAFT#LocalPackage">
</a>

## Rule ROC-PAK-LOC: An _RO-Crate Metadata Object_ is considered to be a Local RO-Crate Package if it has a conformsTo value that references {"@id": "https://w3id.org/ro/crate/2.0-DRAFT#LocalPackage"}

## Rule ROC-PAK-LOC-DST: Local Packages MUST conform to the _Base RO-Crate Distribution Profile_

#### Must have a conformsTo value of {"@id": }


*  IF `@id` is a relative path URI (`$path`), test whether a payload file exists in the local file system at `$path` relative to the _RO-Crate Root_:
       *  IF TRUE, (entity is compliant) EXIT
       *  ELSE IF there is a `contentUrl`:  FOR EACH `$URL` IF the URL is valid (entity is considered to be a [Web-based Data Entity](#web-based-data-entity)) EXIT 
       *  ELSE produce an error EXIT
  *  ELSE IF `@id` is a URL (entity is considered to a Web based Data Entity) EXIT
  *  ELSE entity is not compliant
else @ids must be fully qualifies URIs

For RO-Crate 2.0 crates, clients MUST check that the 



