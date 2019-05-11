import express from 'express';
import path from 'path';
import { DEFAULTS } from './orison-esm.js';

export default class {
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

  start() {
    this.app.use(express.static(this.dir));
    this.app.use((req, res) => {
      res.status(404);
      res.sendFile(path.join(this.rootPath, this.dir, '404.html'));
    });
    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }
}
