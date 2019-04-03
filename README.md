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

1. Delete everything in buildDir except the CNAME. Make the file names that get skipped a configurable array.
1. Update the example /src files to be documentation of this project.
1. Update the package definition, giving the project a name, and making the /bin/build.js installed as a global cli utility.

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
