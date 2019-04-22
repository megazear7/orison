const { html } = require('@popeindustries/lit-html-server');

export default path => html`
  <nav>
    <div>
      <a href="/" class="${path === '/index.js' ? 'active' : ''}">Home</a>
      <a href="/blog.html" class="${path === '/blog.js' ? 'active' : ''}">Blog</a>
      <a href="/info/about.html" class="${path === '/info/about.js' ? 'active' : ''}">About</a>
    </div>
  </nav>
`;
