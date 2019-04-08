#!/usr/bin/env node

const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('./orison.js');

if (process.argv.includes('build')) new OrisonGenerator({ rootPath: process.cwd() }).build();
if (process.argv.includes('serve')) new OrisonServer({ rootPath: process.cwd() }).start();
if (process.argv.includes('static')) new OrisonStaticServer().start();
