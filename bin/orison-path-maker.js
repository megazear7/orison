import path from 'path';
import OrisonPath from './orison-path.js';

export default class OrisonPathMaker {
  constructor(rootPath, srcDir, pagesDir) {
    this._rootPath = rootPath;
    this._srcDir = srcDir;
    this._pagesDir = pagesDir;
  }

  create(relPath) {
    return new OrisonPath(relPath, this);
  }

  get pagesPath() {
    if (! this._pagesPath) this._pagesPath = path.join(this._rootPath, this._srcDir, this._pagesDir);

    return this._pagesPath;
  }

  get srcPath() {
    if (! this._srcPath) this._srcPath = path.join(this._rootPath, this._srcDir);

    return this._srcPath;
  }
}
