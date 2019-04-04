import fs from 'fs';
import path from 'path';
import { html, renderToString } from '@popeindustries/lit-html-server';
import { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';
import index from '../src/pages/index.js';
import fileWalker from './file-walker.js';
import md from 'markdown-it';
import { ncp } from 'ncp';

export default class OrisonGenerator {
  constructor({
      buildDir = 'docs',
      protectedFileNames = [ 'CNAME' ],
      globalMetadataFile = 'global.json',
      staticDirectory = 'static',
      pagesDirectory = 'pages',
      srcDirectory = 'src',
      layoutFileBasename = 'layout',
      dataFileBasename = 'data'
    } = {}) {
    this.buildDir = buildDir;
    this.protectedFileNames = protectedFileNames;
    this.staticDirectory = staticDirectory;
    this.pagesDirectory = pagesDirectory;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.global = JSON.parse(fs.readFileSync(this.getSrcPath(globalMetadataFile)));
  }

  build() {
    if (fs.existsSync(this.getBuildPath())){
      fileWalker(this.getBuildPath(),
        (err, file) => {
          if (! this.protectedFileNames.includes(path.basename(file))) fs.unlinkSync(file);
        }
      );
    } else {
      fs.mkdirSync(this.getBuildPath());
    }

    ncp(this.getSrcPath(this.staticDirectory), this.getBuildPath(), err => {
     if (err) {
       return console.error(err);
     }
    });

    fileWalker(this.getSrcPath(this.pagesDirectory),
      (err, file) => {
        if (err) {
          throw err;
        } else if (file.endsWith(this.layoutFileBasename)) {
          return;
        } else {
          (new OrisonFile(this, file)).render();
        }
      },
      (err, directory) => {
        const newPath = this.getBuildPath(this.getPageContextPath(directory));
        if (!fs.existsSync(newPath)){
          fs.mkdir(newPath, err => {
            if (err) console.log(err);
          });
        }
      }
    );
  }

  getPageContextPath(pagePath) {
    return pagePath.split('/' + this.pagesDirectory)[1];
  }

  getSrcPath(srcPath = '') {
    return path.join(__dirname, '../', this.srcDirectory, srcPath);
  }

  getBuildPath(buildPath = '') {
    return path.join(__dirname, '..', this.buildDir, buildPath);
  }
}

class OrisonFile {
  constructor(orison, file) {
    this.orison = orison;
    this.file = file;
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
    this.getData()
    .then(data => {
      // The global and data variables are used in the evaled lit-html template literal.
      const global = this.orison.global
      const template = eval('html`' + fs.readFileSync(this.file).toString() + '`');

      this.getLayout()
      .then(layout =>
        renderToString(layout(template)))
      .then(html =>
        fs.writeFile(this.buildFilePath, html, err => err && console.log(err)));
    });
  }

  renderMdFile() {
    this.getLayout()
    .then(layout =>
      renderToString(layout(html`${unsafeHTML(this.markdownHtml)}`)))
    .then(html =>
      fs.writeFile(this.buildFilePath, html, err => err && console.log(err)));
  }

  renderJsFile() {
    this.jsPages.forEach(page =>
      page.html.then(html =>
        fs.writeFile(page.path, html, err => err && console.log(err))));
  }

  getLayout() {
    let directory = path.dirname(this.file);

    while (! directory.endsWith(this.orison.srcDirectory) && directory != '/') {
      let jsLayoutPath = path.join(directory, this.orison.layoutFileBasename + '.js');
      let htmlLayoutPath = path.join(directory, this.orison.layoutFileBasename + '.html');

      if (fs.existsSync(jsLayoutPath)) {
        return import(jsLayoutPath).then(layout => layout.default);
      } else if (fs.existsSync(htmlLayoutPath)) {
        return new Promise((resolve, reject) => {
          fs.readFile(htmlLayoutPath, 'utf8', (err, htmlString) => {
            if (err) reject(err);
            resolve(html`${unsafeHTML(htmlString)}`);
          });
        });
      } else {
        directory = path.dirname(directory);
      }
    }

    return new Promise(resolve => resolve(page => html`${page}`));
  }

  getData() {
    let directory = path.dirname(this.file);
    let jsonFilePath = path.join(directory, this.orison.dataFileBasename + '.json');

    return fs.existsSync(jsonFilePath))
      ? import(jsonFilePath)
      : new Promise(resolve => resolve({}));
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
    const renderers = require(this.file).default;

    return renderers.constructor.name === 'TemplateResult'
      ? [{
          path: this.buildFilePath,
          html: renderToString(renderers)
        }]
      : Object.keys(renderers).map(key => ({
          path: this.getIndexPath(key),
          html: renderToString(renderers[key])
        }));
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
