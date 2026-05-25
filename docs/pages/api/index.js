import { html } from 'orison';

export default context => html`
  ${context.mdFile('./src/partials/documentation/jsdocs.md')}
`;
