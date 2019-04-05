import express from 'express';
import path from 'path';
import fs from 'fs';
import OrisonRenderer from './orison-renderer.js';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_STATIC_DIR,
  DEFAULT_INDEX_BASENAME,
  DEFAULT_404_FILENAME,
  DEFAULT_PORT } from './orison-esm.js';

export default class  {
  constructor(
      rootPath,
      pagesPath = path.join(DEFAULT_SRC_DIR, DEFAULT_PAGES_DIR),
      staticPath = path.join(DEFAULT_SRC_DIR, DEFAULT_STATIC_DIR),
      indexFileBasename = DEFAULT_INDEX_BASENAME,
      page404 = DEFAULT_404_FILENAME,
      port = DEFAULT_PORT) {
    this.rootPath = rootPath;
    this.pagesPath = pagesPath;
    this.staticPath = staticPath;
    this.indexFileBasename = indexFileBasename;
    this.page404 = page404;
    this.port = DEFAULT_PORT;
    this.app = express();
  }

  start() {
    this.app.use(express.static(this.staticPath));

    this.app.get('*', (req, res) => {
      console.log(req.path);
      const srcPath = this.srcPath(req.path);
      console.log(srcPath);
      if (srcPath !== undefined) {
        const segment = req.path.substr(req.path.lastIndexOf('/') + 1);
        const renderer = new OrisonRenderer({file: srcPath, rootPath: this.rootPath});
        renderer.html(segment).then(html => res.send(html));
      } else {
        res.send('404 - create a 404 page at ' + path.join(this.pagesPath, this.page404));
      }
    });

    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }

  srcPath(requestPath) {
    const fullRequestPath = path.join(this.rootPath, this.pagesPath, requestPath);

    if (fs.existsSync(fullRequestPath)) {
      const stat = fs.statSync(fullRequestPath);
      const jsIndexFilePath = path.join(fullRequestPath, this.indexFileBasename + '.js');
      const htmlIndexFilePath = path.join(fullRequestPath, this.indexFileBasename + '.html');
      const mdIndexFilePath = path.join(fullRequestPath, this.indexFileBasename + '.md');
      if (stat.isDirectory()) {
        if (fs.existsSync(jsIndexFilePath)) {
          return jsIndexFilePath;
        } else if (fs.existsSync(htmlIndexFilePath)) {
          return htmlIndexFilePath;
        } else if (fs.existsSync(mdIndexFilePath)) {
          return mdIndexFilePath;
        }
      }
    } else if (! fullRequestPath.includes(`/${DEFAULT_INDEX_BASENAME}.`)) {
      const jsFilePath = path.format({ ...path.parse(fullRequestPath), ext: '.js', base: undefined});
      const htmlFilePath = path.format({ ...path.parse(fullRequestPath), ext: '.html', base: undefined});
      const mdFilePath = path.format({ ...path.parse(fullRequestPath), ext: '.md', base: undefined});

      if (fs.existsSync(jsFilePath)) {
        return jsFilePath;
      } else if (fs.existsSync(htmlFilePath)) {
        return htmlFilePath;
      } else if (fs.existsSync(mdFilePath)) {
        return mdFilePath;
      }
    }

    const path404 = path.join(this.rootPath, this.pagesPath, this.page404);
    if (fs.existsSync(path404)) {
      return path404;
    } else {
      return undefined;
    }
  }
}
