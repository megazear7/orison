const { html } = require('@popeindustries/lit-html-server');

export default page => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Example</title>
  </head>
  <body>
    <div>Header</div>
    ${page}
    <div>Footer</div>
  </body>
</html>
`;
