import express from 'express';
import path from 'path';
import { DEFAULTS } from './orison-esm.js';

/**
 * Creates an OrisonStaticServer that can serve the result of the OrisonGenerator. This can be used as a preview which more closely matche how the live site will behave than the OrisonServer. It requires that the OrisonGenerator as already been used to generate the static files.
 * @param {object} config Required configuration for the generator.
 * @param {string} config.rootPath Required. Determines the root path of the source and build directories.
 * @param {string} config.dir Optional. Defaults to 'docs'. This determines what directory the built files are in. This directories contents should be the output of the OrisonGenerator.
 * @param {string} config.port Optional. Defaults to '3000'. Change this to change which port the static server should listen to.
 * @returns {OrisonStaticServer} An OrisonStaticServer based upon the provided configurations.
 */
export default class OrisonStaticServer {
  constructor({
      rootPath,
      dir = DEFAULTS.BUILD_DIR,
      port = DEFAULTS.PORT
    }) {
    this.rootPath = rootPath;
    this.dir = dir;
    this.port = port;
    this.app = express();
  }

  /**
   * @returns {object} Start serving the provided build directory at the provided port. Returns the express server that can be used for further configuration.
   */
  start() {
    this.app.use(express.static(this.dir));
    this.app.use((req, res) => {
      res.status(404);
      res.sendFile(path.join(this.rootPath, this.dir, '404.html'));
    });
    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));

    return this.app;
  }
}
