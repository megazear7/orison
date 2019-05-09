import { html } from 'orison';

export default (currentPath, root) => html`
  <nav>
    <div>
      <a href="/" class="${currentPath.length === 1 ? 'active' : ''}">Begin</a>
      ${root.children.map(child => html`
        <a href="${child.path}" class="${currentPath.startsWith(child.path) ? 'active' : ''}">${child.data.title}</a>
      `)}
    </div>
  </nav>
`;
