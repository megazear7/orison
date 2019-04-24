# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses express for a server when being used as a server.
* Uses markdown-it for markdown rendering.

## TODO

1. Update the context object with
    1. Global metadata
    1. Local metadata
    1. lit-html `html` method and other helper methods
    1. Parent and child data
1. Add `orison generate` commands
1. Add `orison init --firebase` option
1. Add `orison init --netlify` option

## Thoughts on the Orison Generate Command

`orison generate:page /example/path` should generate a page at the specified path relative to /src/pages.
1. `orison generate /example/path` Defalts to a JS page.
1. `orison generate --page /example/path` Explicitly call out that you want to generate a page.
1. `orison generate --html /example/path`
1. `orison generate --md /example/path`
1. `orison generate --js /example/path`
1. `orison g /example/path` Shortcut for generate:page.
1. `orison generate --partial /example/path` Same options as the page but generates a partial
1. `orison g --partial /example/path`
1. `orison generate --layout /example/path` Creates a layout in the specified directory
1. `orison g --layout /example/path` Creates a layout in the specified directory

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
