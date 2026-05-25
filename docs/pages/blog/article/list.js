import { html } from 'orison';
import { getDocumentationPost, getDocumentationPosts } from '../../../partials/documentation-blog.js';

export default async (context, slug) => {
  const entries = slug
    ? [await getDocumentationPost(slug)].filter(Boolean)
    : await getDocumentationPosts({ order: '-fields.publishDate' });

  return entries.map(entry => {
    return {
      name: entry.fields.slug,
      html: html`
        <section>
          ${context.mdFile(entry.mdFilePath)}
        </section>
      `
    };
  });
};
