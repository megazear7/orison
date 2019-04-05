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
  DEFAULT_LAYOUT_BASENAME } from './orison.js';

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

  render() {
    if (this.file.endsWith('.md')) {
      this.renderMdFile();
    } else if (this.file.endsWith('.js')) {
      this.renderJsFile();
    } else if (this.file.endsWith('.html')) {
      this.renderHtmlFile();
    }
  }

  renderHtmlFile() {
    this.orisonFile.getData()
    .then(data => {
      // The global and data variables are used in the evaled lit-html template literal.
      const global = this.globalData;
      const template = eval('html`' + fs.readFileSync(this.file).toString() + '`');

      this.orisonFile.getLayout()
      .then(layout =>
        renderToString(layout(template)))
      .then(html => {
        console.log(this.relativeBuildFilePath);
        fs.writeFile(this.buildFilePath, html, err => err && console.log(err))
      });
    });
  }

  renderMdFile() {
    this.orisonFile.getLayout()
    .then(layout =>
      renderToString(layout(html`${unsafeHTML(this.markdownHtml)}`)))
    .then(html => {
      console.log(this.relativeBuildFilePath);
      fs.writeFile(this.buildFilePath, html, err => err && console.log(err))
    });
  }

  renderJsFile() {
    this.jsPages.forEach(page => {
      page.html.then(html => {
        console.log(page.path.slice(this.buildPath.length));
        fs.writeFile(page.path, html, err => err && console.log(err))
      });
    });
  }

  get markdownHtml() {
    return md().render(this.markdown);
  }

  get markdown() {
    return fs.readFileSync(this.file).toString();
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

  get jsPages() {
    const fileExport = require(this.file).default;

    if (Array.isArray(fileExport)) {
      return fileExport.map(({name, html}) => ({
        path: this.getIndexPath(name),
        html: Promise.resolve(html).then(renderer => renderToString(renderer))
      }));
    } else if (fileExport instanceof Function) {
      return [{
        path: this.buildFilePath,
        html: Promise.resolve(fileExport()).then(renderer => renderToString(renderer))
      }]
    } else {
      return [{
        path: this.buildFilePath,
        html: Promise.resolve(fileExport).then(renderer => renderToString(renderer))
      }];
    }
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
