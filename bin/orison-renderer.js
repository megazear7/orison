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
    return Promise.resolve(this.render()).then(renderResult =>
      Array.isArray(renderResult)
        ? renderResult.forEach(file => this.writeFile(file))
        : this.writeFile(renderResult));
  }

  html(segment, path404) {
    return Promise.resolve(this.render(segment)).then(renderResult => {
      if (Array.isArray(renderResult)) {
        if (renderResult.length > 1) {
          if (segment.includes('.fragment')) {
            return renderResult[1].html;
          } else {
            return renderResult[0].html;
          }
        } else {
          const page404Result = this.renderHtmlFile(path404);
          if (page404Result.length > 1) {
            if (segment.includes('.fragment')) {
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
    if (this.file.endsWith('.md')) {
      return this.renderMdFile();
    } else if (this.file.endsWith('.js')) {
      return this.renderJsFile(segment);
    } else if (this.file.endsWith('.html')) {
      return this.renderHtmlFile();
    }
  }

  renderHtmlFile(filePathOverride) {
    const filePath = filePathOverride ? filePathOverride : this.file;
    const global = this.globalData;

    return [
      {
        path: this.buildFilePath,
        html: this.orisonFile.getData()
          .then(data => this.orisonFile.getLayout()
            .then(layout => renderToString(layout({
              html: eval('html`' + fs.readFileSync(filePath).toString() + '`'),
              path: this.pageContextPath
            }))))
      },
      {
        path: this.buildFragmentPath,
        html: this.orisonFile.getData().then(data =>
          renderToString(eval('html`' + fs.readFileSync(filePath).toString() + '`'))),
      }
    ];
  }

  renderMdFile() {
    return {
      path: this.buildFilePath,
      html: this.orisonFile.getLayout().then(layout => renderToString(layout({
        html: html`${unsafeHTML(this.markdownHtml)}`,
        path: this.pageContextPath
      })))
    };
  }

  renderJsFile(segment) {
    if (process.env.NODE_ENV !== 'production') {
      this.clearSrcModuleCache();
    }
    const fileExport = require(this.file).default;
    const slug = segment ? segment.replace('.html', '').replace('.fragment', '') : undefined;

    return Promise.all([fileExport(slug), fileExport(slug)]).then(fileExportResults => {
      const exportCopy1 = fileExportResults[0];
      const exportCopy2 = fileExportResults[1];

      if (Array.isArray(exportCopy1)) {
        return [
          ...exportCopy1.map(({name, html}) => ({
            path: this.getIndexPath(name),
            html: Promise.all([this.orisonFile.getLayout(), Promise.resolve(html)])
                         .then(values => new LayoutRenderer(values, this.pageContextPath, name).render())
          })),
          ...exportCopy2.map(({name, html}) => ({
            path: this.getIndexFragmentPath(name),
            html: Promise.resolve(html).then(page => renderToString(page))
          })),
        ];
      } else {
        return [{
          path: this.buildFilePath,
          html: Promise.all([this.orisonFile.getLayout(), Promise.resolve(exportCopy1)])
                       .then(values => new LayoutRenderer(values, this.pageContextPath).render())
                       .catch(e => console.log(e))
        }, {
          path: this.buildFragmentPath,
          html: Promise.resolve(exportCopy2).then(page => renderToString(page))
        }];
      }
    });
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

  get buildFragmentPath() {
    return path.join(this.rootPath, this.buildDir, this.replaceExtension('fragment.html'));
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

  getIndexFragmentPath(fileName) {
    return path.join(this.rootPath, this.buildDir, this.replaceFileName(fileName + '.fragment.html'));
  }

  replaceFileName(fileName) {
    const filePath = this.pageContextPath;
    const directory = filePath.slice(0, filePath.lastIndexOf('/'))
    return path.join(directory, fileName);
  }
}

class LayoutRenderer {
  constructor(array, path, name) {
    this.layout = array[0];
    this.page = array[1];
    this.path = path;
    this.name = name;
  }

  render() {
    return renderToString(this.layout({
      html: this.page,
      path: this.path,
      name: this.name
    }));
  }
}
