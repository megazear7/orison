#!/usr/bin/env node

const ncp = require('ncp');
const path = require('path');
const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('./orison.js');
const pjson = require('../package.json');
const { DEFAULTS } = require('./orison-esm.js');

const generatePath = getConfig('--generatePath', DEFAULTS.GENERATE_PATH);
const generateSlugs = getArrayConfig('--generateSlugs', DEFAULTS.GENERATE_SLUGS);
const excludedPaths = getArrayConfig('--excludedPaths', DEFAULTS.EXCLUDED_PATHS);
const srcDir = getConfig('--srcDir', DEFAULTS.SRC_DIR);
const pagesDir = getConfig('--pagesDir', DEFAULTS.PAGES_DIR);
const staticDir = getConfig('--staticDir', DEFAULTS.STATIC_DIR);
const indexBasename = getConfig('--indexBasename', DEFAULTS.INDEX_BASENAME);
const listBasename = getConfig('--listBasename', DEFAULTS.LIST_BASENAME);
const fragmentBasename = getConfig('--fragmentBasename', DEFAULTS.FRAGMENT_NAME);
const layoutBasename = getConfig('--layoutBasename', DEFAULTS.LAYOUT_BASENAME);
const dataBasename = getConfig('--dataBasename', DEFAULTS.DATA_BASENAME);
const buildDir = getConfig('--buildDir', DEFAULTS.BUILD_DIR);
const file404 = getConfig('--file404', DEFAULTS.FILENAME_404);
const file500 = getConfig('--file500', DEFAULTS.FILENAME_500);
const stripHtml = !! getConfig('--stripHtml', DEFAULTS.STRIP_HTML);
const port = parseInt(getConfig('--port', DEFAULTS.PORT));

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(pjson.version);

} else if (process.argv.includes('build')) {
  new OrisonGenerator({
    rootPath: process.cwd(),
    generatePath: generatePath,
    generateSlugs: generateSlugs,
    excludedPaths: excludedPaths,
    buildDir: buildDir,
    staticDirectory: staticDir,
    pagesDirectory: pagesDir,
    srcDirectory: srcDir,
    layoutFileBasename: layoutBasename,
    dataFileBasename: dataBasename,
    fragmentName: fragmentBasename
  }).build();

} else if (process.argv.includes('serve')) {
  new OrisonServer({
    rootPath: process.cwd(),
    srcDir: srcDir,
    pagesDir: pagesDir,
    staticPath: path.join(srcDir, staticDir),
    indexFileBasename: indexBasename,
    listFileBasename: listBasename,
    layoutFileBasename: layoutBasename,
    dataFileBasename: dataBasename,
    buildDir: buildDir,
    fragmentName: fragmentBasename,
    page404: file404,
    page500: file500,
    stripHtml: stripHtml,
    port: port
  }).start();

} else if (process.argv.includes('static')) {
  new OrisonStaticServer({
    rootPath: process.cwd(),
    dir: buildDir,
    port: port
  }).start();

} else if (process.argv.length === 4 && process.argv.includes('init')) {
  ncp(path.join(__dirname, '../templates', 'plain'), process.argv[3], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--github-pages')) {
  ncp(path.join(__dirname, '../templates', 'github-pages'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--firebase')) {
  ncp(path.join(__dirname, '../templates', 'firebase'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--netlify')) {
  ncp(path.join(__dirname, '../templates', 'netlify'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });
} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--netlify')) {
  ncp(path.join(__dirname, '../templates', 'contentful-netlify'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });
}

/**
 * Retrieves command line configurations from `process.argv` in the format:
 *   --name value
 * Where "name" is the `name` parameter and value is the return value.
 * If no config is found then `defaultValue` is returned if the parameter is provided.
 * Otherwise undefined is returned.
 * @param {string} name Required. The name of the parameter to look in `process.argv` for.
 * @param {string} defaultValue Optional. The value to return if the config is not found.
 * @returns {string} The value found in `process.argv` if it exists or the defaultValue parameter if the config is not found, or undefined if the config is not found and no default value was provided.
 */
function getConfig(name, defaultValue) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : defaultValue;
}

/**
 * This functions the same as `getConfig` except that it splits the value found in `process.argv` on the ',' character.
 * @param {string} name Required. The name of the parameter to look in `process.argv` for.
 * @param {array} defaultValue Optional. The value to return if the config is not found. Defaults to an empty array if not provided.
 * @returns {array} The value found in `process.argv` if it exists or the defaultValue parameter if the config is not found, or an empty array if no default value was provided.
 */
function getArrayConfig(name, defaultValue = []) {
  const stringVal = getConfig(name, undefined);
  return stringVal
    ? stringVal.split(',').filter(val => !! val)
    : defaultValue;
}
