const { html } = require('@popeindustries/lit-html-server');
import { OrisonFile } from '../../../bin/build.js';
const file = new OrisonFile(__filename);
const data = file.getData();

export default file.getLayout().then(layout => {
  return file.getData().then(data => {
    return layout(html`
      <p>About page</p>
      <a href="${data.link.url}">${data.link.title}</a>
    `);
  });
});
