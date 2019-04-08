const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';
import { markdown } from '../../bin/orison-esm.js';

export default () => layout(html`
  <section>${title('Orison')}</section>
  <section>${markdown('./src/partials/documentation/cli.md')}</section>
  <section>${markdown('./src/partials/documentation/programatic.md')}</section>
  <section>${markdown('./src/partials/documentation/pages.md')}</section>
  <section>${markdown('./src/partials/documentation/partials.md')}</section>
  <section>${markdown('./src/partials/documentation/layouts.md')}</section>
`);
