import { html } from '@popeindustries/lit-html-server';
import { mdString } from '../../../bin/orison-esm.js';
import client from '../../contentful.js';

export default async () => {
  const entry = await client.getEntry("5yI7Sof8GKPflIWeG2O9RE");
  const entries = await client.getEntries({
    'content_type': 'blogPost',
    'fields.tags': 'orisonjs-blog'
  });

  return entries.items.map(entry => {
    return {
      name: entry.fields.slug,
      html: html`
        <section>
          ${mdString(entry.fields.body)}
        </section>
      `
    };
  });
};
