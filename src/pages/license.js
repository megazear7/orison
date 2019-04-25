import { html } from '@popeindustries/lit-html-server';

export default context => html`
  <section>${context.mdFile('./src/partials/license.md')}</section>
`;
