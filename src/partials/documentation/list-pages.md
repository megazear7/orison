## List pages

```js
import { html } from 'orison';

export default (context, slug) => [
  {
    name: 'path-segment-1',
    html: html`...`
  },
  {
    name: 'path-segment-2',
    html: html`...`
  }
  ...
]
```

In the below example we load in a list of blog posts with a made up loadContent
method. It is important to remember that when doing `orison build` the slug
parameter will be undefined and when doing `orison serve` it will be the last
path segment in the url. This way `orison serve` can only load in the data
it needs for the currently requested page and `orison build` can build every
page available from your content provider. This logic will need implemented
differently depending on what content provider you are using, and is hidden
inside the `loadContent` method in this example.

```js
import { html } from 'orison';

export default async (context, slug) => {
  const blogPosts = await loadContent(slug);

  blogPosts.map(blogPost => ({
    name: blogPost.urlName,
    html: html`
      ...
    `
  );
}
```
