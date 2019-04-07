import md from 'markdown-it';
import fs from 'fs';
import { html } from '@popeindustries/lit-html-server';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';

export default mdPath => html`${unsafeHTML(md().render(fs.readFileSync(mdPath).toString()))}`;
