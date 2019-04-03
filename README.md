# Orison

[Orison Documentation](https://orison.alexlockhart.me)

* [lit-html](https://github.com/Polymer/lit-html) based static site generator.
* [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html
Requires [Node.js](https://nodejs.org/en/) 11.0.0+

## Install

`npm run install`

## Build

`npm run build`

## Serve

`npm run serve`

### TODO

1. Dont recursively find the data.json file. Just the one at the same level as the page being rendered.
1. Provide some convenience methods for getting context information from pages, layouts, and partials. I.e. an easy way to get the matching layout, data.json, and global.json, and maybe even a way to crawl the tree to the root and doing parent / children type of stuff with the data.json files.
1. Update the example /src files to be documentation of this project.
1. Update the package definition.
1. Make the /bin/build file the default module export
1. Make a installable cli utility

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
{
  'path-segment-1': html`...`
  'path-segment-2': html`...`
  ...
}
```

Layout definition:
```
page => html`
  ...
  ${page}
  ...
}
```
