const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';
import { markdown } from '../../bin/orison-esm.js';

export default () => layout(html`
  <section class="bold">
    ${title('OrisonJS')}
    <p>A static site generator and server based upon lit-html</p>
  </section>
  <section>${markdown('./src/partials/documentation/cli.md')}</section>
  <section>${markdown('./src/partials/documentation/programatic.md')}</section>
  <section>${markdown('./src/partials/documentation/single-pages.md')}</section>
  <section>${markdown('./src/partials/documentation/multiple-pages.md')}</section>
  <section>${markdown('./src/partials/documentation/partials.md')}</section>
  <section>${markdown('./src/partials/documentation/layouts.md')}</section>
`);
