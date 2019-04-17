import md from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';
import { html, renderToString } from '@popeindustries/lit-html-server';
import OrisonDirectory from './orison-directory.js';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_BUILD_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_DATA_BASENAME,
  DEFAULT_LAYOUT_BASENAME } from './orison-esm.js';

export default class OrisonRenderer {
  constructor({
      file,
      rootPath,
      globalData = {},
      srcDirectory = DEFAULT_SRC_DIR,
      layoutFileBasename = DEFAULT_LAYOUT_BASENAME,
      dataFileBasename = DEFAULT_DATA_BASENAME,
      pagesDirectory = DEFAULT_PAGES_DIR,
      buildDir = DEFAULT_BUILD_DIR,
    }) {
    this.file = file;
    this.rootPath = rootPath;
    this.globalData = globalData;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.pagesDirectory = pagesDirectory;
    this.buildDir = buildDir;
    this.orisonFile = new OrisonDirectory({
      path: path.dirname(file),
      srcDirectory,
      layoutFileBasename,
      dataFileBasename });
  }

  writeFile(file) {
    console.log(file.path.slice(this.buildPath.length));
    file.html.then(html => fs.writeFile(file.path, html, err => err && console.log(err)));
  }

  write() {
    const renderResult = this.render();

    return Array.isArray(renderResult)
      ? renderResult.forEach(file => this.writeFile(file))
      : this.writeFile(renderResult);
  }

  html(segment) {
    const renderResult = this.render();

    return Array.isArray(renderResult)
      ? renderResult.find(page = page.path.endsWith(segment)).html
      : renderResult.html;
  }

  render() {
    if (this.file.endsWith('.md')) {
      return this.renderMdFile();
    } else if (this.file.endsWith('.js')) {
      return this.renderJsFile();
    } else if (this.file.endsWith('.html')) {
      return this.renderHtmlFile();
    }
  }

  renderHtmlFile() {
    const global = this.globalData;

    return {
      path: this.buildFilePath,
      html: this.orisonFile.getData()
        .then(data => this.orisonFile.getLayout()
          .then(layout => renderToString(layout(eval('html`' + fs.readFileSync(this.file).toString() + '`')))))
    };
  }

  renderMdFile() {
    return {
      path: this.buildFilePath,
      html: this.orisonFile.getLayout().then(layout => renderToString(layout(html`${unsafeHTML(this.markdownHtml)}`)))
    };
  }

  renderJsFile() {
    if (process.env.NODE_ENV !== 'production') {
      this.clearSrcModuleCache();
    }
    const fileExport = require(this.file).default();

    if (Array.isArray(fileExport)) {
      return fileExport.map(({name, html}) => ({
        path: this.getIndexPath(name),
        html: Promise.resolve(html).then(renderer => renderToString(renderer))
      }));
    } else {
      return {
        path: this.buildFilePath,
        html: Promise.resolve(fileExport).then(renderer => renderToString(renderer))
      };
    }
  }

  clearSrcModuleCache() {
    Object.keys(require.cache)
    .filter(modulePath => modulePath.startsWith(this.srcPath))
    .forEach(modulePath => delete require.cache[require.resolve(modulePath)]);
  }

  get markdownHtml() {
    return md().render(this.markdown);
  }

  get markdown() {
    return fs.readFileSync(this.file).toString();
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

  get relativeBuildFilePath() {
    return this.buildFilePath.slice(this.buildPath.length);
  }

  get pageContextPath() {
    return this.file.split('/' + this.pagesDirectory)[1];
  }

  replaceExtension(extension) {
    const filePath = this.pageContextPath;
    const newFilePath = path.basename(filePath, path.extname(filePath)) + '.' + extension;
    return path.join(path.dirname(filePath), newFilePath);
  }

  getIndexPath(fileName) {
    return path.join(this.rootPath, this.buildDir, this.replaceFileName(fileName + '.html'));
  }

  replaceFileName(fileName) {
    const filePath = this.pageContextPath;
    const directory = filePath.slice(0, filePath.lastIndexOf('/'))
    return path.join(directory, fileName);
  }
}
