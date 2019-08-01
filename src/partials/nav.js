const { html } = require('@popeindustries/lit-html-server');

export default (currentPath, root) => html`
  <nav>
    <div>
      <a href="/" class="${currentPath.length === 1 ? 'active' : ''}">Begin</a>
      ${root.children.filter(child => ! child.data.hideInNav).map(child => html`
        <a href="${child.path}" class="${currentPath.startsWith(child.path) ? 'active' : ''}">${child.data.title}</a>
      `)}
    </div>
  </nav>
`;
