const { html } = require('@popeindustries/lit-html-server');
import title from '../partials/title.js';
import layout from './layout.js';
import { markdown } from '../../bin/orison-esm.js';

export default layout(html`
  <p>Example page</p>
  ${title('Hello, World!')}
  ${markdown('./src/partials/documentation/cli.md')}
`);
