# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses [express](https://expressjs.com/) for a server when being used as a server.
* Uses [markdown-it](https://github.com/markdown-it/markdown-it) for markdown rendering.

## TODOS

1. Make the public property of data files publicly available
1. Provide a context.partial method which renders js or md partials, with paths relative to /src/partials
1. PWA offline page
1. Refactor code
1. JSDocs
1. Unit Testing
1. Documentation

# Development on this project

## Install

```
npm run install
```

## Build

```
npm run build
```

## Develop

```
npm run serve
# Available at localhost:3000
```

## Deploy

```
npm run build
npm run static
# Test the production build at localhost:3000
git add docs
git commit -m "Deployment"
git push origin master
```
