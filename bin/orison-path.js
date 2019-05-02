import path from 'path';
import fs from 'fs';

export default class OrisonPath {
  constructor(relPath, pathMaker) {
    this._relPath = relPath;
    this._pathMaker = pathMaker;
  }

  get full() {
    if (! this._fullPath) this._fullPath = path.join(this._pathMaker.pagesPath, this._relPath);

    return this._fullPath;
  }

  get rel() {
    return this._relPath;
  }

  get exists() {
    return fs.existsSync(this.full);
  }

  get isDirectory() {
    return this.stat.isDirectory(this.full);
  }

  get stat() {
    if (! this._stat) this._stat = fs.statSync(this.full);

    return this._stat;
  }
}
