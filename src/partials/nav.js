const { html } = require('@popeindustries/lit-html-server');

export default (currentPath, root) => html`
  <nav>
    <div>
      <a href="/" class="${currentPath === '/index.js' ? 'active' : ''}">Begin</a>
      ${root.getChildren().map(child => html`
        <a href="${child.path}" class="${currentPath === child.path ? 'active' : ''}">${child.data.title}</a>
      `)}
    </div>
  </nav>
`;
