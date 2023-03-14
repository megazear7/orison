const { html } = require('@popeindustries/lit-html-server');
import title from './title.js';

export default pageTitle => html`
  <header>
    ${title(pageTitle)}
    <div>
      <img alt="Orison smoking pipe icon" width="255px" height="255px" src="/icons/icon-256x256.png">
    </div>
    <p>A static site generator and server based upon lit-html</p>
  </header>
`;
