const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import { markdown } from '../../bin/orison-esm.js';

export default () => layout(html`

  <section>${markdown('./src/partials/documentation/setup.md')}</section>
  <section>${markdown('./src/partials/documentation/getting-started.md')}</section>
  <section>${markdown('./src/partials/documentation/programatic.md')}</section>
  <section>${markdown('./src/partials/documentation/single-pages.md')}</section>
  <section>${markdown('./src/partials/documentation/multiple-pages.md')}</section>
  <section>${markdown('./src/partials/documentation/partials.md')}</section>
  <section>${markdown('./src/partials/documentation/layouts.md')}</section>
  <section>
    <p>
      OrisonJS utilizes the following JavaScript libraries:
    </p>
    <ol>
      <li><a href="https://github.com/popeindustries/lit-html-server">lit-html-server</a></li>
      <li><a href="https://github.com/Polymer/lit-html">lit-html</a></li>
      <li><a href="https://github.com/expressjs/express">express</a></li>
      <li><a href="https://github.com/markdown-it/markdown-it">markdown-it</a></li>
    </ol>
  </section>
`);
