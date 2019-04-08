const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';
import { markdown } from '../../bin/orison-esm.js';

export default () => layout(html`
  <p>Example page</p>
  ${title('Hello, World!')}
  ${markdown('./src/partials/documentation/cli.md')}
  ${markdown('./src/partials/documentation/programatic.md')}
  ${markdown('./src/partials/documentation/pages.md')}
  ${markdown('./src/partials/documentation/partials.md')}
  ${markdown('./src/partials/documentation/layouts.md')}
  <div>Icons made by <a href="https://www.freepik.com/" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" 			    title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" 			    title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
`);
