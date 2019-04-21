import { html } from 'orison';
import footer from '../partials/footer.js';
import header from '../partials/header.js';

export default page => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Example Site</title>
    <script src="/app.js"></script>
    <link rel="stylesheet" type="text/css" href="/app.css">
  </head>
  <body>
    ${header()}
    ${page.html}
    ${footer()}
  </body>
</html>
`;
