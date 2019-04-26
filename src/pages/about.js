import { html } from '@popeindustries/lit-html-server';
import client from '../../contentful.js';

export default async context => {
  const entry = await client.getEntry("5yI7Sof8GKPflIWeG2O9RE");

  return html`
    <section>${context.mdString(entry.fields.body)}</section>
  `;
};
