import md from 'markdown-it';
import fs from 'fs';
import path from 'path';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';
import { html, renderToString } from '@popeindustries/lit-html-server';
import OrisonFile from './orison-file.js';

export default class OrisonRenderer {
  constructor(orison, file) {
    this.orison = orison;
    this.file = file;
    this.orisonFile = new OrisonFile(file, orison.srcDirectory, orison.layoutFileBasename, orison.dataFileBasename);
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
      const global = this.orison.global;
      const template = eval('html`' + fs.readFileSync(this.file).toString() + '`');

      this.orisonFile.getLayout()
      .then(layout =>
        renderToString(layout(template)))
      .then(html =>
        fs.writeFile(this.buildFilePath, html, err => err && console.log(err)));
    });
  }

  renderMdFile() {
    this.orisonFile.getLayout()
    .then(layout =>
      renderToString(layout(html`${unsafeHTML(this.markdownHtml)}`)))
    .then(html =>
      fs.writeFile(this.buildFilePath, html, err => err && console.log(err)));
  }

  renderJsFile() {
    this.jsPages.forEach(page => {
      page.html.then(html => {
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

  get buildFilePath() {
    return this.orison.getBuildPath(this.replaceExtension('html'));
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

  replaceExtension(extension) {
    const filePath = this.orison.getPageContextPath(this.file);
    const newFilePath = path.basename(filePath, path.extname(filePath)) + '.' + extension;
    return path.join(path.dirname(filePath), newFilePath);
  }

  getIndexPath(fileName) {
    return this.orison.getBuildPath(
             this.replaceFileName(fileName + '.html'));
  }

  replaceFileName(fileName) {
    const filePath = this.orison.getPageContextPath(this.file);
    const directory = filePath.slice(0, filePath.lastIndexOf('/'))
    return path.join(directory, fileName);
  }
}
