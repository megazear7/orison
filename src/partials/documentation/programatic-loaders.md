### Programatic Loaders

Instead of creating loaders as JavaScript files under /src/loaders you can instead pass loaders into the `OrisonServer` and `OrisonGenerator` constructors as shown below:

#### /build.js
```js
const loaders = [
  {
    name: 'anotherExample',
    loader: message => new Promise(resolve => resolve('Message from programatic loader: ' + message))
  }
];

if (process.argv.includes('serve')) {
  new OrisonServer({
    rootPath: process.cwd(),
    loaders: loaders
  }).start();
} else if (process.argv.includes('build')) {
  new OrisonGenerator({
    rootPath: process.cwd(),
    loaders: loaders
  }).build();
}
```

Now in our page we can use `context.loaders.anotherExample` to call our programatically defined loader:

#### /src/pages/index.js
```js
import { html } from 'orison';

export default async context => html`
  <ol>
    <li>${await context.loaders.anotherExample('123')}</li>
    <li>${await context.loaders.anotherExample('123')}</li>
  </ol>
`;
```

And see the output as shown below. The first call will hit the loader, the second call will hit the cache.
