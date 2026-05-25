import { html } from 'orison';
import { getDocumentationPosts } from '../../partials/documentation-blog.js';
import blogOverview from '../../partials/blog-overview.js';

export default async context => {
  const entries = await getDocumentationPosts({
    limit: context.root.data.pageSize,
    order: '-fields.publishDate'
  });

  return html`
    ${entries.map(entry => html`
      <section>
        ${blogOverview(entry)}
      </section>
    `)}
    ${entries.length >= context.root.data.pageSize ? html`
      <section>
        <div class="more-posts">
          <a href="/blog/2.html">${context.root.data.moreText}</a>
        </div>
      </section>
    `: ''}
  `;
};
