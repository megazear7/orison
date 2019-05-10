import { html } from '@popeindustries/lit-html-server';

export default context => html`
  ${context.mdFile('./src/partials/documentation/jsdocs.md')}
`;
