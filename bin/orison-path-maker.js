import path from 'path';
import OrisonPath from './orison-path.js';

/**
 * A class for generating OrisonPath objects.
 * @param {object} rootPath Required. The absolute rooth path in the file system where the src directory is.
 * @param {object} srcDir Required. The name of the src directory.
 * @param {object} pagesDir Required. The name of the pages directory.
 * @returns {OrisonCacheLoader} A new OrisonCacheLoader with the provided configurations.
 */
export default class OrisonPathMaker {
  constructor(rootPath, srcDir, pagesDir) {
    this._rootPath = rootPath;
    this._srcDir = srcDir;
    this._pagesDir = pagesDir;
  }

  /**
   * @returns {object} An OrisonPath object based upon the configuration provided in the constructor and the relative src path provided to this method.
   */
  create(relPath) {
    return new OrisonPath(relPath, this);
  }

  /**
   * @returns {string} the absolute file system path to the pages directory.
   */
  get pagesPath() {
    if (! this._pagesPath) this._pagesPath = path.join(this._rootPath, this._srcDir, this._pagesDir);

    return this._pagesPath;
  }

  /**
   * @returns {string} the absolute file system path to the src directory.
   */
  get srcPath() {
    if (! this._srcPath) this._srcPath = path.join(this._rootPath, this._srcDir);

    return this._srcPath;
  }
}
