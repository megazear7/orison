#!/usr/bin/env node

const ncp = require('ncp');
const path = require('path');
const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('./orison.js');
const pjson = require('../package.json');
const {
  DEFAULT_GENERATE_PATH,
  DEFAULT_SRC_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_STATIC_DIR,
  DEFAULT_INDEX_BASENAME,
  DEFAULT_LIST_BASENAME,
  DEFAULT_FRAGMENT_NAME,
  DEFAULT_LAYOUT_BASENAME,
  DEFAULT_DATA_BASENAME,
  DEFAULT_BUILD_DIR,
  DEFAULT_404_FILENAME,
  DEFAULT_500_FILENAME,
  DEFAULT_STRIP_HTML,
  DEFAULT_PORT } = require('./orison-esm.js');

const generatePath = getConfig('--generatePath', DEFAULT_GENERATE_PATH);
const srcDir = getConfig('--srcDir', DEFAULT_SRC_DIR);
const pagesDir = getConfig('--pagesDir', DEFAULT_PAGES_DIR);
const staticDir = getConfig('--staticDir', DEFAULT_STATIC_DIR);
const indexBasename = getConfig('--indexBasename', DEFAULT_INDEX_BASENAME);
const listBasename = getConfig('--listBasename', DEFAULT_LIST_BASENAME);
const fragmentBasename = getConfig('--fragmentBasename', DEFAULT_FRAGMENT_NAME);
const layoutBasename = getConfig('--layoutBasename', DEFAULT_LAYOUT_BASENAME);
const dataBasename = getConfig('--dataBasename', DEFAULT_DATA_BASENAME);
const buildDir = getConfig('--buildDir', DEFAULT_BUILD_DIR);
const file404 = getConfig('--file404', DEFAULT_404_FILENAME);
const file500 = getConfig('--file500', DEFAULT_500_FILENAME);
const stripHtml = !! getConfig('--stripHtml', DEFAULT_STRIP_HTML);
const port = parseInt(getConfig('--port', DEFAULT_PORT));

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(pjson.version);

} else if (process.argv.includes('build')) {
  new OrisonGenerator({
    rootPath: process.cwd(),
    generatePath: generatePath,
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
  ncp(path.join(__dirname, 'templates', 'plain'), process.argv[3], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--github-pages')) {
  ncp(path.join(__dirname, 'templates', 'github-pages'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--firebase')) {
  ncp(path.join(__dirname, 'templates', 'firebase'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--netlify')) {
  ncp(path.join(__dirname, 'templates', 'netlify'), process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });
}

function getConfig(name, defaultValue) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : defaultValue;
}
