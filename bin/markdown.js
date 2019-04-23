import md from 'markdown-it';
import fs from 'fs';
import { html } from '@popeindustries/lit-html-server';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';

export function mdFile(filePath) {
  return html`${unsafeHTML(md().render(fs.readFileSync(filePath).toString()))}`;
}

export function mdString(string) {
  return html`${unsafeHTML(md().render(string))}`;
}
