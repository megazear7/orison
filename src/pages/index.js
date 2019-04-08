const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';
import { markdown } from '../../bin/orison-esm.js';

export default () => layout(html`
  <p>Example page</p>
  ${title('Hello, World!')}
  ${markdown('./src/partials/documentation/cli.md')}
  ${markdown('./src/partials/documentation/programatic.md')}
  ${markdown('./src/partials/documentation/pages.md')}
  ${markdown('./src/partials/documentation/partials.md')}
  ${markdown('./src/partials/documentation/layouts.md')}
`);
