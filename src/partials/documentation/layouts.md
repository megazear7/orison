## Layouts

```js
const { html } = require('@popeindustries/lit-html-server');

export default page => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OrisonJS</title>
  </head>
  <body>
    <div>Website header</div>
    ${page}
    <div>Website footer</div>
  </body>
</html>
`;
```
