const { html } = require('@popeindustries/lit-html-server');

export default () => html`
  <nav>
    <a href="/">Home</a>
    <a href="/blog.html">Blog</a>
    <a href="/info/about.html">About</a>
  </nav>
`;
