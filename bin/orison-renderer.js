import md from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';
import { html, renderToString } from '@popeindustries/lit-html-server';
import OrisonDirectory from './orison-directory.js';
import OrisonPathMaker from './orison-path-maker.js';
import OrisonCacheLoader from './orison-cache-loader.js';
import { mdString, mdFile } from './markdown.js';
import { DEFAULTS } from './orison-esm.js';

/**
 * Creates an OrisonRenderer that can be used to build a website based upon a specially formatted source directory.
 * @param {object} config Required configuration for the generator.
 * @param {string} config.file Required. The file to render. Should be relative to the src directory.
 * @param {string} config.rootPath Required. Determines the root path of the source and build directories.
 * @param {string} config.srcDirectory Optional. Defaults to "src". This is the source directory. The static directory, pages directory, and partials directory should all exist under this directory. The source directory should exist under the root path.
 * @param {string} config.layoutFileBasename Optional. Defaults to "layout". The basename of the layouts created under the pages directory. Pages are inserted into the nearest layout within the pages hierarchy. As an example if "layout" is provided in this configuration then files named "layout.js" will be interpretted as layouts.
 * @param {string} config.dataFileBasename Optional. Defaults to "data". The basename of the data files under the pages directory. The output of these data files are provided to pages and serve as contextual site metadata.
 * @param {string} config.pagesDirectory Optional. Defaults to "pages". The name of the pages directory. This directory should exist under the source directory. This is the directory that will be rendered into the build directory and forms the hierarchy of your site.
 * @param {string} config.fragmentName Optional. Defaults to "fragment". The string to identify fragments with. Fragments are pages that get rendered without the layout. This allows for page content to be requested without the surrounding layout and helps support single page application style linking. If "fragment" is provided, then each page will get a corresponding file built with the format "<page>.fragment.html" where the contents are the same as "<page>.html" but without the layout applied and where <page> is the basename of the corresponding page.
 * @param {string} config.buildDir Optional. Defaults to "docs". The name of the build directory where the built files will go. The build directory should exist under the root path.
 * @param {array} config.loaders Optional. Defaults to an empty array. Any objects put in this array should have a name property that is a string and a loader prop that is a function. Review the documentation on the details for implementing a loader.
 * @returns {OrisonRenderer} An OrisonRenderer based upon the provided configurations.
 */
export default class OrisonRenderer {
  constructor({
      file,
      rootPath,
      srcDirectory = DEFAULTS.SRC_DIR,
      layoutFileBasename = DEFAULTS.LAYOUT_BASENAME,
      dataFileBasename = DEFAULTS.DATA_BASENAME,
      pagesDirectory = DEFAULTS.PAGES_DIR,
      fragmentName = DEFAULTS.FRAGMENT_NAME,
      buildDir = DEFAULTS.BUILD_DIR,
      cacheLoader = new OrisonCacheLoader()
    }) {
    this.pathMaker = new OrisonPathMaker(rootPath, srcDirectory, pagesDirectory);
    this.file = this.pathMaker.create(file);
    this.rootPath = rootPath;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.pagesDirectory = pagesDirectory;
    this.fragmentName = fragmentName;
    this.buildDir = buildDir;
    this.localDirectory = this.createOrisonDirectory(path.dirname(file));
    this.rootDirectory = this.createOrisonDirectory(path.sep);
    this.cacheLoader = cacheLoader;
  }

  writeFile(file) {
    return file.html.then(html => {
      fs.writeFile(file.path, html, err => err && console.log(err))

      return file.path.slice(this.buildPath.length);
    });
  }

  write(slugs) {
    if (slugs && slugs.length > 0) {
      return slugs.map(slug =>
        Promise.resolve(this.render(slug)).then(renderResult =>
          Array.isArray(renderResult)
            ? renderResult.map(file => this.writeFile(file))
            : this.writeFile(renderResult)));
    } else {
      return Promise.resolve(this.render()).then(renderResult =>
        Array.isArray(renderResult)
          ? renderResult.map(file => this.writeFile(file))
          : this.writeFile(renderResult));
    }
  }

  html(segment, path404) {
    return Promise.resolve(this.render(segment)).then(renderResult => {
      if (Array.isArray(renderResult)) {
        if (renderResult.length > 0) {
          if (segment.includes('.' + this.fragmentName)) {
            return renderResult[1].html;
          } else {
            return renderResult[0].html;
          }
        } else {
          const page404Result = this.renderHtmlFile(path404);
          if (page404Result.length > 1) {
            if (segment.includes('.' + this.fragmentName)) {
              return page404Result[1].html;
            } else {
              return page404Result[0].html;
            }
          }
        }
      } else {
        return renderResult.html;
      }
    });
  }

  render(segment) {
    if (this.file.rel.endsWith('.md')) {
      return this.renderMdFile();
    } else if (this.file.rel.endsWith('.js')) {
      return this.renderJsFile(segment);
    } else if (this.file.rel.endsWith('.html')) {
      return this.renderHtmlFile();
    } else if (this.file.rel.endsWith('.json')) {
      return this.renderJsonFile();
    }
  }

  renderHtmlFile(filePathOverride) {
    const filePath = filePathOverride ? filePathOverride : this.file.full;
    const context = this.context();

    return [
      {
        path: this.buildFilePath,
        html: this.localDirectory.layout
            .then(layout => renderToString(layout({
              ...context,
              page: {
                html: eval('html`' + fs.readFileSync(filePath).toString() + '`'),
                path: this.pageContextPath
              }
            })))
      },
      {
        path: this.buildFragmentPath,
        html: renderToString(eval('html`' + fs.readFileSync(filePath).toString() + '`')),
      }
    ];
  }

  renderMdFile() {
    return [
      {
        path: this.buildFilePath,
        html: this.localDirectory.layout.then(layout => renderToString(layout({
          ...this.context(),
          page: {
            html: html`${unsafeHTML(this.markdownHtml)}`,
            path: this.pageContextPath
          }
        })))
      },
      {
        path: this.buildFragmentPath,
        html: renderToString(html`${unsafeHTML(this.markdownHtml)}`)
      }
    ];
  }

  renderJsFile(segment) {
    if (process.env.NODE_ENV !== 'production') {
      this.clearSrcModuleCache();
    }
    const fileExport = require(this.file.full).default;
    const slug = segment ? segment.replace('.html', '').replace('.' + this.fragmentName, '') : undefined;
    const context = this.context();

    return Promise.all([Promise.resolve(fileExport(context, slug)), Promise.resolve(fileExport(context, slug))])
    .then(fileExportResults => {
      const exportCopy1 = fileExportResults[0];
      const exportCopy2 = fileExportResults[1];

      if (Array.isArray(exportCopy1)) {
        return [
          ...exportCopy1.map(({name, html}) => ({
            path: this.getIndexPath(name),
            html: Promise.all([this.localDirectory.layout, Promise.resolve(html)])
                         .then(values => new LayoutRenderer(values, this.pageContextPath, name, context).render())
          })),
          ...exportCopy2.map(({name, html}) => ({
            path: this.getIndexFragmentPath(name),
            html: Promise.resolve(html).then(page => renderToString(page))
          })),
        ];
      } else {
        return [{
          path: this.buildFilePath,
          html: Promise.all([this.localDirectory.layout, Promise.resolve(exportCopy1)])
                       .then(values => new LayoutRenderer(values, this.pageContextPath, undefined, context).render())
        }, {
          path: this.buildFragmentPath,
          html: Promise.resolve(exportCopy2).then(page => renderToString(page))
        }];
      }
    });
  }

  renderJsonFile() {
    const json = require(this.file.full).public;

    return [{
      path: this.buildJsonFilePath,
      html: Promise.resolve(JSON.stringify(json ? json : { }))
    }];
  }

  clearSrcModuleCache() {
    Object.keys(require.cache)
    .filter(modulePath => modulePath.startsWith(this.srcPath))
    .forEach(modulePath => delete require.cache[require.resolve(modulePath)]);
  }

  context() {
    return {
      local: this.localDirectory,
      path: this.localDirectory.path,
      data: this.localDirectory.data,
      children: this.localDirectory.children,
      child: this.localDirectory.child,
      parent: this.localDirectory.parent,
      parents: this.localDirectory.parents,
      root: this.rootDirectory,
      loaders: this.cacheLoader,
      mdString,
      mdFile
    };
  }

  createOrisonDirectory(dirPath) {
    return new OrisonDirectory({
      path: dirPath,
      rootPath: this.rootPath,
      srcDirectory: this.srcDirectory,
      pagesDirectory: this.pagesDirectory,
      layoutFileBasename: this.layoutFileBasename,
      dataFileBasename: this.dataFileBasename });
  }

  get pagesPath() {
    return path.join(this.srcPath, this.pagesDirectory);
  }

  get dataPath() {
    return path.join(this.contextPath, this.dataFileBasename + '.json');
  }

  get contextPath() {
    return path.dirname(this.file.full);
  }

  get markdownHtml() {
    return md().render(this.markdown);
  }

  get markdown() {
    return fs.readFileSync(this.file.full).toString();
  }

  get srcPath() {
    return path.join(this.rootPath, this.srcDirectory);
  }

  get buildPath() {
    return path.join(this.rootPath, this.buildDir);
  }

  get buildFilePath() {
    return path.join(this.rootPath, this.buildDir, this.replaceExtension('html'));
  }

  get buildJsonFilePath() {
    return path.join(this.rootPath, this.buildDir, this.replaceExtension('json'));
  }

  get buildFragmentPath() {
    return path.join(this.rootPath, this.buildDir, this.replaceExtension(this.fragmentName + '.html'));
  }

  get relativeBuildFilePath() {
    return this.buildFilePath.slice(this.buildPath.length);
  }

  get pageContextPath() {
    return this.file.rel;
  }

  replaceExtension(extension) {
    const filePath = this.pageContextPath;
    const newFilePath = path.basename(filePath, path.extname(filePath)) + '.' + extension;
    return path.join(path.dirname(filePath), newFilePath);
  }

  getIndexPath(fileName) {
    return path.join(this.rootPath, this.buildDir, this.replaceFileName(fileName + '.html'));
  }

  getIndexFragmentPath(fileName) {
    return path.join(this.rootPath, this.buildDir, this.replaceFileName(fileName + '.' + this.fragmentName + '.html'));
  }

  replaceFileName(fileName) {
    const filePath = this.pageContextPath;
    const directory = filePath.slice(0, filePath.lastIndexOf(path.sep))
    return path.join(directory, fileName);
  }
}

class LayoutRenderer {
  constructor(array, path, name, context) {
    this.layout = array[0];
    this.page = array[1];
    this.path = path;
    this.name = name;
    this.context = context;
  }

  render() {
    return renderToString(this.layout({
      ...this.context,
      page: {
        html: this.page,
        name: this.name
      }
    }));
  }
}
