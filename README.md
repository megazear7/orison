# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses express for a server when being used as a server.
* Uses markdown-it for markdown rendering.

## TODO

1. SPA links to blog pages of the template project does not work.
1. Make the documentation navigation bottom aligned on mobile after scrolling down.
1. Add `orison init --firebase` option
1. Add `orison init --netlify` option
1. Image rendering - images under /static will be downsized into smaller renditions.
1. Create an <orison-img> component. It loads in image renditions based on a url, first loading in the smallest rendition, then loading in a correctly sized rendition based upon the measured box sizing of the image location.

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
