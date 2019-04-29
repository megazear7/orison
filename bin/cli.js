#!/usr/bin/env node

const ncp = require('ncp');
const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('./orison.js');
var pjson = require('../package.json');

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(pjson.version);

} else if (process.argv.includes('build')) {
  new OrisonGenerator({ rootPath: process.cwd() }).build();

} else if (process.argv.includes('serve')) {
  new OrisonServer({ rootPath: process.cwd() }).start();

} else if (process.argv.includes('static')) {
  new OrisonStaticServer({ rootPath: process.cwd() }).start();

} else if (process.argv.length === 4 && process.argv.includes('init')) {
  ncp(__dirname + '/templates/plain', process.argv[3], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--github-pages')) {
  ncp(__dirname + '/templates/github-pages', process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--firebase')) {
  ncp(__dirname + '/templates/firebase', process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });

} else if (process.argv.length === 5 && process.argv.includes('init') && process.argv.includes('--netlify')) {
  ncp(__dirname + '/templates/netlify', process.argv[4], err => {
    if (err) {
      return console.error(err);
    }
  });
}
