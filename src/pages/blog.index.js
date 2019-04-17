const { html } = require('@popeindustries/lit-html-server');

export default () => [
  {
    name: 'blog-a',
    html: html`<p>Blog A</p>`,
  },
  {
    name: 'blog-b',
    html: html`<p>Blog B</p>`,
  },
  {
    name: 'blog-c',
    html: html`<p>Blog C</p>`,
  }
];
