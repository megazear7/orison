import { html } from '@popeindustries/lit-html-server';
import client from '../../contentful.js';
import blogOverview from '../../partials/blog-overview.js';

function searchParams(page, pageSize) {
  var params = {
    'content_type': 'blogPost',
    'fields.tags': 'orisonjs-blog',
    'order': '-fields.publishDate',
    'limit': pageSize
  };

  if (page) params['skip'] = (page - 1) * pageSize;

  return params;
}

async function getPages(pageSize, page) {
  let pages = [];
  if (page) {
    pages.push({
      page: page,
      entries: await client.getEntries(searchParams(page, pageSize))
    });
  } else {
    let size = pageSize;
    let page = 1;
    while (size == pageSize) {
      let entries = await client.getEntries(searchParams(page, pageSize));
      if (entries.items.length > 0) {
        pages.push({
          page: page,
          entries: entries
        });
      }
      size = entries.items.length;
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
      ${entries.items.map(entry => html`
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
