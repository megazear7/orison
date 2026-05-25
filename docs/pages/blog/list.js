import { html } from 'orison';
import { getDocumentationPosts } from '../../partials/documentation-blog.js';
import blogOverview from '../../partials/blog-overview.js';

async function getPages(pageSize, page) {
  let pages = [];
  if (page) {
    pages.push({
      page: page,
      entries: await getDocumentationPosts({
        limit: pageSize,
        order: '-fields.publishDate',
        skip: (page - 1) * pageSize
      })
    });
  } else {
    let size = pageSize;
    let page = 1;
    while (size == pageSize) {
      let entries = await getDocumentationPosts({
        limit: pageSize,
        order: '-fields.publishDate',
        skip: (page - 1) * pageSize
      });
      if (entries.length > 0) {
        pages.push({
          page: page,
          entries: entries
        });
      }
      size = entries.length;
      page += 1;
    }
  }
  return pages;
}

export default async (context, slug) => {
  const pages = (await getPages(context.root.data.pageSize, parseInt(slug)));

  return pages.map(({entries, page}) => ({
    name: page.toString(),
    html: html`
      ${entries.map(entry => html`
        <section>
          ${blogOverview(entry)}
        </section>
      `)}
      ${page + 1 <= pages.length || slug ? html`
        <section>
          <div class="more-posts">
            <a href="/blog/${page + 1}.html">${context.root.data.moreText}</a>
          </div>
        </section>
      `: ''}
    `
  }));
};
