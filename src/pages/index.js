const { html } = require('@popeindustries/lit-html-server');
import helloWorld from '../components/hello-world.js';

export default html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>First Thoughts</title>
  </head>
  <body>
    ${helloWorld}
  </body>
</html>
`;
