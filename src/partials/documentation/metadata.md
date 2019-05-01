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

The only reserved key of the `orison` property is the "order" key which determines the order
of the `children` context property.

### Public Metadata

Any JSON in the `public` property will be made available at the corresponding url. For example the following data.json file:

#### /src/pages/data.json
```json
{
  "public": {
    "example": "Hello, World"
  }
}
```

Will cause this JSON:

```
{
  "example": "Hello, World"
}
```

To be built to the /docs/data.json file and will be available at localhost:3000/data.json.

This allows you to make some metadata publicly available to client side code.
