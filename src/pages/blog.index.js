const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';

export default () => [
  {
    name: 'blog-a',
    html: layout(html`<p>Blog A</p>`),
  },
  {
    name: 'blog-b',
    html: layout(html`<p>Blog B</p>`),
  },
  {
    name: 'blog-c',
    html: layout(html`<p>Blog C</p>`),
  }
];
