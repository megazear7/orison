import md from 'markdown-it';
import fs from 'fs';
import { html } from '@popeindustries/lit-html-server';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';

const markdown = md({
  html: true
});

export function mdFile(filePath) {
  return html`${unsafeHTML(markdown.render(fs.readFileSync(filePath).toString()))}`;
}

export function mdString(string) {
  return html`${unsafeHTML(markdown.render(string))}`;
}
