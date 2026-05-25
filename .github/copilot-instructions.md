# Orison Copilot Instructions

Orison is a TypeScript project that uses Lit templates for rendering specifically formatted JavaScript files into static HTML.
Projects that use Orison can be TypeScript or JavaScript projects, but should be on Node.js version 24.16.0 or later.
It also includes an Express server for serving the generated static files for development.
The implementation of Orison is contained in the `src` directory, and the generated files are output to the `bin` directory.
It is published as an npm package, and the source code is available on GitHub.
The project uses Prettier and ESLint for code formatting and linting, respectively.
The docs directory contains documentation for the project, which is also generated using Orison.
The templates directory contains minimal example Orison projects that can be used as a starting point for new projects.
The documentation includes a "Deploy to Netlify" button `templates/netlify` which deploys a simple static site. Later on we will add more templates with "Deploy to Netlify" buttons for different use cases.
