import { html } from 'orison';

export default parentData => html`
  <ul class="breadcrumb">
    ${parentData.map(data => html`
      <li><a href="${data.path}">${data.title}</a></li>
    `)}
  </ul>
`;
