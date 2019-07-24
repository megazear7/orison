const { html } = require('@popeindustries/lit-html-server');

export default parentData => html`
  <footer>
    <h3>OrisonJS</h3>
    <p>
      <a href="https://github.com/megazear7/orison" rel="noopener">Github</a> -
      <a href="https://www.npmjs.com/package/orison" rel="noopener">npm</a> -
      <a href="/license.html">License</a> -
      <a href="/about.html">About</a>
    </p>
    <p>
      Author: <a href="https://www.alexlockhart.me" rel="noopener">Alex Lockhart</a>
    </p>
    <p>Icons made by <a href="https://www.freepik.com/" title="Freepik" rel="noopener">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon" rel="noopener">www.flaticon.com</a> are licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank" rel="noopener">CC 3.0 BY</a></p>
  </footer>
`;
