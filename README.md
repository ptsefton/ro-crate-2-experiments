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



Notes - PT and ML




Take a File entity: 
“Attached” mode: 
The @id is a local path. The following rules are only important when you are working in File system context. (these are extra modes to with how you deal with external resources)
File may be there
File may be not there but there’s a URI where you SHOULD be able to get it - probably schema:url – contingent so  (Sparse crate) 
Not there - is an err
What to do when an @id is a URL and it’s there - how to download into the crate? (extra prop for downloadAsFilePath) then swap that into @id and move the @id to URL

API context:
Use the recommended local path

## Running Tests

This project uses [Mocha](https://mochajs.org/) for conformance testing.

To run all tests:

```
npm test
```

Or directly with:

```
npx mocha
```

Test files are located under the `test/` directory, organized by conformance rule. Good and bad test data for each rule are in their respective `data/good` and `data/bad` folders.

The main validator logic is in `scripts/ro-crate-metadata-doc-validator.js`.

