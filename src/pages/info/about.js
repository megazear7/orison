import { html } from '@popeindustries/lit-html-server';
import { mdString } from '../../../bin/orison-esm.js';
import client from '../../contentful.js';

export default async () => {
  const entry = await client.getEntry("5yI7Sof8GKPflIWeG2O9RE");

  return html`
    <section>
      ${mdString(entry.fields.body)}
    </section>
  `;
};
