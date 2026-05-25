## Loaders

If you integrate Orison with APIs it might be useful to cache the API responses. For example let's say that you are rending a hundred blog posts, and each time the layout is called you have to make the same API request to load in the websites title from a CMS. You could connect to the API directly from your layout however then the request will be made for each page. Alternatively you could wrap the API in an Orison Loader which will automatically cache the API response for the duration of the build process.

Loaders are defined in JavaScript files under /src/loaders as shown below:

#### /src/loaders/example.js
```js
export default async message => {
  return new Promise(resolve => {
    resolve('Message from loader: ' + message);
  });
};
```

While this code fakes an asynchronous API call, the idea is simple. The loader exports a function which excepts some parameters and then returns a promise of data. If this loader is called with the same parameters then the cache will be hit and a second API call will be avoided. The name of the loader will be the camel cased version of the file name.

This loader can then be used in layouts, pages, and partials by using the `context.loaders.example` method:

#### /src/pages/index.js
```js
import { html } from 'orison';

export default async context => html`
  <ol>
    <li>${await context.loaders.example('ABC')}</li>
    <li>${await context.loaders.example('ABC')}</li>
  </ol>
`;
```

This will produce the output as shown below. The first call will hit the loader defined at /src/loaders.js. The second call will hit the cache and the loader at /src/loader.js will not be hit:
