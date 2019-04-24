const { OrisonGenerator, OrisonServer, OrisonStaticServer } = require('./bin/orison.js');

if (process.argv.includes('build')) new OrisonGenerator({ rootPath: __dirname }).build();
if (process.argv.includes('serve')) new OrisonServer({ rootPath: __dirname }).start();
if (process.argv.includes('static')) new OrisonStaticServer({ rootPath: __dirname }).start();
