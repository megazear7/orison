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
      protectedFileNames = [ 'CNAME' ]
    } = {}) {
    this.buildDir = buildDir;
    this.protectedFileNames = protectedFileNames;
    this.global = JSON.parse(fs.readFileSync(this.getSrcPath('global.json')));
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

    ncp(this.getSrcPath('static'), this.getBuildPath(), function (err) {
     if (err) {
       return console.error(err);
     }
    });

    fileWalker(this.getSrcPath('pages'),
      (err, file) => {
        if (err) throw err;

        if (file.includes('/layout.js')) {
          return;
        } else if (file.endsWith('.md')) {
          this.renderMdFile(file);
        } else if (file.endsWith('.js')) {
          this.renderJsFile(file);
        } else if (file.endsWith('.html')) {
          this.renderHtmlFile(file);
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

  renderHtmlFile(file) {
    this.getData(file)
    .then(data => {
      // The global and data variables are used in the evaled lit-html template literal.
      const global = this.global
      const template = eval('html`' + fs.readFileSync(file).toString() + '`');

      this.getLayout(file)
      .then(layout => renderToString(layout(template)))
      .then(html => {
        fs.writeFile(this.getBuildFilePath(file), html, err => {
          if (err) console.log(err);
        });
      });
    });
  }

  renderMdFile(file) {
    const markdown = fs.readFileSync(file).toString();
    const htmlString = md().render(markdown);

    this.getLayout(file)
    .then(layout => renderToString(layout(html`${unsafeHTML(htmlString)}`)))
    .then(html => {
      fs.writeFile(this.getBuildFilePath(file), html, err => {
        if (err) console.log(err);
      });
    });
  }

  getData(filePath) {
    let directory = path.dirname(filePath);

    while (! directory.endsWith('src') && directory != '/') {
      let jsonFilePath = path.join(directory, 'data.json');

      if (fs.existsSync(jsonFilePath)) {
        return import(jsonFilePath);
      } else {
        directory = path.dirname(directory);
      }
    }

    return new Promise(resolve => resolve({}));
  }

  getLayout(filePath) {
    let directory = path.dirname(filePath);

    while (! directory.endsWith('src') && directory != '/') {
      let jsLayoutPath = path.join(directory, 'layout.js');
      let htmlLayoutPath = path.join(directory, 'layout.html');

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

  renderJsFile(file) {
    const renderers = require(file).default;

    let pages = [ ];
    if (renderers.constructor.name === 'TemplateResult') {
      pages.push({
        path: this.getBuildFilePath(file),
        html: renderToString(renderers)
      });
    } else {
      Object.keys(renderers).forEach(key => {
        const renderer = renderers[key];
        let filePath = this.replaceFileName(this.getPageContextPath(file), key + '.html');

        pages.push({
          path: this.getBuildPath(filePath),
          html: renderToString(renderer)
        });
      });
    }

    pages.forEach(page => {
      page.html.then(html => {
        fs.writeFile(page.path, html, err => {
          if (err) console.log(err);
        });
      });
    });
  }

  replaceFileName(filePath, fileName) {
    let directory = filePath.slice(0, filePath.lastIndexOf('/'))
    return path.join(directory, fileName);
  }

  replaceExtension(filePath, extension) {
    let newFilePath = path.basename(filePath, path.extname(filePath)) + '.' + extension;
    return path.join(path.dirname(filePath), newFilePath);
  }

  getBuildFilePath(file) {
    return this.getBuildPath(this.replaceExtension(this.getPageContextPath(file), 'html'));
  }

  getPageContextPath(pagePath) {
    return pagePath.split('/pages')[1];
  }

  getSrcPath(srcPath = '') {
    return path.join(__dirname, '../src', srcPath);
  }

  getBuildPath(buildPath = '') {
    return path.join(__dirname, '..', this.buildDir, buildPath);
  }
}
