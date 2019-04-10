# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses express for a server when being used as a server.
* Uses markdown-it for markdown rendering.

## Functionality TODO

1. Do html partials work?
1. orison init my-project
1. orison init --github-pages my-project
1. orison init --firebase my-project
1. orison init --netlify my-project
1. orison init --js my-project # This should create js pages and partials
1. orison init --html my-project # This should create html pages partials
1. orison init --md my-project # This should create md pages pages and partials

## Documentation TODO

1. data.json
1. Markdown partials
1. Example API integration with Contentful https://app.contentful.com/spaces/8blvhwbk2pug/entries
1. Update text color to be rgba(0,0,0,0.8) so that it isn't such a stark black on yellow or black on white.

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
