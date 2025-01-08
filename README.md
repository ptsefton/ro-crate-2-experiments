# ro-crate-2-experiments


THIS IS A DRAFT, testing out some ideas for structuring v2 of Research Object Crate (RO-Crate)

Design goals:
-  Focus on tool implementers (as per the stated goal of RO-Crate) NOT just examples <https://github.com/ResearchObject/ro-crate/issues/386>
-  Make the core spec very tight -- remove distractions such as the PCDM things I put in, these are useful but should be considered matters for profiles 
-  Cut down the context to ONLY things mentioned in the spec?  <https://github.com/ResearchObject/ro-crate/issues/385>
- Deal with JSON-LD features such as @value and @language (instead of plain string values) which are note explicitly covered -- PROPOSAL IS TO TURN THEM INTO PROPERTY VALUES
- Add new levels of conformance so that a document can be parsed and THEN checked to see if it is a package.
  - New Built-in Profiles that handle RO-Crate Packaging - Local vs Detatched
  -  Strip back context to only terms used 


