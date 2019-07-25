const path = require('path');
const { OrisonGenerator, OrisonServer } = require('../bin/orison.js');
const BuildPayload = require('./build-payload.js');
require('dotenv').config();

console.log('INCOMING_HOOK_BODY', process.env.INCOMING_HOOK_BODY);

const payload = new BuildPayload(process.env.INCOMING_HOOK_BODY);
const rootPath = path.dirname(__dirname);

const loaders = [
  {
    name: 'anotherExample',
    loader: message => new Promise(resolve => resolve('Message from programatic loader: ' + message))
  }
];

if (process.argv.includes('serve')) {
  new OrisonServer({ rootPath, loaders }).start();
} else if (payload.isBlogPost && payload.hasSlug) {
  // If we know that the scenario is a blog post update, rebuild only the blog post
  // itself and the blog listing pages.
  new OrisonGenerator({
    rootPath: rootPath,
    loaders,
    generatePath: '/blog/article',
    generateSlugs: [ payload.slug ]
  }).build();

  new OrisonGenerator({
    rootPath,
    loaders,
    generatePath: '/blog',
    excludedPaths: [ '/blog/article' ]
  }).build();
} else {
  // If we don't know the build scenario, rebuild the whole site.
  new OrisonGenerator({ rootPath, loaders }).build();
}
