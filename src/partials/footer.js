const { html } = require('@popeindustries/lit-html-server');

export default parentData => html`
  <footer>
    <h3>OrisonJS</h3>
    <ul>
      <li><a href="https://github.com/megazear7/orison" rel="noopener">Github</a></li>
      <li><a href="https://www.npmjs.com/package/orison" rel="noopener">NPM</a></li>
      <li><a href="/full-api">Full API</a></li>
      <li><a href="/license.html">License</a></li>
      <li><a href="/about.html">About</a></li>
    </ul>
    <ul>
      <li><a href="https://www.alexlockhart.me" rel="noopener">Alex Lockhart</a></li>
      <li><a href="https://www.buymeacoffee.com/alexlockhart">Support</a></li>
      <li><a href="https://www.patreon.com/alexlockhart">Patreon</a></li>
    </ul>
    <p>Icons made by <a href="https://www.freepik.com/" title="Freepik" rel="noopener">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon" rel="noopener">www.flaticon.com</a> are licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener">CC 3.0 BY</a></p>
  </footer>
`;
