import fsPath, { join } from 'path';
import fs, { lstatSync, readdirSync } from 'fs';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_DATA_BASENAME,
  DEFAULT_LAYOUT_BASENAME } from './orison-esm.js';

export default class OrisonDirectory {
  constructor({
      path,
      srcDirectory = DEFAULT_SRC_DIR,
      pagesDirectory = DEFAULT_PAGES_DIR,
      layoutFileBasename = DEFAULT_LAYOUT_BASENAME,
      dataFileBasename = DEFAULT_DATA_BASENAME
    }) {
    this._path = path;
    this.srcDirectory = srcDirectory;
    this.pagesDirectory = pagesDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.dataPath = fsPath.join(this._path, this.dataFileBasename + '.json');
    this.data = this.getData();
  }

  getLayout() {
    let directory = this._path;

    while (! directory.endsWith(this.srcDirectory) && directory != '/') {
      let jsLayoutPath = fsPath.join(directory, this.layoutFileBasename + '.js');
      let htmlLayoutPath = fsPath.join(directory, this.layoutFileBasename + '.html');

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
        directory = fsPath.dirname(directory);
      }
    }

    return new Promise(resolve => resolve(page => html`${page}`));
  }

  get path() {
    // TODO We need to calculate this in a better way.
    return this._path.split('/' + this.pagesDirectory)[1];
  }

  getData() {
    try {
      return fs.existsSync(this.dataPath) ? JSON.parse(fs.readFileSync(this.dataPath)) : { };
    } catch {
      return {};
    }
  }

  getParent() {
    return new OrisonDirectory({
      path: fsPath.dirname(this._path),
      srcDirectory: this.srcDirectory,
      layoutFileBasename: this.layoutFileBasename,
      dataFileBasename: this.dataFileBasename });
  }

  getChildren() {
    return readdirSync(this._path)
      .map(name => join(this._path, name))
      .filter(source => lstatSync(source).isDirectory())
      .map(directory => new OrisonDirectory({
        path: directory,
        srcDirectory: this.srcDirectory,
        layoutFileBasename: this.layoutFileBasename,
        dataFileBasename: this.dataFileBasename }))
      .sort((d1, d2) => d1.data.orison.order - d2.data.orison.order);
  }
}
