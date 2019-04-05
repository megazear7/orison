import express from 'express';
import path from 'path';
import OrisonRenderer from './orison-renderer.js';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_STATIC_DIR,
  DEFAULT_PORT } from './orison.js';

export default class  {
  constructor(
      rootPath,
      pagesPath = path.join(DEFAULT_SRC_DIR, DEFAULT_PAGES_DIR),
      staticPath = path.join(DEFAULT_SRC_DIR, DEFAULT_STATIC_DIR),
      port = DEFAULT_PORT) {
    this.rootPath = rootPath;
    this.pagesPath = pagesPath;
    this.staticPath = staticPath;
    this.port = DEFAULT_PORT;
    this.app = express();
  }

  start() {
    this.app.use(express.static(this.staticPath));

    this.app.get('*', (req, res) => {
      console.log(req.path);
      const renderer = new OrisonRenderer({file: 'test.md', rootPath: this.rootPath});
      res.send('Hello, World!');
    });

    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }
}
