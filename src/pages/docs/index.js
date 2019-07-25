import { html } from '@popeindustries/lit-html-server';

export default async context => {
  return html`
    <section>${context.mdFile('./src/partials/documentation/single-pages.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/list-pages.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/partials.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/layouts.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/context.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/metadata.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/programatic.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/unsafe-html.md')}</section>
    <section>${context.mdFile('./src/partials/documentation/proxy.md')}</section>
    <section>
      ${context.mdFile('./src/partials/documentation/loaders.md')}
      <ol>
        <li>${await context.loaders.example('ABC')}</li>
        <li>${await context.loaders.example('ABC')}</li>
      </ol>
      ${context.mdFile('./src/partials/documentation/programatic-loaders.md')}
      <ol>
        <li>${await context.loaders.anotherExample('123')}</li>
        <li>${await context.loaders.anotherExample('123')}</li>
      </ol>
    </section>
  `;
};
