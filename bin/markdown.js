export default markdown = mdPath => html`${unsafeHTML(md().render(fs.readFileSync(mdPath).toString()))}`;
