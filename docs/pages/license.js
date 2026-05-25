import { html } from 'orison';

export default context => html`
  <section>${context.mdFile('./src/partials/license.md')}</section>
`;
