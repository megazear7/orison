import { html } from '@popeindustries/lit-html-server';

export default context => html`
  <section>
    <div>
      <a href="https://app.netlify.com/start/deploy?repository=https://github.com/megazear7/orison-netlify-starter-kit">
        <img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify">
      </a>
    </div>
  </section>
  <section>${context.mdFile('./src/partials/documentation/setup.md')}</section>
  <section>${context.mdFile('./src/partials/documentation/getting-started.md')}</section>
  <section>${context.mdFile('./src/partials/documentation/build.md')}</section>
  <section>
    <p>${context.data.libraryMessage}</p>
    <ol>
      <li><a href="https://github.com/popeindustries/lit-html-server" rel="noopener">lit-html-server</a></li>
      <li><a href="https://github.com/Polymer/lit-html" rel="noopener">lit-html</a></li>
      <li><a href="https://github.com/expressjs/express" rel="noopener">express</a></li>
      <li><a href="https://github.com/markdown-it/markdown-it" rel="noopener">markdown-it</a></li>
    </ol>
  </section>
`;
