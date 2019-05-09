import { html } from 'orison';
import header from '../partials/header.js';
import nav from '../partials/nav.js';
import footer from '../partials/footer.js';

export default context => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${context.root.data.title}</title>
    <script src="/app.js"></script>
    <link rel="stylesheet" type="text/css" href="/app.css">
  </head>
  <body>
    ${header(context.root.data.title)}
    ${nav(context.path, context.root)}
    <main>
      ${context.page.html}
    </main>
    ${footer()}
  </body>
</html>
`;
