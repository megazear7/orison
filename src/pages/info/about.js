import { html } from '@popeindustries/lit-html-server';
import OrisonFile from '../../../bin/orison-file.js';

export default async function() {
  const file = new OrisonFile(__filename);
  const data = await file.getData();
  const layout = await file.getLayout();

  return layout(html`
    <p>About page</p>
    <a href="${data.link.url}">${data.link.title}</a>
  `);
}
