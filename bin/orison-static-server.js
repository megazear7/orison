const express = require('express');
const path = require('path');
import { DEFAULT_BUILD_DIR, DEFAULT_PORT } from './orison-esm.js';

export default class {
  constructor({
      rootPath,
      dir = DEFAULT_BUILD_DIR,
      port = DEFAULT_PORT
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
