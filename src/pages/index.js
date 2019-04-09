const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';
import { markdown } from '../../bin/orison-esm.js';

export default () => layout(html`
  <section class="bold">
    ${title('OrisonJS')}
    <p>A static site generator and server based upon lit-html</p>
  </section>
  <section>
    <p>
      OrisonJS will interpret a source directory, rendering the contents as html files.
      It can be utilized as a static site generator, rendering the html as a build step or it can be utilized as a web server rendering the html on the fly for server side rendering.
    </p>
    <p>
      It utilized the following JavaScript libraries:
    </p>
    <ol>
      <li><a href="https://github.com/popeindustries/lit-html-server">lit-html-server</a></li>
      <li><a href="https://github.com/Polymer/lit-html">lit-html</a></li>
      <li><a href="https://github.com/expressjs/express">express</a></li>
      <li><a href="https://github.com/markdown-it/markdown-it">markdown-it</a></li>
    </ol>
  </section>
  <section>${markdown('./src/partials/documentation/cli.md')}</section>
  <section>${markdown('./src/partials/documentation/getting-started.md')}</section>
  <section>${markdown('./src/partials/documentation/programatic.md')}</section>
  <section>${markdown('./src/partials/documentation/single-pages.md')}</section>
  <section>${markdown('./src/partials/documentation/multiple-pages.md')}</section>
  <section>${markdown('./src/partials/documentation/partials.md')}</section>
  <section>${markdown('./src/partials/documentation/layouts.md')}</section>
`);
