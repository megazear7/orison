import path from 'path';
import fs from 'fs';

/**
 * This class encapsulates logic for generating paths and determining information about a relative src path.
 * @param {object} relPath Required. The relative path from the src directory.
 * @param {object} pathMaker Required. The OrisonPathMaker object which contains the information needed for calculating absolute paths.
 * @returns {OrisonCacheLoader} A new OrisonCacheLoader with the provided configurations.
 */
export default class OrisonPath {
  constructor(relPath, pathMaker) {
    this._relPath = relPath;
    this._pathMaker = pathMaker;
  }

  /**
   * @returns {string} The absolute path to the relative path provided in the constructor.
   */
  get full() {
    if (! this._fullPath) this._fullPath = path.join(this._pathMaker.pagesPath, this._relPath);

    return this._fullPath;
  }

  /**
   * @returns {string} The relative path as provided in the constructor.
   */
  get rel() {
    return this._relPath;
  }

  /**
   * @returns {string} Whether a file or directory exists at the provided path.
   */
  get exists() {
    return fs.existsSync(this.full);
  }

  /**
   * @returns {string} Whether the item specified by the rel path is a directory.
   */
  get isDirectory() {
    return this.stat.isDirectory(this.full);
  }

  /**
   * @returns {string} The fs.statSync results for the provided rel path.
   */
  get stat() {
    if (! this._stat) this._stat = fs.statSync(this.full);

    return this._stat;
  }
}
