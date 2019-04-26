## Context

### Child Directories

The `context.root.getChildren()` method will return an array of child directories.
Each item in the array has the following attributes and methods:

1. `parent`
1. `getChildren()`
1. `path`
1. `data`

These attributes and methods give you access to the child data.json files, the
path of each child, and the `parent` and `getChildren` methods can be used to
programmatically navigate the site structure.

The order of the children will be based on the `orison.order` property of the
corresponding data.json files as shown below.

#### /src/pages/first/data.json
```json
{
  "orison": {
    "order": 100
  }
}
```

#### /src/pages/second/data.json
```json
{
  "orison": {
    "order": 200
  }
}
```

In this example the "first" directory will be the first child in the array, and
the "second" directory will be the second child in the array. It is recommended
to use larger numbers so that you can reorder directories without having to
increment each directory.

This can then be used to create navigation elements as shown below. In this example
we are creating the navigation links by getting the children of the root directory.

#### /src/pages/index.js
```js
const { html } = require('orison');

export default context => html`
  <a href="/" class="${context.page.path === '/index.js' ? 'active' : ''}">Begin</a>
  ${context.root.getChildren().map(child => html`
    <a href="${child.path}"
       class="${context.page.path.startsWith(child.path) ? 'active' : ''}">
       ${child.data.title}
    </a>
  `)}
`;
```
