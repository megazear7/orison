## Layouts

```js
import { html } from 'orison';

export default context => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OrisonJS</title>
  </head>
  <body>
    <div>Website header</div>
    ${context.page.html}
    <div>Website footer</div>
  </body>
</html>
`;
```
