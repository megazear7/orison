import express from 'express';
import path from 'path';
import fs from 'fs';
import OrisonRenderer from './orison-renderer.js';
import OrisonPathMaker from './orison-path-maker.js';
import OrisonCacheLoader from './orison-cache-loader.js';
import { DEFAULTS } from './orison-esm.js';

/**
 * Creates an OrisonServer that can be used to serve a website based upon a specially formatted source directory.
 * @param {object} config Required configuration for the generator.
 * @param {string} config.rootPath Required. Determines the root path of the source and build directories.
 * @param {string} config.buildDir Optional. Defaults to "docs". The name of the build directory where the built files will go. The build directory should exist under the root path.
 * @param {string} config.srcDir Optional. Defaults to "src". This is the source directory. The static directory, pages directory, and partials directory should all exist under this directory. The source directory should exist under the root path.
 * @param {string} config.pagesDir Optional. Defaults to "pages". The name of the pages directory. This directory should exist under the source directory. This is the directory that will be rendered into the build directory and forms the hierarchy of your site.
 * @param {string} config.staticDir Optional. Defaults to "static". The name of the static directory. This directory should exist under the source directory. It will be copied as is into the build directory.
 * @param {string} config.indexFileBasename Optional. Defaults to "index". The base file name (without an extension) of the index files which are returned when a request comes through to a directory url instead of a specific file url.
 * @param {string} config.listFileBasename Optional. Defaults to "list". The base file name (without an extension) of the list files. These files are single JS files used to generate a list of pages.
 * @param {string} config.layoutFileBasename Optional. Defaults to "layout". The basename of the layouts created under the pages directory. Pages are inserted into the nearest layout within the pages hierarchy. As an example if "layout" is provided in this configuration then files named "layout.js" will be interpretted as layouts.
 * @param {string} config.dataFileBasename Optional. Defaults to "data". The basename of the data files under the pages directory. The output of these data files are provided to pages and serve as contextual site metadata.
 * @param {string} config.loaderDir Optional. Defaults to "loaders". The directory name under the src directory where the Orison loaders are defined. Review the Orison documentation for how to create a loader.
 * @param {string} config.fragmentName Optional. Defaults to "fragment". The string to identify fragments with. Fragments are pages that get rendered without the layout. This allows for page content to be requested without the surrounding layout and helps support single page application style linking. If "fragment" is provided, then each page will get a corresponding file built with the format "<page>.fragment.html" where the contents are the same as "<page>.html" but without the layout applied and where <page> is the basename of the corresponding page.
 * @param {string} config.page404 Optional. Defaults to "404.html". The path to the 404 page. If you wish to use a JS file to generate the 404 page then you will need to update this extension. If you move the name of location of the 404 file this property needs updated.
 * @param {string} config.page500 Optional. Defaults to "500.html". The path to the 500 page. If you wish to use a JS file to generate the 500 page then you will need to update this extension. If you move the name of location of the 500 file this property needs updated.
 * @param {string} config.stripHtml Optional. Defaults to false. This determines if you want to strip the html url extension from urls.
 * @param {array} config.loaders Optional. Defaults to an empty array. Any objects put in this array should have a name property that is a string and a loader prop that is a function. Review the documentation on the details for implementing a loader.
 * @param {string} config.port Optional. Defaults to 3000. Change this to change the port that is used by the server.
 * @returns {OrisonServer} An OrisonServer based upon the provided configurations.
 */
export default class OrisonServer {
  constructor({
      rootPath,
      buildDir = DEFAULTS.BUILD_DIR,
      srcDir = DEFAULTS.SRC_DIR,
      pagesDir = DEFAULTS.PAGES_DIR,
      staticPath = path.join(DEFAULTS.SRC_DIR, DEFAULTS.STATIC_DIR),
      indexFileBasename = DEFAULTS.INDEX_BASENAME,
      listFileBasename = DEFAULTS.LIST_BASENAME,
      layoutFileBasename = DEFAULTS.LAYOUT_BASENAME,
      dataFileBasename = DEFAULTS.DATA_BASENAME,
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

  /**
   * @returns {object} Start serving the provided src directory at the provided port, rendering pages on the fly. Returns the express server that can be used for further configuration.
   */
  start() {
    this.app.use(express.static(this.staticPath));

    this.app.get('*', (req, res) => {
      console.log(req.path);
      const segment = path.basename(req.path);
      res.header('Content-Type', 'text/html');
      try {
        const srcPath = this._srcPath(req.path, code => res.status(code));
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
            this._respondWith500(res, segment);
          });
        } else {
          res.send('404 - create a 404 page at ' + path.join(this.rootPath, this.srcDir, this.pagesDir, this.page404));
        }
      } catch (e) {
        console.error(e);
        this._respondWith500(res, segment);
      }
    });

    this.app.listen(this.port, () => console.log(`Example app listening on port ${this.port}!`));

    return this.app;
  }

  /* PRIVATE METHOD
   * @returns {void} Uses the provided response to reply with a 500.
   */
  _respondWith500(res, segment) {
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
        buildDir: this.buildDir,
        cacheLoader: this.cacheLoader
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

  /* PRIVATE METHOD
   * @returns {string} Generates a src path based upon the request path.
   */
  _srcPath(requestPathParam, setStatus) {
    const requestPath = this.pathMaker.create(requestPathParam.replace('.' + this.fragmentName, ''));

    const indexSrcPath = this._indexSrcPath(requestPath);
    if (indexSrcPath) return indexSrcPath;

    const listSrcPath = this._listSrcPath(requestPath);
    if (listSrcPath) return listSrcPath;

    const pageSrcPath = this._pageSrcPath(requestPath);
    if (pageSrcPath) return pageSrcPath;

    const jsonSrcPath= this._jsonSrcPath(requestPath);
    if (jsonSrcPath) return jsonSrcPath;

    setStatus(404);
    return this._src404Path();
  }

  /* PRIVATE METHOD
   * @returns {string} Generates a src path to an index file based upon the request path.
   */
  _indexSrcPath(requestPath) {
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

  /* PRIVATE METHOD
   * @returns {string} Generates a src path to an list file based upon the request path.
   */
  _listSrcPath(requestPath) {
    const listPath = this.pathMaker.create(path.join(path.dirname(requestPath.rel), this.listFileBasename + '.js'));
    if (listPath.exists) {
      return listPath.rel;
    }

    return undefined;
  }

  /* PRIVATE METHOD
   * @returns {string} Generates a src path to a page file based upon the request path.
   */
  _pageSrcPath(requestPath) {
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

  /* PRIVATE METHOD
   * @returns {string} Generates a src path to a json file based upon the request path.
   */
  _jsonSrcPath(requestPath) {
    if (requestPath.full.includes('.json')) {
      return requestPath.rel;
    }

    return undefined;
  }

  /* PRIVATE METHOD
   * @returns {string} Returns the 404 src file path if it exists otherwise it returns undefined.
   */
  _src404Path() {
    if (fs.existsSync(this.path404)) {
      return this.page404;
    }

    return undefined;
  }
}
