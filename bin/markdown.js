import md from 'markdown-it';
import fs from 'fs';
import { html } from '@popeindustries/lit-html-server';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';

const markdown = md({
  html: true
});

/**
 * Renders the markdown file at filePath, returning a lit-html template.
 * @param {String} filePath The markdown file to render.
 */
export function mdFile(filePath) {
  return html`${unsafeHTML(markdown.render(fs.readFileSync(filePath).toString()))}`;
}

/**
 * Renders the markdown string, returning a lit-html template.
 * @param {String} filePath The markdown string to render.
 */
export function mdString(string) {
  return html`${unsafeHTML(markdown.render(string))}`;
}
