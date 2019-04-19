const { html } = require('@popeindustries/lit-html-server');
import title from './title.js';

export default () => html`
  <header>
    ${title('OrisonJS')}
    <div>
      <img src="/icons/icon-256x256.png">
    </div>
    <p>A static site generator and server based upon lit-html</p>
  </header>
`;
