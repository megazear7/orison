import { html } from '@popeindustries/lit-html-server';
import nav from '../partials/nav.js';

export default context => html`
  <section>${context.mdFile('./src/partials/documentation/setup.md')}</section>
  <section>${context.mdFile('./src/partials/documentation/getting-started.md')}</section>
  <section>${context.mdFile('./src/partials/documentation/build.md')}</section>
  <section>
    <p>${context.local.data.libraryMessage}</p>
    <ol>
      <li><a href="https://github.com/popeindustries/lit-html-server">lit-html-server</a></li>
      <li><a href="https://github.com/Polymer/lit-html">lit-html</a></li>
      <li><a href="https://github.com/expressjs/express">express</a></li>
      <li><a href="https://github.com/markdown-it/markdown-it">markdown-it</a></li>
    </ol>
  </section>
`;
