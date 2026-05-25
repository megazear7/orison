# Orison

[Orison Documentation](https://orison.alexlockhart.me)

* A static site generator using Lit templates.
* Uses [@lit-labs/ssr](https://www.npmjs.com/package/@lit-labs/ssr) for rendering.
* Uses [markdown-it](https://github.com/markdown-it/markdown-it) for markdown rendering.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/megazear7/orison-netlify-starter-kit)

## Install

```
nvm use 24.16.0
npm install
```

## Develop

```
npm start
```

This will:

 - Watch files under `/src` and build files to `/bin`
 - Serve the Orison project under `docs` to `localhost:3000` using the Orison code built to `/bin`

## Publish

Bump the version in `package.json`

```
npm publish
```

## Support

[Buy me a coffee](https://www.buymeacoffee.com/alexlockhart)

[Patreon](https://www.patreon.com/alexlockhart)
