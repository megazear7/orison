## Programatic Usage

```bash
npm install orison
```

CommonJS Modules are available from './bin/orison.js' and ES6 Modules are available from './bin/orison-esm.js'

Here is an example of building the src directory into the docs directory.

```js
const { OrisonGenerator } = require('orison');
const orisonGenerator = new OrisonGenerator({ rootPath: __dirname });
orisonGenerator.build();
```

Here is an example of serving files and rendering the file during each request.
```js
const { OrisonServer } = require('orison');
const orisonServer = new OrisonServer({ rootPath: __dirname });
orisonServer.start();
```

Here is an example of serving the statically built files.

```js
const { OrisonStaticServer } = require('orison');
const orisonStaticServer = new OrisonStaticServer();
orisonStaticServer.start();
```

Or you could create a file that builds, serves, or serves static based on provided command line arguments.

```js
const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('orison');

if (process.argv.includes('build')) new OrisonGenerator({ rootPath: __dirname }).build();
if (process.argv.includes('serve')) new OrisonServer({ rootPath: __dirname }).start();
if (process.argv.includes('static')) new OrisonStaticServer().start();
```

Then you can build, serve, or serve static with these commands:

```bash
node ./orison.js build
node ./orison.js serve
node ./orison.js static
```
