## Programatic Usage

Instead of installing OrisonJS as a command line utility you can install it as a project dependency. Then you can interact with a configurable and programatic API for building and serving your site.

```bash
npm install orison
```

You can require the CommonJS module from 'orison'.
ES6 Modules are available from './node_modules/orison/bin/orison-esm.js'

### Static site generation

Here is an example of programmatically building the src directory into the docs directory.
The build method also returns an object with information about what pages were built which can be integrated into a build pipeline for things such as a service worker build tool or other down stream systems or integrations which needs to know about the pages that exist.

```js
const { OrisonGenerator } = require('orison');
const orisonGenerator = new OrisonGenerator({ rootPath: __dirname });
orisonGenerator.build();
```

### Static serving
Here is an example of serving the statically built files.

```js
const { OrisonStaticServer } = require('orison');
const orisonStaticServer = new OrisonStaticServer({ rootPath: __dirname });
orisonStaticServer.start();
```

### Server side generation

Here is an example of serving files and rendering the file during each request.
```js
const { OrisonServer } = require('orison');
const orisonServer = new OrisonServer({ rootPath: __dirname });
orisonServer.start();
```

### Custom command line utility

Or you could create a file that builds, serves, or serves static based on provided command line arguments.

```js
const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('orison');

if (process.argv.includes('build'))
  new OrisonGenerator({ rootPath: __dirname }).build();

if (process.argv.includes('serve'))
  new OrisonServer({ rootPath: __dirname }).start();

if (process.argv.includes('static'))
  new OrisonStaticServer({ rootPath: __dirname }).start();
```

Then you can build, serve, or serve static with these commands:

```bash
node ./orison.js build
node ./orison.js serve
node ./orison.js static
```
