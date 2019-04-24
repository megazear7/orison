import { html } from '@popeindustries/lit-html-server';
import { mdString } from '../../../bin/orison-esm.js';
import client from '../../contentful.js';

function searchParams(slug) {
  var params = {
    'content_type': 'blogPost',
    'fields.tags': 'orisonjs-blog'
  };

  if (slug) params['fields.slug'] = slug;

  return params;
}

export default async slug => {
  const entry = await client.getEntry("5yI7Sof8GKPflIWeG2O9RE");
  const entries = await client.getEntries(searchParams(slug));

  return entries.items.map(entry => {
    return {
      name: entry.fields.slug,
      html: html`
        <section>
          <h3>${entry.fields.title}</h3>
          ${mdString(entry.fields.body)}
        </section>
      `
    };
  });
};