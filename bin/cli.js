#!/usr/bin/env node

const ncp = require('ncp');
const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('./orison.js');

if (process.argv.includes('build')) new OrisonGenerator({ rootPath: process.cwd() }).build();
if (process.argv.includes('serve')) new OrisonServer({ rootPath: process.cwd() }).start();
if (process.argv.includes('static')) new OrisonStaticServer().start();

if (process.argv.length === 4 && process.argv.includes('init')) {
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
}
