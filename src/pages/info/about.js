const { html } = require('@popeindustries/lit-html-server');
import { OrisonFile } from '../../../bin/build.js';
const file = new OrisonFile(__filename);

export default async function() {
  const data = await file.getData();
  const layout = await file.getLayout();

  return layout(html`
    <p>About page</p>
    <a href="${data.link.url}">${data.link.title}</a>
  `);
}
