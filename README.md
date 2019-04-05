# Orison

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a server or a static site generator.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.

## TODO

1. Update to use node import style instead of esm.
1. Use correct HTTP codes (404 specifically)
1. Create 500 error page.
1. Make the url extension configurable and default to '.html'
1. Update the example /src files to be documentation of this project.
1. Make a installable cli utility

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

## Usage

Here is an example of building the src directory into the docs directory.

```js
import { OrisonGenerator } from './bin/orison.js'

const orisonGenerator = new OrisonGenerator({ rootPath: __dirname });
orisonGenerator.build();
```

Here is an example of serving files and rendering the file during each request.
```js
import { OrisonServer } from './bin/orison.js'

const orisonServer = new OrisonServer(__dirname);
orisonServer.start();
```

Here is an example of serving the statically built files.

```js
import { OrisonStaticServer } from './bin/orison.js'

const orisonStaticServer = new OrisonStaticServer();
orisonStaticServer.start();
```

Or you could create a file that builds, serves, or serves static based on provided command line arguments.

###
```js
import { OrisonGenerator, OrisonServer, OrisonStaticServer } from './bin/orison.js'

if (process.argv.includes('--build')) (new OrisonGenerator({ rootPath: __dirname })).build();
if (process.argv.includes('--serve')) (new OrisonServer(__dirname)).start();
if (process.argv.includes('--static')) (new OrisonStaticServer()).start();
```

Then you can build, serve, or serve static with these commands:

```bash
$ node -r esm ./orison.js --build
$ node -r esm ./orison.js --serve
$ node -r esm ./orison.js --static
```

## Development

### Creating Pages

Partial definition
```
data => html`...`
```

Single page definition
```
html`...`
```

Index page definition
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

### Creating Layouts

```
page => html`
  ...
  ${page}
  ...
}
```

### Creating Partials

```
data => html`
  ...
  ${data}
  ...
}
```
