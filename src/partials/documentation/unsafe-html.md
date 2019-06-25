## Unsafe HTML

#### /src/pages/example.js
```js
import { html, unsafeHTML } from 'orison';
import someCMS from 'some-cms';

const htmlFromCMS = comeCMS.get('...');

export default context => html`
  ${unsafeHTML(htmlFromCMS)}
`
```
