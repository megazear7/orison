import express from 'express';
import path from 'path';
import fs from 'fs';
import OrisonRenderer from './orison-renderer.js';
import OrisonPathMaker from './orison-path-maker.js';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_STATIC_DIR,
  DEFAULT_INDEX_BASENAME,
  DEFAULT_LIST_BASENAME,
  DEFAULT_FRAGMENT_NAME,
  DEFAULT_LAYOUT_BASENAME,
  DEFAULT_DATA_BASENAME,
  DEFAULT_BUILD_DIR,
  DEFAULT_404_FILENAME,
  DEFAULT_500_FILENAME,
  DEFAULT_STRIP_HTML,
  DEFAULT_PORT } from './orison-esm.js';

export default class  {
  constructor({
      rootPath,
      srcDir = DEFAULT_SRC_DIR,
      pagesDir = DEFAULT_PAGES_DIR,
      staticPath = path.join(DEFAULT_SRC_DIR, DEFAULT_STATIC_DIR),
      indexFileBasename = DEFAULT_INDEX_BASENAME,
      listFileBasename = DEFAULT_LIST_BASENAME,
      layoutFileBasename = DEFAULT_LAYOUT_BASENAME,
      dataFileBasename = DEFAULT_DATA_BASENAME,
      buildDir = DEFAULT_BUILD_DIR,
      fragmentName = DEFAULT_FRAGMENT_NAME,
      page404 = DEFAULT_404_FILENAME,
      page500 = DEFAULT_500_FILENAME,
      stripHtml = DEFAULT_STRIP_HTML,
      port = DEFAULT_PORT }) {
    this.rootPath = rootPath;
    this.pagesDir = pagesDir;
    this.srcDir = srcDir;
    this.staticPath = staticPath;
    this.indexFileBasename = indexFileBasename;
    this.listFileBasename = listFileBasename;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.buildDir = buildDir;
    this.fragmentName = fragmentName;
    this.page404 = page404;
    this.path404 = path.join(this.rootPath, this.srcDir, this.pagesDir, this.page404);
    this.page500 = page500;
    this.stripHtml = stripHtml;
    this.port = DEFAULT_PORT;
    this.app = express();
    this.pathMaker = new OrisonPathMaker(this.rootPath, this.srcDir, this.pagesDir);
  }

  start() {
    this.app.use(express.static(this.staticPath));

    this.app.get('*', (req, res) => {
      console.log(req.path);
      const srcPath = this.srcPath(req.path, code => res.status(code));
      if (srcPath !== undefined) {
        const segment = path.basename(req.path);
        const renderer = new OrisonRenderer({
          file: srcPath,
          rootPath: this.rootPath,
          srcDirectory: this.srcDir,
          layoutFileBasename: this.layoutFileBasename,
          dataFileBasename: this.dataFileBasename,
          pagesDirectory: this.pagesDir,
          fragmentName: this.fragmentName,
          buildDir: this.buildDir
        });
        renderer.html(segment, this.page404)
        .then(html => {
          if (html) {
            res.send(html)
          } else {
            res.send('404 - create a 404 page at ' + path.join(this.srcDir, this.pagesDir, this.page404));
          }
        })
        .catch(e => {
          console.error(e);
          res.status(500);
          const page500 = path.join(this.rootPath, this.srcDir, this.pagesDir, this.page500);

          if (fs.existsSync(page500)) {
            const html500 = fs.readFileSync(page500).toString();
            res.send(html500);
          } else {
            res.send('500 - create a 500 page at ' + path.join(this.rootPath, this.srcDir, this.pagesDir, this.page500));
          }
        });
      } else {
        res.send('404 - create a 404 page at ' + path.join(this.rootPath, this.srcDir, this.pagesDir, this.page404));
      }
    });

    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }

  srcPath(requestPathParam, setStatus) {
    const requestPath = this.pathMaker.create(requestPathParam.replace('.' + this.fragmentName, ''));

    const indexSrcPath = this.indexSrcPath(requestPath);
    if (indexSrcPath) return indexSrcPath;

    const listSrcPath = this.listSrcPath(requestPath);
    if (listSrcPath) return listSrcPath;

    const pageSrcPath = this.pageSrcPath(requestPath);
    if (pageSrcPath) return pageSrcPath;

    const jsonSrcPath= this.jsonSrcPath(requestPath);
    if (jsonSrcPath) return jsonSrcPath;

    setStatus(404);
    return this.src404Path();
  }

  indexSrcPath(requestPath) {
    const indexRequestPath = this.pathMaker.create(requestPath.rel.replace(this.indexFileBasename + '.html', ''));

    if (indexRequestPath.exists) {
      const jsIndexPath = this.pathMaker.create(path.join(indexRequestPath.rel, this.indexFileBasename + '.js'));
      const htmlIndexPath = this.pathMaker.create(path.join(indexRequestPath.rel, this.indexFileBasename + '.html'));
      const mdIndexPath = this.pathMaker.create(path.join(indexRequestPath.rel, this.indexFileBasename + '.md'));

      if (indexRequestPath.isDirectory) {
        if (jsIndexPath.exists) {
          return jsIndexPath.rel;
        } else if (htmlIndexPath.exists) {
          return htmlIndexPath.rel;
        } else if (mdIndexPath.exists) {
          return mdIndexPath.rel;
        }
      }
    }

    return undefined;
  }

  listSrcPath(requestPath) {
    const listPath = this.pathMaker.create(path.join(path.dirname(requestPath.rel), this.listFileBasename + '.js'));
    if (listPath.exists) {
      return listPath.rel;
    }

    return undefined;
  }

  pageSrcPath(requestPath) {
    if ((requestPath.full.includes('.html') && ! this.stripHtml) || (! requestPath.full.includes('.html') && this.stripHtml)) {
      const strippedRequestPath = this.pathMaker.create(this.stripHtml ? requestPath.rel.replace('.html', '') : requestPath.rel);

      if (! strippedRequestPath.full.includes(`${path.sep}${DEFAULT_INDEX_BASENAME}.`)) {
        const jsFilePath = this.pathMaker.create(path.format({ ...path.parse(strippedRequestPath.rel), ext: '.js', base: undefined}));
        const htmlFilePath = this.pathMaker.create(path.format({ ...path.parse(strippedRequestPath.rel), ext: '.html', base: undefined}));
        const mdFilePath = this.pathMaker.create(path.format({ ...path.parse(strippedRequestPath.rel), ext: '.md', base: undefined}));

        if (jsFilePath.exists) {
          return jsFilePath.rel;
        } else if (htmlFilePath.exists) {
          return htmlFilePath.rel;
        } else if (mdFilePath.exists) {
          return mdFilePath.rel;
        }
      }
    }

    return undefined;
  }

  jsonSrcPath(requestPath) {
    if (requestPath.full.includes('.json')) {
      return requestPath.rel;
    }

    return undefined;
  }

  src404Path() {
    if (fs.existsSync(this.path404)) {
      return this.page404;
    }

    return undefined;
  }
}
