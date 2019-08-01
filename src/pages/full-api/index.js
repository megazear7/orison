import { html } from '@popeindustries/lit-html-server';

export default context => html`
  <section>
    <h2>Full Orison API</h2>
    <p>This API is meant to be an internal API of the Orison implementation. For the public API designed for use by applications refer to the <a href="/api">API page</a>.</p>
  </section>
  ${context.mdFile('./src/partials/documentation/full-jsdocs.md')}
`;
