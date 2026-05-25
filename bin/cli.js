#!/usr/bin/env node
'use strict';

var path = require('node:path');
var process = require('node:process');
var orisonStaticServer = require('./orison-static-server-yDtzVfnZ.js');
require('express');
require('node:fs');
require('node:fs/promises');
require('node:os');
require('@lit-labs/ssr/lib/render-result.js');
require('@lit-labs/ssr');
require('jiti');
require('lit/directives/unsafe-html.js');
require('markdown-it');
require('@lit-labs/ssr/lib/server-template.js');

const [, , command, rootArgument] = process.argv;
const rootPath = rootArgument
    ? path.resolve(process.cwd(), rootArgument)
    : process.cwd();
async function main() {
    switch (command) {
        case "build":
            await new orisonStaticServer.OrisonGenerator({ rootPath }).build();
            return;
        case "serve":
            await new orisonStaticServer.OrisonServer({ rootPath }).start();
            return;
        case "static":
            await new orisonStaticServer.OrisonStaticServer({ rootPath }).start();
            return;
        default:
            console.error("Usage: orison <build|serve|static> [rootPath]");
            process.exitCode = 1;
    }
}
void main();
//# sourceMappingURL=cli.js.map
