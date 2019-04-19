# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses express for a server when being used as a server.
* Uses markdown-it for markdown rendering.

## Functionality TODO

1. Pass a context object into the page export that contains the path and metadata. This way the user code does not have to calculate or find this information. A similar "layout context" object could be passed into the layout file export.
1. Add navigation and updated client side routing to template projects.
1. Add `orison generate:page /example/path` which generates a page at the specified path relative to /src/pages.
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
1. orison init --firebase my-project
1. orison init --netlify my-project
1. orison init --js my-project # This should create js pages and partials
1. orison init --html my-project # This should create html pages partials
1. orison init --md my-project # This should create md pages pages and partials

## Documentation TODO

1. data.json
1. Markdown partials
1. Example API integration with Contentful https://app.contentful.com/spaces/8blvhwbk2pug/entries
1. Steps for deploying a project to Github. These steps should go in the github template project and also in the main documentation.

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
