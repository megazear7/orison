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
  DEFAULT_500_FILENAME,
  DEFAULT_STRIP_HTML,
  DEFAULT_PORT } from './orison-esm.js';

export default class  {
  constructor({
      rootPath,
      pagesPath = path.join(DEFAULT_SRC_DIR, DEFAULT_PAGES_DIR),
      staticPath = path.join(DEFAULT_SRC_DIR, DEFAULT_STATIC_DIR),
      indexFileBasename = DEFAULT_INDEX_BASENAME,
      page404 = DEFAULT_404_FILENAME,
      page500 = DEFAULT_500_FILENAME,
      stripHtml = DEFAULT_STRIP_HTML,
      port = DEFAULT_PORT }) {
    this.rootPath = rootPath;
    this.pagesPath = pagesPath;
    this.staticPath = staticPath;
    this.indexFileBasename = indexFileBasename;
    this.page404 = page404;
    this.path404 = path.join(this.rootPath, this.pagesPath, this.page404);
    this.page500 = page500;
    this.stripHtml = stripHtml;
    this.port = DEFAULT_PORT;
    this.app = express();
  }

  start() {
    this.app.use(express.static(this.staticPath));

    this.app.get('*', (req, res) => {
      console.log(req.path);
      const srcPath = this.srcPath(req.path, code => res.status(code));
      if (srcPath !== undefined) {
        const segment = req.path.substr(req.path.lastIndexOf('/') + 1);
        const renderer = new OrisonRenderer({file: srcPath, rootPath: this.rootPath});
        renderer.html(segment, this.path404)
        .then(html => {
          if (html) {
            res.send(html)
          } else {
            res.send('404 - create a 404 page at ' + path.join(this.pagesPath, this.page404));
          }
        })
        .catch(e => {
          console.error(e);
          res.status(500);
          const page500 = path.join(this.rootPath, this.pagesPath, this.page500);

          if (fs.existsSync(page500)) {
            const html500 = fs.readFileSync(page500).toString();
            res.send(html500);
          } else {
            res.send('500 - create a 500 page at ' + path.join(this.pagesPath, this.page500));
          }
        });
      } else {
        res.send('404 - create a 404 page at ' + path.join(this.pagesPath, this.page404));
      }
    });

    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }

  srcPath(requestPath, setStatus) {
    const fullRequestPath = path.join(this.rootPath, this.pagesPath, requestPath).replace('.fragment', '');
    const indexFullRequestPath = fullRequestPath.replace('index.html', '');

    if (fs.existsSync(indexFullRequestPath)) {
      const stat = fs.statSync(indexFullRequestPath);
      const jsIndexFilePath = path.join(indexFullRequestPath, this.indexFileBasename + '.js');
      const htmlIndexFilePath = path.join(indexFullRequestPath, this.indexFileBasename + '.html');
      const mdIndexFilePath = path.join(indexFullRequestPath, this.indexFileBasename + '.md');
      if (stat.isDirectory()) {
        if (fs.existsSync(jsIndexFilePath)) {
          return jsIndexFilePath;
        } else if (fs.existsSync(htmlIndexFilePath)) {
          return htmlIndexFilePath;
        } else if (fs.existsSync(mdIndexFilePath)) {
          return mdIndexFilePath;
        }
      }
    }

    if ((fullRequestPath.includes('.html') && ! this.stripHtml) || (! fullRequestPath.includes('.html') && this.stripHtml)) {
      const strippedRequestPath = this.stripHtml ? fullRequestPath.replace('.html', '') : fullRequestPath;
      if (! strippedRequestPath.includes(`/${DEFAULT_INDEX_BASENAME}.`)) {
        const jsFilePath = path.format({ ...path.parse(strippedRequestPath), ext: '.js', base: undefined});
        const htmlFilePath = path.format({ ...path.parse(strippedRequestPath), ext: '.html', base: undefined});
        const mdFilePath = path.format({ ...path.parse(strippedRequestPath), ext: '.md', base: undefined});

        if (fs.existsSync(jsFilePath)) {
          return jsFilePath;
        } else if (fs.existsSync(htmlFilePath)) {
          return htmlFilePath;
        } else if (fs.existsSync(mdFilePath)) {
          return mdFilePath;
        }
      }
    }

    const listPath = path.join(fullRequestPath.slice(0, fullRequestPath.lastIndexOf('/')), 'list.js');
    if (fs.existsSync(listPath)) {
      return listPath;
    }

    setStatus(404);
    if (fs.existsSync(this.path404)) {
      return this.path404;
    } else {
      return undefined;
    }
  }
}
