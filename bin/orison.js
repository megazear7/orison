'use strict';

var serverTemplate_js = require('@lit-labs/ssr/lib/server-template.js');
var orisonStaticServer = require('./orison-static-server-yDtzVfnZ.js');
require('express');
require('node:fs');
require('node:fs/promises');
require('node:path');
require('node:os');
require('@lit-labs/ssr/lib/render-result.js');
require('@lit-labs/ssr');
require('jiti');
require('lit/directives/unsafe-html.js');
require('markdown-it');



Object.defineProperty(exports, "html", {
	enumerable: true,
	get: function () { return serverTemplate_js.html; }
});
exports.OrisonGenerator = orisonStaticServer.OrisonGenerator;
exports.OrisonServer = orisonStaticServer.OrisonServer;
exports.OrisonStaticServer = orisonStaticServer.OrisonStaticServer;
//# sourceMappingURL=orison.js.map
