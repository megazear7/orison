const { html } = require('@popeindustries/lit-html-server');

export default entry => html`
  <div class="blog-overview">
    <h3>${entry.fields.title}</h3>
    <img alt="${entry.fields.heroImage.fields.description}" src="${entry.fields.heroImage.fields.file.url}">
    <p>${entry.fields.description}</p>
    <p><a href="/blog/article/${entry.fields.slug}.html">Read More</a></p>
  </div>
`;
