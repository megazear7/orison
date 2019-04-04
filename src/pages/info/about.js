const { html } = require('@popeindustries/lit-html-server');
import { OrisonFile } from '../../../bin/build.js';
const file = new OrisonFile(__dirname);

export default file.getLayout().then(layout => layout(html`
  <p>About page</p>
`));
