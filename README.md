# Orison

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a server or a static site generator.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.

## TODO

1. On the second request the orison server fails I think because we are using the readFileSync method.
1. Make the url extension configurable and default to '.html'
1. Update the example /src files to be documentation of this project.

## Command Line Usage

```
npm install -g orison
orison build
orison serve
orison static
```

## Programatic Usage

```
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
const orisonServer = new OrisonServer(__dirname);
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

if (process.argv.includes('build')) (new OrisonGenerator({ rootPath: __dirname })).build();
if (process.argv.includes('serve')) (new OrisonServer(__dirname)).start();
if (process.argv.includes('static')) (new OrisonStaticServer()).start();
```

Then you can build, serve, or serve static with these commands:

```bash
$ node ./orison.js build
$ node ./orison.js serve
$ node ./orison.js static
```

## Development With Orison

### Single pages
```
html`...`
```

### Multiple pages

```
[
  {
    path: 'path-segment-1',
    html: html`...`
  },
  {
    path: 'path-segment-2',
    html: html`...`
  }
  ...
]
```

### Layouts

```
page => html`
  ...
  ${page}
  ...
}
```

### Partials

```
data => html`...`
```

# Development on this project

## Install

```
npm run install
```

## Build

```
npm run build
```

## Run Server

This will render the page for the given request as the request comes through.

```
npm run serve
```

## Serve Static Build

This will server the prebuilt static files.

```
npm run static
```
