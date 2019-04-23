const { html } = require('@popeindustries/lit-html-server');

export default path => html`
  <nav>
    <div>
      <a href="/" class="${path === '/index.js' ? 'active' : ''}">Home</a>
      <a href="/blog.html" class="${path.startsWith('/blog') ? 'active' : ''}">Blog</a>
      <a href="/info/about.html" class="${path.startsWith('/info/about') ? 'active' : ''}">About</a>
    </div>
  </nav>
`;
