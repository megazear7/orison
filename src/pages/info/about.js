import { html } from '@popeindustries/lit-html-server';
import OrisonDirectory from '../../../bin/orison-directory.js';

export default async function() {
  const file = new OrisonDirectory(__dirname);
  const data = await file.getData();
  const layout = await file.getLayout();
  const parentData = await file.getParent().getData();

  return layout(html`
    <p>About page</p>
    <p>${parentData.title}</p>
    <a href="${data.link.url}">${data.link.title}</a>
  `);
}
