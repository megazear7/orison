## Getting Started

### Project Organization

An OrisonJS project should have a `src` directory in the root of the project with three sub directories

- /src/pages
- /src/partials
- /src/static  

### Using Orison

- `orison init my-project` Initialize a new project
- `npx orison serve` Serve the source files with live changes
- `npx orison build` Build the static site
- `npx orison static` Serve the static site

### Creating your first page

With a few exceptions for layouts and lists, any JavaScript, HTML, or Markdown files under the /src/pages directory will be rendered as an html file at the same location but under the /docs directory.

JavaScript pages should return a lit-html template. Html files will be interpreted as a lit-html template. Markdown files will be rendered as is.

Below is an example page. Notice that it exports a function which takes no parameters and returns a template.

#### /src/pages/example.js
```js
import { html } from 'orison';

export default context => html`
  <h1>This is an example page</h1>
`;
```

Or you could define this same page with an html file instead of a JavaScript file:

#### /src/pages/example.html
```html
<h1>This is an example page</h1>
```

Or you could write this same page as a markdown file:

#### /src/pages/example.md
```md
# This is an example page
```

### Enhancing pages with layouts

Layouts can be used to provide html that should exist on every page. Layouts should export a method which takes a page template and then renders a full html page. For example if you could create the following layout.js file:

#### /src/pages/layout.js
```js
import { html } from 'orison';

export default context => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OrisonJS</title>
  </head>
  <body>
    <div>Website header</div>
    ${context.page.html}
    <div>Website footer</div>
  </body>
</html>
`;
```

The closest layout to the rendered page will be used for that page. So for example if you have only one layout.js file and it is directly in the /src/pages directory, it will be used for rendering every page. If a layout.js exists closer in the /src/pages directory hierarchy to the rendered page, it will be used instead.

Any pages defined as an HTML file will automatically be inserted into the closest layout.js file that exists within the /src/pages directory structure.

### Utilizing index files

Any file named with the "index" base name will be returned by the server for the url that matches the directory that it is in. For example the following file will be available at localhost:3000 when the server is running, _not_ localhost:3000/index.html. Most web servers that serve static files will behave in the same way.

#### /src/pages/index.js
```js
import { html } from 'orison';

export default context => html`
  <h1>This is an example index page</h1>
`;
```

### List Pages

You can also have a single JS file produce multiple pages. This is useful for connecting to a content provider such as [Contentful](https://www.contentful.com) and producing a web page for each item from a query. In the example below we are creating a list of blog posts.

#### /src/pages/list.js
```js
import { html } from 'orison';
import client from '../../contentful.js';

export default async (context, slug) => {
  const blogPosts = await loadContent(slug);

  return blogPosts.items.map(blogPost => ({
    name: blogPost.slug,
    html: html`
      <section>
        <h3>${blogPost.title}</h3>
        ${context.mdString(blogPost.body)}
      </section>
    `
  }));
};
```

Notice that an array of url segments and html templates is returned. Each will corresponding to the given html page at the url created with the given name.

When doing `npx orison build` no url slug will be provided because all returned entries will be created as html pages. When using the orison serve command, only the request page should be generated and so the corresponding url slug is provided to the list page, which should use this slug to retrieve and return only the page needed for the given url slug.

### Making reusable partials

If you need reusable chunks of html you can create partials under /src/partials. These partial files should export a method which excepts some parameters and returns an html template. For example we could create the following file:

#### /src/partials/title.js
```js
import { html } from 'orison';

export default title => html`
  <h1>${title}</h1>
`;
```

And then use this partial in our page and reuse wherever it is needed.

#### /src/pages/index.js
```js
import { html } from 'orison';
import title from '../partials/title.js';

export default context => html`
  ${title('This is an example page')}
`;
```

Note that because the partial's definition is outside of the page hierarchy and needs to be capable of accepting parameters it must be defined as a JS file and not an html file.

### The static directory

Finally, any files in the /src/static directory will get copied as is into the src directory during the build. If running the live server these will be available at the same location under the root of the url. So for example the following css and js files will be available at the specified url:

* /src/static/main.css => localhost:3000/main.css
* /src/static/main.js => localhost:3000/main.js

### Fragments

Each page will also have a corresponding "fragment" built. A fragment is the same content as the page, but without the layout applied. This allows you to do client side navigation, loading in page content from the browser JavaScript without requiring full page refreshes. This also allows you to use the system as an API for content. By default the initial projects come with single page application style relative linking, loading in only the new page fragment.

For example for the following urls:

1. /index.html
1. /info/about.html
1. /my-first-blog-post.html
1. /another-blog-post.html

There will also be these urls with the same page content but without the layout applied:

1. /index.fragment.html
1. /info/about.fragment.html
1. /my-first-blog-post.fragment.html
1. /another-blog-post.fragment.html
