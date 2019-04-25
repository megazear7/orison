import { html } from '@popeindustries/lit-html-server';

export default context => {
  return html`
    <section>${context.mdFile('./src/partials/documentation/single-pages.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/list-pages.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/partials.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/layouts.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/programatic.md')}</section>
  `;
};