const { html } = require('@popeindustries/lit-html-server');
import title from './title.js';

export default () => html`
  <header>
    ${title('OrisonJS')}
    <img src="/icons/icon-256x256.png" class="logo">
    <p>A static site generator and server based upon lit-html</p>
    <p>
      Status: pre-release
      <br>
      <a href="https://github.com/megazear7/orison">Github</a> -
      <a href="https://www.npmjs.com/package/orison">npm</a>
    </p>
  </header>
`;
