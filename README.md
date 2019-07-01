# Orison

[Orison Documentation](https://orison.alexlockhart.me)

* Can be used as a static site generator or server.
* Uses [lit-html](https://github.com/Polymer/lit-html) for rendering.
* Uses [lit-html-server](https://github.com/popeindustries/lit-html-server) for server side rendering with lit-html.
* Uses [express](https://expressjs.com/) for a server when being used as a server.
* Uses [markdown-it](https://github.com/markdown-it/markdown-it) for markdown rendering.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/megazear7/orison-netlify-starter-kit)

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

When updating the `/bin` directory, you can rebuild the site documentation with:

```
npm run jsdocs
```

This will update a partial at `/src/partials/documentation/jsdocs.md`. This will then need
deployed by committing the change to master as any other `/src` change would.

## Deploy

```
# Commit your changes
npm run build
npm run static
# Test the production build at localhost:3000
git push origin master
# The Github and Netlify build integration will auto deploy the changes
```
