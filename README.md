# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses express for a server when being used as a server.
* Uses markdown-it for markdown rendering.

## Functionality TODO

1. Provide an export similar to the markdown export that renders html partials.
1. Add a production flag to turn off things like node module cache clearing.
1. Build and serve fragments of pages, i.e. only the content in the page file itself without the layout. This will allow loading in these pages on navigation instead of reloading the whole page. The could be accessible at something like /my/page.fragment.html
1. Provide a frontend component that can be loaded which will take over relative link navigation and do fragment loading.
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
