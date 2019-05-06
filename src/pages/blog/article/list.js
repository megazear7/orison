import { html } from '@popeindustries/lit-html-server';
import client from '../../../contentful.js';

function searchParams(slug) {
  var params = {
    'content_type': 'blogPost',
    'fields.tags': 'orisonjs-blog'
  };

  if (slug) params['fields.slug'] = slug;

  return params;
}

export default async (context, slug) => {
  const entries = await client.getEntries(searchParams(slug));

  return entries.items.map(entry => {
    return {
      name: entry.fields.slug,
      html: html`
        <section>
          <h2>${entry.fields.title}</h2>
          ${context.mdString(entry.fields.body)}
        </section>
      `
    };
  });
};
