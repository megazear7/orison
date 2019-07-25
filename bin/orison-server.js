import express from 'express';
import path from 'path';
import fs from 'fs';
import OrisonRenderer from './orison-renderer.js';
import OrisonPathMaker from './orison-path-maker.js';
import OrisonCacheLoader from './orison-cache-loader.js';
import { DEFAULTS } from './orison-esm.js';

export default class  {
  constructor({
      rootPath,
      srcDir = DEFAULTS.SRC_DIR,
      pagesDir = DEFAULTS.PAGES_DIR,
      staticPath = path.join(DEFAULTS.SRC_DIR, DEFAULTS.STATIC_DIR),
      indexFileBasename = DEFAULTS.INDEX_BASENAME,
      listFileBasename = DEFAULTS.LIST_BASENAME,
      layoutFileBasename = DEFAULTS.LAYOUT_BASENAME,
      dataFileBasename = DEFAULTS.DATA_BASENAME,
      buildDir = DEFAULTS.BUILD_DIR,
      loaderDir = DEFAULTS.LOADER_DIRECTORY,
      fragmentName = DEFAULTS.FRAGMENT_NAME,
      page404 = DEFAULTS.FILENAME_404,
      page500 = DEFAULTS.FILENAME_500,
      stripHtml = DEFAULTS.STRIP_HTML,
      loaders = [ ],
      port = DEFAULTS.PORT }) {
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
    this.port = port;
    this.app = express();
    this.pathMaker = new OrisonPathMaker(this.rootPath, this.srcDir, this.pagesDir);
    this.cacheLoader = new OrisonCacheLoader({
      loaderPath: path.join(this.rootPath, this.srcDir, loaderDir),
      initialLoaders: loaders
    });
  }

  start() {
    this.app.use(express.static(this.staticPath));

    this.app.get('*', (req, res) => {
      console.log(req.path);
      const segment = path.basename(req.path);
      try {
        const srcPath = this.srcPath(req.path, code => res.status(code));
        if (srcPath !== undefined) {
          const renderer = new OrisonRenderer({
            file: srcPath,
            rootPath: this.rootPath,
            srcDirectory: this.srcDir,
            layoutFileBasename: this.layoutFileBasename,
            dataFileBasename: this.dataFileBasename,
            pagesDirectory: this.pagesDir,
            fragmentName: this.fragmentName,
            buildDir: this.buildDir,
            cacheLoader: this.cacheLoader
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
            this.respondWith500(res, segment);
          });
        } else {
          res.send('404 - create a 404 page at ' + path.join(this.rootPath, this.srcDir, this.pagesDir, this.page404));
        }
      } catch (e) {
        console.error(e);
        this.respondWith500(res, segment);
      }
    });

    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));
  }

  respondWith500(res, segment) {
    res.status(500);
    const path500 = path.join(this.rootPath, this.srcDir, this.pagesDir, this.page500);

    if (fs.existsSync(path500)) {
      const renderer = new OrisonRenderer({
        file: this.page500,
        rootPath: this.rootPath,
        srcDirectory: this.srcDir,
        layoutFileBasename: this.layoutFileBasename,
        dataFileBasename: this.dataFileBasename,
        pagesDirectory: this.pagesDir,
        fragmentName: this.fragmentName,
        buildDir: this.buildDir
      })
      .html(segment)
      .then(html => res.send(html))
      .catch(e => {
        console.log('Error while generating 500 error page', e);
        const html500 = fs.readFileSync(path500).toString();
        res.send(html500);
      });
    } else {
      res.send('500 - create a 500 page at ' + path.join(this.rootPath, this.srcDir, this.pagesDir, this.page500));
    }
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

      if (! strippedRequestPath.full.includes(`${path.sep}${this.indexFileBasename}.`)) {
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
