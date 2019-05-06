import fsPath, { join } from 'path';
import fs, { lstatSync, readdirSync } from 'fs';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_DATA_BASENAME,
  DEFAULT_LAYOUT_BASENAME } from './orison-esm.js';

/**
 * A class representing a src pages directory. Provides easy to use accessor methods
 * for retrieving contextual information about that given location under the src pages path.
 */
export default class OrisonDirectory {
  constructor({
      path,
      rootPath,
      srcDirectory = DEFAULT_SRC_DIR,
      pagesDirectory = DEFAULT_PAGES_DIR,
      layoutFileBasename = DEFAULT_LAYOUT_BASENAME,
      dataFileBasename = DEFAULT_DATA_BASENAME
    }) {
    this.path = path;
    this.rootPath = rootPath;
    this.srcDirectory = srcDirectory;
    this.pagesDirectory = pagesDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
  }

  /**
   * The full path including the file system root.
   */
  get _fullPath() {
    return fsPath.join(this.rootPath, this.srcDirectory, this.pagesDirectory, this.path);
  }

  /**
   * The path to the Orison data json file in the current directory.
   */
  get dataPath() {
    if (! this._dataPath) {
      this._dataPath = fsPath.join(this._fullPath, this.dataFileBasename + '.json');
    }

    return this._dataPath;
  }

  /**
   * Whether or not this is the root directory of the src pages.
   */
  get isRoot() {
    if (! this._isRoot) {
      this._isRoot = this.path === fsPath.sep;
    }

    return this._isRoot;
  }

  /**
   * The layout to be used for pages within this directory. It will recursively
   * search up the src pages path to find the closest layout.
   */
  get layout() {
    if (! this._layout) {
      let directory = this._fullPath;

      while (! directory.endsWith(this.srcDirectory) && directory.length > fsPath.sep.length) {
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

      this._layout = () => new Promise(resolve => resolve(page => html`${page}`));
    }

    return this._layout();
  }

  /**
   * The JSON data associated to this src pages directory, coming from the data json
   * file within this directory. The JSON object will always have a "orison" and "public"
   * attribute.
   */
  get data() {
    if (! this._data) {
      try {
        this._data = fs.existsSync(this.dataPath) ? JSON.parse(fs.readFileSync(this.dataPath)) : { };
        if (! this._data.orison) this._data.orison = { };
        if (! this._data.public) this._data.public = { };
      } catch {
        this._data = { orison: { } };
      }
    }

    return this._data;
  }

  /**
   * The OrisonDirectory object one level up the src pages path. This should not
   * be called when this.isRoot this true.
   */
  get parent() {
    if (! this._parent) {
      this._parent = new OrisonDirectory({
        path: fsPath.dirname(this.path),
        rootPath: this.rootPath,
        srcDirectory: this.srcDirectory,
        pagesDirectory: this.pagesDirectory,
        layoutFileBasename: this.layoutFileBasename,
        dataFileBasename: this.dataFileBasename });
    }

    return this._parent;
  }

  /**
   * An array of OrisonDirectory's representing the children of the current directory.
   * They will be ordered based upon the value of the `child.data.orison.order` property
   * of each child directory.
   */
  get children() {
    if (! this._children) {
      this._children = readdirSync(this._fullPath)
        .map(name => join(this._fullPath, name))
        .filter(source => lstatSync(source).isDirectory())
        .map(directory => new OrisonDirectory({
          path: directory.substring(fsPath.join(this.rootPath, this.srcDirectory, this.pagesDirectory).length),
          rootPath: this.rootPath,
          srcDirectory: this.srcDirectory,
          pagesDirectory: this.pagesDirectory,
          layoutFileBasename: this.layoutFileBasename,
          dataFileBasename: this.dataFileBasename }))
        .sort((d1, d2) => d1.data.orison.order - d2.data.orison.order);
    }

    return this._children;
  }

  /**
   * An array of OrisonDirectory objects starting with this one and going up the
   * directory hierarchy by calling the parent method until an OrisonDirectory object
   * returns true for `isRoot`.
   */
  get parents() {
    let parents = [ ];
    let parent = this;
    let foundRoot = false;

    while (! foundRoot) {
      parents.push(parent);
      foundRoot = parent.isRoot;
      parent = parent.parent;
    }

    return parents.reverse();
  }
}
