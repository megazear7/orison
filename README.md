lit-html based static site generator.
Requires node v11+

# Install

`npm run install`

# Build

`npm run build`

# Develop

[lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html

The plan is to create a build.js file which generates all of the pages of the static site
by looking at /src/pages. Each js file under /src/pages should define a route for 1 or more
pages. Index.js files should map to the directory they are in. Other js files should map
directly to a route based upon the file path. Each of these js files should return a
lit-html TemplateResult using html'...' If a file maps to more than one generated page
it needs to return a map instead like this:
{
  "my-first-blog": html'...',
  "another-blog-post: html'...',
  "yet-another-post: html'...'
}

/src
  /pages
    index.js
    /info
      index.js
      about.js
    blog.js
    blog.index.js

.com/
.com/info
.com/info/about
.com/blog
.com/blog/my-first-blog
.com/blog/another-blog-post
.com/blog/yet-another-post
