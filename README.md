# Orison

> Status: pre-release

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses [express](https://expressjs.com/) for a server when being used as a server.
* Uses [markdown-it](https://github.com/markdown-it/markdown-it) for markdown rendering.

# Development on this project

## Install

```
npm run install
```

## Develop

```
npm run serve
# Available at localhost:3000
```

## Deploy

```
# Commit your changes
npm run build
npm run static
# Test the production build at localhost:3000
git push origin master
# The Github and Netlify build integration will auto deploy the changes
```
