# Getting Started With Orison For Github Pages

## Setup the project

Assuming you have already run `orison init --github-pages my-site`:

1. `cd my-site`
1. `npm install`
1. `npm run build`

## Make changes to your site

1. Make changes under /src based upon the [OrisonJS documentation](https://orison.alexlockhart.me)
1. Build the changes to /docs with `npm run build`
1. Test your changes by running `npm run serve` and going to localhost:3000

## Deploy changes

1. Push the changes to a Github repo.
1. Setup that Github repo to use Github Pages for hosting.

## Configure the build process

1. Configurations to how Orison builds your website can be made in ./orison.js
1. Configurations to how Orison serves the development version of the site can also be made in ./orison.js
