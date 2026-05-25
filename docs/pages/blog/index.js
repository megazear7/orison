import { html } from 'orison';
import client from '../../contentful.js';
import blogOverview from '../../partials/blog-overview.js';

export default async context => {
  const entries = await client.getEntries({
    'content_type': 'blogPost',
    'fields.tags': 'Orison-blog',
    'order': '-fields.publishDate',
    'limit': context.root.data.pageSize
  });

  return html`
    ${entries.items.map(entry => html`
      <section>
        ${blogOverview(entry)}
      </section>
    `)}
    ${ entries.items.length >= context.root.data.pageSize ? html`
      <section>
        <div class="more-posts">
          <a href="/blog/2.html">${context.root.data.moreText}</a>
        </div>
      </section>
    `: ''}
  `;
};
