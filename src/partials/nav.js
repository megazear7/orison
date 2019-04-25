const { html } = require('@popeindustries/lit-html-server');

export default path => html`
  <nav>
    <div>
      <a href="/" class="${path === '/index.js' ? 'active' : ''}">Begin</a>
      <a href="/documentation.html" class="${path.startsWith('/documentation') ? 'active' : ''}">Docs</a>
      <a href="/blog.html" class="${path.startsWith('/blog') ? 'active' : ''}">Blog</a>
    </div>
  </nav>
`;
