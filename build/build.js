const path = require('path');
const { OrisonGenerator } = require('../bin/orison.js');
const BuildPayload = require('./build-payload.js');

console.log('INCOMING_HOOK_BODY', process.env.INCOMING_HOOK_BODY);

const payload = new BuildPayload(process.env.INCOMING_HOOK_BODY);
const rootPath = path.dirname(__dirname);

if (payload.isBlogPost && payload.hasSlug) {
  // If we know that the scenario is a blog post update, rebuild only the blog post
  // itself and the blog listing pages.
  new OrisonGenerator({
    rootPath: rootPath,
    generatePath: '/blog/article',
    generateSlugs: [ payload.slug ]
  }).build();

  new OrisonGenerator({
    rootPath: rootPath,
    generatePath: '/blog',
    excludedPaths: '/blog/article'
  }).build();
} else {
  // If we don't know the build scenario, rebuild the whole site.
  new OrisonGenerator({ rootPath: rootPath }).build();
}
