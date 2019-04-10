const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';
import { markdown } from 'orison';

export default () => layout(html`
  <section>${markdown('./src/partials/getting-started.md')}</section>
  <section>
    <h3>Here are some example pages</h3>
    <ul>
      <li><a href="/blog.html">/blog.html</a></li>
      <li><a href="/blog/blog-a.html">/blog/blog-a.html</a></li>
      <li><a href="/blog/blog-b.html">/blog/blog-b.html</a></li>
      <li><a href="/blog/blog-c.html">/blog/blog-c.html</a></li>
      <li><a href="/info">/info</a></li>
      <li><a href="/info/about.html">/info/about.html</a></li>
    </ul>
  </section>
`);
