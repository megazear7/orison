import { html } from '@popeindustries/lit-html-server';
import { repeat } from '@popeindustries/lit-html-server/directives/repeat.js';
import client from '../contentful.js';

export default async () => {
  const entry = await client.getEntry("5yI7Sof8GKPflIWeG2O9RE");
  const entries = await client.getEntries({
    'content_type': 'blogPost',
    'fields.tags': 'orisonjs-blog'
  });

  return html`
    ${repeat(entries.items, entry => html`
      <section>
        <div class="blog-overview">
          <h3>${entry.fields.title}</h3>
          <img src="${entry.fields.heroImage.fields.file.url}">
          <p>${entry.fields.description}</p>
          <p><a href="/blog/${entry.fields.slug}.html">Read More</a></p>
        </div>
      </section>
    `)}
  `;
};
