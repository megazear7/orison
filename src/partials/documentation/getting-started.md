## Getting Started

### Project Organization

An OrisonJS project should have a `src` directory in the root of the project with these three sub directories:

- /src/pages
- /src/partials
- /src/static  

### Using Orison

- `orison init my-project` Initialize a new project
- `npx orison serve` Serve the source files with live changes
- `npx orison build` Build the static site
- `npx orison static` Serve the static site

### Creating your first page

With a few exceptions for layouts and list pages, any JavaScript, HTML, or Markdown file under the /src/pages directory will be rendered as an html file at the same location but under the /docs directory.

JavaScript pages should return a method which accepts a `context` object and returns a lit-html template. Html files will be interpreted as a lit-html template where the `context` object is available. Markdown files will be rendered as is.

Below is an example page. Notice that it exports a function which takes no ` context` parameter and returns a template.

#### /src/pages/example.js
```js
import { html } from 'orison';

export default context => html`
  <h1>This is an example page</h1>
`;
```

You could also define this same page with an html file instead of a JavaScript file:

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

Layouts can be used to provide html that should exist on every page. Layouts also export a function which receives a context parameter and then renders a full html page plugging in the page html by using the `context.page.html` attribute. For example you could create the following layout.js file:

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

The closest layout to the rendered page will be used for that page. For example if you have only one layout.js file and it is directly in the /src/pages directory, it will be used for rendering every page. If a layout.js exists closer in the /src/pages directory hierarchy to the rendered page, it will be used instead.

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

And then use this partial in our page and reuse it wherever it is needed.

#### /src/pages/index.js
```js
import { html } from 'orison';
import title from '../partials/title.js';

export default context => html`
  ${title('This is an example page')}
`;
```

Note that because the partial's definition is outside of the page hierarchy and needs to be capable of accepting parameters it must be defined as a JS file and not an html or markdown file.

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

### Utilizing Metadata

##### Global Metadata

The data in the /src/pages/data.json file of the pages directory can be used as Global metadata for the site. It will be accessible under the `context.root.data` property.
This is available for all pages, list pages, and layouts regardless of where they exist in the pages directory.

#### /src/pages/data.js
```json
{
  "title": "Hello, World!"
}
```

#### /src/pages/index.js
```js
import { html } from 'orison';

export default context => html`
  <h1>${context.root.data.title}</h1>
`;
```

##### Contextual Metadata

Any `data.json` file in the pages directory will be available on a `data` property
of the context object for pages, list pages, and layouts that are in the same directory.

#### /src/pages/example/data.js
```json
{
  "message": "This is available in the example directory."
}
```

#### /src/pages/example/index.js
```js
import { html } from 'orison';

export default context => html`
  <p>${context.data.message}</p>
`;
```

##### Parent Metadata

The `context.parents` property is an array of OrisonDirectory objects representing
each directory from the current page up to the root.

#### /src/pages/example-parent/example-child.js
```js
import { html } from 'orison';

export default context => html`
  ${context.parents.map(parent => html`
    <a href="${parent.path}">${parent.data.title}</a>
  `)}
`;
```

##### Child Metadata

The `context.children` property is an array of OrisonDirectory objects representing
each child directory of the current directory.

#### /src/pages/example-parent/example-child.js
```js
import { html } from 'orison';

export default context => html`
  ${context.children.map(child => html`
    <a href="${child.path}">${child.data.title}</a>
  `)}
`;
```

##### Contextual Directories

Each `OrisonDirectory` object has `.parent` and `.children` accessors so that you can use the `context` API to do contextual rendering of pages based upon the hierarchy of your project. Here are some simple examples:

#### /src/pages/example-parent/example-child.js
```js
import { html } from 'orison';

export default context => html`
  ${context.path}
  ${context.data.title}
  ${context.parent.data.title}
  ${context.parent.children.map(sibling => html`
    ${sibling.data.title},
  `)}
`;
```

##### Rendering Markdown

Markdown can be rendered by using the `mdString` and `mdFile` methods of the context object as shown below:

#### /src/partials/example.md
```md
# Some example markdown file
```

And then use this partial in our page and reuse it wherever it is needed.

#### /src/pages/index.js
```js
import { html } from 'orison';

export default context => html`
  <!-- Render a markdown file: -->
  ${context.mdFile('./src/partials/example.md')}

  <!-- Render a markdown string: -->
  ${context.mdString('# Example markdown string')}
`;
```
