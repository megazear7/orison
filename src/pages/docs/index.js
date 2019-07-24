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
      <p>
        <div>For example we can call the example loader that we defined above twice. The list below was generated in this way. The first call will hit the loader defined at /src/loaders.js. The second call will hit the cache and the loader at /src/loader.js will not be hit:</div>
        <ol>
          <li>${await context.loaders.example('ABC')}</li>
          <li>${await context.loaders.example('ABC')}</li>
        </ol>
      <p>
    </section>
  `;
};
