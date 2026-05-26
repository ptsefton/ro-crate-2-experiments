


# RO-Crate v2.0 Working group

This is an **experimental** working draft of an RO-Crate 2.0 specification.

Authors:
- Peter (PT) Sefton (UQ ANU)
- Michael Lynch (University of Syndey)



## Changes from previous RO-Crate versions

RO-Crate version 1.x crates are compatible with the rules in this specification - which specifies modes of operation for software to process, repair and upgrade RO-Crate Linked Data documents.



# Specification summary


RO-Crate is suitable for data description and packaging as well as describing abstract entieis. It allows for detailed, rigorous Linked Data metadata to be provided for a dataset, with a _Local_ collection of files or _Detached_, web-based, data.

RO-Crate Linked Data represented in JSON-LD using a set of strictly designed conventions which represent a subset of the JSON-LD specification with the aim that it may be processed by tools which _do not_ implement the full JSON-LD specification and easily implemented in a variety of programming languages.

RO-Crate conventions can also be used for describing entities other than datasets, for example RO-Crate can be used to express Linked Data Schema such as Schema.org, and Profiles of RO-Crate of RDF classes and properties can be described and extended using an RO-Crate Linked Data Document as a container. 



## Structure of this specification

### Core use-case - Data packaing

The origin of RO-Crate was as a data packaging standard.

RO-Crate 2.0 specifies two levels of conformance for a text-string, known as the _RO-Crate Linked Data Document_.

- *RO-Crate Linked Data Document_ *: The _RO-Crate Linked Data Document_ string can be parsed into an _RO-Crate Linked Data Object_ which has structural conformance with this specification. (It is JSON, it is valid JSON-LD with a `@graph` and `@context` key and has an entry point).
  
  _RO-Crate Linked Data Objects_ are the basis of RO-Crate packaging, but can be used for non-packaging purposes as well.

  An RO-Crate Linked Data Document, whether or not is is a valid package according to Level 1 of this speficication, contains a linked-data graph of JSON-LD entities with a 'Root Entity' serving as an entry-point into the graph.
  


- *Valid Package*: The _Syntactically Valid RO-Crate Linked Data Document_ also meets the semantic constraints to need to be an _RO_Crate Package_:
    - The _Root Entity_ conformsTo the _Default RO-Crate Distribution Profile_, which specifies the required  and recommended properties of the _Root Entity_ . In RO-Crate v2 conformance  with this profile  is  optional and is indicated by the a reference to the URL of _Default RO-Crate Distribution Profile_ as one of the values of the `conformsTo` properties. When processing legacy crates with version <2 this conformance is assumed (as previous versions of RO-Crate included these requirements as part of the specification).

- There are two types of _RO-Crate Package_:
    -  A _Detached RO-Crate Package_:
        - Is defined by a stand alone RO-Crate Linked Data document which may be stored in a file or distributed via an API.
        - If stored in a file, the filename SHOULD be `${slug}-ro-crate-metadata.json` where the variable `$slug` is a human readable version of the dataset's ID or name.
        - The _Root Entity_ has a conformsTo property which references the $URL#
    -  A _Attached RO-Crate Package_ has the following constraints:
       - It is defined within a file-system-like service as a directory (known as the _RO-Crate Root_) with the RO-Crate Linked Data Document saved in a file-like entity with a file name of `ro-crate-metadata.json`.
       - References to files and directories in the RO-Crate Linked Data Document are present in the RO-Crate.
       - The _Root Entity_ has a conformsTo property which references the _Local RO-Crate Package Profile_






