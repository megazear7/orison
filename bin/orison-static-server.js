const express = require('express');
const path = require('path');
import { DEFAULT_BUILD_DIR, DEFAULT_PORT } from './orison-esm.js';

export default class {
  constructor(dir = DEFAULT_BUILD_DIR, port = DEFAULT_PORT) {
    this.dir = dir;
    this.port = port;
    this.app = express();
  }

  start() {
    this.app.use(express.static(this.dir));
    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }
}
