const { html } = require('@popeindustries/lit-html-server');
import title from '../partials/title.js';
import layout from './layout.js';

export default layout(html`
  <p>Example page</p>
  ${title('Hello, World!')}
`);
