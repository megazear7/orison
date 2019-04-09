## Getting started

Any .js, .html, or .md file under the /src/pages directory will be rendered as an html file.

JavaScript pages should return a lit-html template. Html files will be interpreted as a lit-html template. Markdown files will be rendered as is.

Here is an example JavaScript page:

```js
// /src/pages/example.js
const { html } = require('@popeindustries/lit-html-server');

export default () => html`
  <h1>This is an example page</h1>
`;
```

Or you could define this same page with an html file instead of a JavaScript file:

```html
<!-- /src/pages/example.html -->
<h1>This is an example page</h1>
```

Or you could write this same page as a markdown file:

```md
# This is an example page
```

Layouts can be used to provide html that should exist on every page. Layouts should export a method which takes a page template and then renders a full html page. For example if you could create the following layout.js file:

```js
// /src/pages/layout.js
const { html } = require('@popeindustries/lit-html-server');

export default page => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OrisonJS</title>
  </head>
  <body>
    <div>Website header</div>
    ${page}
    <div>Website footer</div>
  </body>
</html>
`;
```

Then you could use this layout in a page in order to produce a full html file:

```js
// /src/pages/example.js
const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';

export default () => layout(html`
  <h1>This is an example page</h1>
`);
```

Any pages defined as a .html file will automatically be inserted into the closest layout.js file that exists within the /src/pages directory structure.

Any file named with the "index" basename will be returned by the server for the url that matches the directory that it is in. For example the following file will be available at localhost:3000 when the server is running, _not_ localhost:3000/index.html. Most web servers that serve static files will behave in the same way.

```js
// /src/pages/index.js
const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';

export default () => layout(html`
  <h1>This is an example page</h1>
`);
```

If you need reusable chunks of html you can create partials under /src/partials. These partial files should export a method which excepts some paramters and returns an html template. For example we could create the following file:

```js
const { html } = require('@popeindustries/lit-html-server');

export default title => html`
  <h1>${title}</h1>
`;
```

And then use this partial in our page and resuse wherever it is needed.

```js
// /src/pages/index.js
const { html } = require('@popeindustries/lit-html-server');
import layout from './layout.js';
import title from '../partials/title.js';

export default () => layout(html`
  ${title('This is an example page')}
`);
```

Finally, any files in the /src/static directory will get copied as is into the src directory during the build. If running the live server these will be available at the same location under the root of the url. So for example the following css and js files will be available at the specified url:

/src/static/main.css => localhost:3000/main.css
/src/static/main.js => localhost:3000/main.js
