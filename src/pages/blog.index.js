const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';

export default {
  'blog-a': layout(html`<p>Blog A</p>`),
  'blog-b': layout(html`<p>Blog B</p>`),
  'blog-c': layout(html`<p>Blog C</p>`),
};
