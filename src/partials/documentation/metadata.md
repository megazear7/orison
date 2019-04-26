## Metadata

Metadata file are data.json files under the /src/pages hierarchy. They are made
available to pages through the context API. The only restraint to the json file
is that "orison" is a reserved top level key:

#### /src/pages/data.json
```json
{
  ...
  "orison": {
    "order": 100
  }
}
```

Currently the only supported key is the "order" key which determines the order
of the `getChildren()` context method.
