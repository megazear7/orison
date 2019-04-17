## Getting started

An OrisonJS project should have a `src` directory in the root of the project with three sub directories

- /src/pages
- /src/partials
- /src/static  

The `npx orison build` command will render the page templates under /src/pages into the /docs directory.
The `npx orison static` command will statically serve the built files under /docs.
The `npx orison serve` command will render the pages under /src/pages at localhost:3000.

Alert: I plan on removing the need for using npx. For the moment if you try to build, serve, or statically serve your project through the globally installed orison command there will be two different versions being used; your projects and the globally installed version. This causes an error. I am working to resolve this.

### Creating your first page

Any JavaScript, HTML, or Markdown files under the /src/pages directory will be rendered as an html file at the same location but under the /docs directory.

JavaScript pages should return a lit-html template. Html files will be interpreted as a lit-html template. Markdown files will be rendered as is.

Below is an example page at /src/pages/example.js. Notice that it exports a function which takes no parameters and returns a template.

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

### Enhancing pages with layouts

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

The closest layout to the rendered page will be used for that page. So for example if you have only one layout.js file and it is directly in the /src/pages directory, it will be used for rendering every page. If a layout.js exists closer in the /src/pages directory hierarchy to the rendered page, it will be used instead.

Any pages defined as an HTML file will automatically be inserted into the closest layout.js file that exists within the /src/pages directory structure.

### Utilizing index files

Any file named with the "index" basename will be returned by the server for the url that matches the directory that it is in. For example the following file will be available at localhost:3000 when the server is running, _not_ localhost:3000/index.html. Most web servers that serve static files will behave in the same way.

```js
// /src/pages/index.js
const { html } = require('@popeindustries/lit-html-server');

export default () => html`
  <h1>This is an example page</h1>
`;
```

### Making reusable partials

If you need reusable chunks of html you can create partials under /src/partials. These partial files should export a method which excepts some paramters and returns an html template. For example we could create the following file:

```js
// /src/partials/title.js
const { html } = require('@popeindustries/lit-html-server');

export default title => html`
  <h1>${title}</h1>
`;
```

And then use this partial in our page and reuse wherever it is needed.

```js
// /src/pages/index.js
const { html } = require('@popeindustries/lit-html-server');
import title from '../partials/title.js';

export default () => html`
  ${title('This is an example page')}
`;
```

Note that because the partial's definition is outside of the page hierarchy and needs to be capable of accepting parameters it must be defined as a JS file and not an html file.

### The static directory

Finally, any files in the /src/static directory will get copied as is into the src directory during the build. If running the live server these will be available at the same location under the root of the url. So for example the following css and js files will be available at the specified url:

* /src/static/main.css => localhost:3000/main.css
* /src/static/main.js => localhost:3000/main.js
