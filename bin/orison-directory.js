import path, { join } from 'path';
import fs, { lstatSync, readdirSync } from 'fs';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_DATA_BASENAME,
  DEFAULT_LAYOUT_BASENAME } from './orison.js';

export default class OrisonDirectory {
  constructor(path, srcDirectory = DEFAULT_SRC_DIR, layoutFileBasename = DEFAULT_LAYOUT_BASENAME, dataFileBasename = DEFAULT_DATA_BASENAME) {
    this.path = path;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
  }

  getLayout() {
    let directory = this.path;

    while (! directory.endsWith(this.srcDirectory) && directory != '/') {
      let jsLayoutPath = path.join(directory, this.layoutFileBasename + '.js');
      let htmlLayoutPath = path.join(directory, this.layoutFileBasename + '.html');

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
    let jsonFilePath = path.join(this.path, this.dataFileBasename + '.json');

    return fs.existsSync(jsonFilePath)
      ? import(jsonFilePath)
      : new Promise(resolve => resolve({}));
  }

  getParent() {
    return new OrisonDirectory(path.dirname(this.path), this.srcDirectory, this.layoutFileBasename, this.dataFileBasename);
  }

  getChildren() {
    const isDirectory = source => lstatSync(source).isDirectory();

    return readdirSync(this.path)
      .map(name => join(this.path, name))
      .filter(isDirectory)
      .map(directory => new OrisonDirectory(directory, this.srcDirectory, this.layoutFileBasename, this.dataFileBasename));
  }
}
