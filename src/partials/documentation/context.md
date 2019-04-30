## Context

```
context.path
context.data
context.local
context.parent
context.root
context.parents
context.children
context.mdString
context.mdFile
```

The local, parent, and root properties return `OrisonDirectory` objects. The
parents and children return arrays of `OrisonDirectory` objects.

### Child Directories

The `context.local.children` property provides an array of `OrisonDirectory` objects
Each item in the array has the following attributes and methods:

These attributes give you access to the child data.json files, the
path of each child, and the `parent` and `children` methods can be used to
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
  ${context.local.children.map(child => html`
    <a href="${child.path}"
       class="${context.page.path.startsWith(child.path) ? 'active' : ''}">
       ${child.data.title}
    </a>
  `)}
`;
```

The context object is also available from html files as well.

#### /src/pages/index.html
```html
<a href="/" class="${context.page.path === '/index.js' ? 'active' : ''}">Begin</a>
${context.local.children.map(child => html`
  <a href="${child.path}"
     class="${context.page.path.startsWith(child.path) ? 'active' : ''}">
     ${child.data.title}
  </a>
`)}
```

### Root Directory

```js
export default context => html`
  ${context.root}
`
```

### Parent Directories

```js
export default context => html`
  ${context.parents}
`
```
