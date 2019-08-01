/**
 * Default exports the OrisonGenerator class.
 * @module OrisonGenerator
 */

import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import { ncp } from 'ncp';
import OrisonRenderer from './orison-renderer.js';
import OrisonCacheLoader from './orison-cache-loader.js';
import { DEFAULTS } from './orison-esm.js';

/**
 * Creates an OrisonGenerator that can be used to build a website based upon a specially formatted source directory.
 * @param {object} config Required configuration for the generator.
 * @param {string} config.rootPath Required. Determines the root path of the source and build directories.
 * @param {string} config.generatePath Optional. Defaults to "/". The sub path under the pages directory to generate the site from. Any pages outside of this subpath will not be deleted from the build directory or generated from the source directory. This allows partial builds of certain sub paths of the page hierarhcy.
 * @param {array} config.generateSlugs Optional. Defaults to [ ]. A list of slugs to generate for list page types. List pages are a single source page that generates 0 or more pages in the build directory. If a list of slugs is provided these will be provided to the list source page so that the list page knows which pages to generate. This is helpful if you only want to generate pages for certain slugs instead of the list page generating every page.
 * @param {array} config.excludedPaths Optional. Defaults to [ ]. A list of paths to exclude from the build. This is helpful for fine tuning what pages get rebuilt. If you want to rebuild the page at /src/pages/example/ but you want to exclude the subdirectories of the example directory they can be listed in this configuration.
 * @param {string} config.buildDir Optional. Defaults to "docs". The name of the build directory where the built files will go. The build directory should exist under the root path.
 * @param {array} config.protectedFileNames Optional. Defaults to [ "CNAME" ]. Protected file names that will not be deleted from the build directory. This defaults to "CNAME" which is a file that GitHub pages needs for hosting. This list can be updated based upon other hosting providers and setups.
 * @param {string} config.staticDirectory Optional. Defaults to "static". The name of the static directory. This directory should exist under the source directory. It will be copied as is into the build directory.
 * @param {string} config.pagesDirectory Optional. Defaults to "pages". The name of the pages directory. This directory should exist under the source directory. This is the directory that will be rendered into the build directory and forms the hierarchy of your site.
 * @param {string} config.srcDirectory Optional. Defaults to "src". This is the source directory. The static directory, pages directory, and partials directory should all exist under this directory. The source directory should exist under the root path.
 * @param {string} config.layoutFileBasename Optional. Defaults to "layout". The basename of the layouts created under the pages directory. Pages are inserted into the nearest layout within the pages hierarchy. As an example if "layout" is provided in this configuration then files named "layout.js" will be interpretted as layouts.
 * @param {string} config.dataFileBasename Optional. Defaults to "data". The basename of the data files under the pages directory. The output of these data files are provided to pages and serve as contextual site metadata.
 * @param {string} config.fragmentName Optional. Defaults to "fragment". The string to identify fragments with. Fragments are pages that get rendered without the layout. This allows for page content to be requested without the surrounding layout and helps support single page application style linking. If "fragment" is provided, then each page will get a corresponding file built with the format "<page>.fragment.html" where the contents are the same as "<page>.html" but without the layout applied and where <page> is the basename of the corresponding page.
 * @param {array} config.loaders Optional. Defaults to an empty array. Any objects put in this array should have a name property that is a string and a loader prop that is a function. Review the documentation on the details for implementing a loader.
 * @returns {OrisonGenerator} An OrisonGenerator based upon the provided configurations.
 */
export default class OrisonGenerator {
  constructor({
      rootPath,
      generatePath = DEFAULTS.GENERATE_PATH,
      generateSlugs = DEFAULTS.GENERATE_SLUGS,
      excludedPaths = DEFAULTS.EXCLUDED_PATHS,
      buildDir = DEFAULTS.BUILD_DIR,
      protectedFileNames = DEFAULTS.PROTECTED_FILES,
      staticDirectory = DEFAULTS.STATIC_DIR,
      pagesDirectory = DEFAULTS.PAGES_DIR,
      srcDirectory = DEFAULTS.SRC_DIR,
      loaderDirectory = DEFAULTS.LOADER_DIRECTORY,
      layoutFileBasename = DEFAULTS.LAYOUT_BASENAME,
      dataFileBasename = DEFAULTS.DATA_BASENAME,
      fragmentName = DEFAULTS.FRAGMENT_NAME,
      loaders = [ ]
    }) {
    this.rootPath = rootPath;
    this.generatePath = generatePath;
    this.generateSlugs = generateSlugs;
    this.excludedPaths = excludedPaths;
    this.buildDir = buildDir;
    this.protectedFileNames = protectedFileNames;
    this.staticDirectory = staticDirectory;
    this.pagesDirectory = pagesDirectory;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.fragmentName = fragmentName;
    this.cacheLoader = new OrisonCacheLoader({
      loaderPath: path.join(this.rootPath, this.srcDirectory, loaderDirectory),
      initialLoaders: loaders
    });
  }

  /**
   * @returns {void} Build the static files for the website based upon the options provided in the constructor. This is essentially a three step process: (1) Delete the directories and files in the buildDir, (2) Copy the static files to the build directory, (3) Generate HTML files in the build directory based upon the page files (HTML, JS, MD) in the pages directory.
   */
  build() {
    this._prepBuildDir();
    this._copyStaticFiles();
    this._generatePages();
  }

  /* PRIVATE METHOD
   * @returns {string} Returns the provided path but trimmed to just the contextual part of the path starting from the pages directory.
   */
  _getPageContextPath(pagePath) {
    return pagePath.split(path.sep + this.pagesDirectory)[1];
  }

  /* PRIVATE METHOD
   * @returns {string} Returns the src path including the root path at the beginning and the provided path at the end.
   */
  _getSrcPath(srcPath = '') {
    return path.join(this.rootPath, this.srcDirectory, srcPath);
  }

  /* PRIVATE METHOD
   * @returns {string} Returns the static path including the root path at the beginning and the provided path at the end.
   */
  _getStaticPath(staticPath = '') {
    return path.join(this.rootPath, this.srcDirectory, this.staticDirectory, staticPath);
  }

  /* PRIVATE METHOD
   * @returns {string} Returns the page path including the root path at the beginning and the provided path at the end.
   */
  _getPagesPath(pagesPath = '') {
    return path.join(this._getSrcPath(this.pagesDirectory), pagesPath);
  }

  /* PRIVATE METHOD
   * @returns {string} Returns the build path including the root path at the beginning and the provided path at the end.
   */
  _getBuildPath(buildPath = '') {
    return path.join(this.rootPath, this.buildDir, buildPath);
  }

  /* PRIVATE METHOD
   * @returns {void} Generates the pages into the build directory based upon the pages directory.
   */
  _generatePages() {
    console.log(`Generating to ${this.buildDir} from ${this.srcDirectory}:`);
    const generatePath = this._getSrcPath(this.pagesDirectory);
    if (fs.existsSync(generatePath)) {
      fileWalker(generatePath,
        file => {
          const relFilePath = file.substring(path.join(this.rootPath, this.srcDirectory, this.pagesDirectory).length);
          if (this._isSourcePage(file) && relFilePath.startsWith(this.generatePath) && ! this._excludedSrcPagePaths.some(pagePath => file.startsWith(pagePath))) {
            (new OrisonRenderer({
              file: relFilePath,
              rootPath: this.rootPath,
              srcDirectory: this.srcDirectory,
              layoutFileBasename: this.layoutFileBasename,
              dataFileBasename: this.dataFileBasename,
              pagesDirectory: this.pagesDirectory,
              fragmentName: this.fragmentName,
              buildDir: this.buildDir,
              cacheLoader: this.cacheLoader
            })).write(this.generateSlugs);
          }
        },
        directory => {
          const newPath = this._getBuildPath(this._getPageContextPath(directory));
          if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
        }
      );
    }
  }

  /* PRIVATE METHOD
   * @returns {boolean} Determines whethor or not this is a source page based upon the file extension. It will also ignore layouts based upon the file basename since a layout is not an actual source page.
   */
  _isSourcePage(file) {
    return ! file.endsWith(this.layoutFileBasename + '.js') &&
           ( file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md') || file.endsWith('data.json') );
  }

  /* PRIVATE METHOD
   * @returns {void} Copies the static files to the build directory.
   */
  _copyStaticFiles() {
    const staticPath = this._getStaticPath(this.generatePath);
    if (fs.existsSync(staticPath)) {
      ncp(staticPath, this._getBuildPath(this.generatePath), err => {
        if (err) throw err;
      });
    }
  }

  /* PRIVATE METHOD
   * @returns {void} Preps the build directory by removing what is already there and making any directories that will be needed.
   */
  _prepBuildDir() {
    if (fs.existsSync(this._getBuildPath())) {
      this._cleanBuildDir();
    } else {
      fs.mkdirSync(this._getBuildPath());
    }
  }

  /* PRIVATE METHOD
   * @returns {void} Cleans the build directory by removing what is already there.
   */
  _cleanBuildDir() {
    this._deleteBuildFiles();
    this._deleteBuildDirectories();
  }

  /* PRIVATE METHOD
   * @returns {boolean} Determines if this is a valid url slug based upon whethor or not it already exists.
   */
  _validSlug(file) {
    return this.generateSlugs.length === 0 || this.generateSlugs.includes(path.basename(file));
  }

  /* PRIVATE METHOD
   * @returns {array} Creates the absolute paths for excluded directory paths based upon the provided excluded paths (which are provided as relative paths).
   */
  get _excludedSrcPagePaths() {
    return this.excludedPaths.map(excludedPath => path.join(this.rootPath, this.srcDirectory, this.pagesDirectory, excludedPath));
  }

  /* PRIVATE METHOD
   * @returns {array} Creates the absolute paths excluded build paths based upon the provided excluded paths (which are provided as relative paths).
   */
  get _excludedBuildPaths() {
    return this.excludedPaths.map(excludedPath => path.join(this.rootPath, this.buildDir, excludedPath));
  }

  /* PRIVATE METHOD
   * @returns {void} Cleans the build directory by deleting existing files.
   */
  _deleteBuildFiles() {
    const deletePath = this._getBuildPath(this.generatePath);
    if (fs.existsSync(deletePath)) {
      fileWalker(deletePath,
        file => {
          if (! this.protectedFileNames.includes(path.basename(file)) &&
              ! this._excludedBuildPaths.some(buildPath => file.startsWith(buildPath)) &&
              this._validSlug(file)) {
            try {
              fs.unlinkSync(file);
            } catch {
              console.debug('Could not delete build file: ' + file);
            }
          }
        }
      );
    }
  }

  /* PRIVATE METHOD
   * @returns {void} Cleans the build directory by deleting existing directories.
   */
  _deleteBuildDirectories() {
    const deletePath = this._getBuildPath(this.generatePath);
    if (fs.existsSync(deletePath)) {
      fileWalker(deletePath,
        () => { },
        directory => {
          try {
            fs.unlinkSync(directory);
          } catch {
            console.debug('Could not delete build directory: ' + directory);
          }
        }
      );
    }
  }
}
