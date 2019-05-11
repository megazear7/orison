/**
 * Default exports the OrisonGenerator class.
 * @module OrisonGenerator
 */

import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import { ncp } from 'ncp';
import OrisonRenderer from './orison-renderer.js';
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
      layoutFileBasename = DEFAULTS.LAYOUT_BASENAME,
      dataFileBasename = DEFAULTS.DATA_BASENAME,
      fragmentName = DEFAULTS.FRAGMENT_NAME
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
  }

  build() {
    this.prepBuildDir();
    this.copyStaticFiles();
    this.generatePages();
  }

  getPageContextPath(pagePath) {
    return pagePath.split(path.sep + this.pagesDirectory)[1];
  }

  getSrcPath(srcPath = '') {
    return path.join(this.rootPath, this.srcDirectory, srcPath);
  }

  getStaticPath(staticPath = '') {
    return path.join(this.rootPath, this.srcDirectory, this.staticDirectory, staticPath);
  }

  getPagesPath(pagesPath = '') {
    return path.join(this.getSrcPath(this.pagesDirectory), pagesPath);
  }

  getBuildPath(buildPath = '') {
    return path.join(this.rootPath, this.buildDir, buildPath);
  }

  generatePages() {
    console.log(`Generating to ${this.buildDir} from ${this.srcDirectory}:`);
    const generatePath = this.getSrcPath(this.pagesDirectory);
    if (fs.existsSync(generatePath)) {
      fileWalker(generatePath,
        file => {
          const relFilePath = file.substring(path.join(this.rootPath, this.srcDirectory, this.pagesDirectory).length);
          if (this.isSourcePage(file) && relFilePath.startsWith(this.generatePath) && ! this.excludedSrcPagePaths.some(pagePath => file.startsWith(pagePath))) {
            (new OrisonRenderer({
              file: relFilePath,
              rootPath: this.rootPath,
              srcDirectory: this.srcDirectory,
              layoutFileBasename: this.layoutFileBasename,
              dataFileBasename: this.dataFileBasename,
              pagesDirectory: this.pagesDirectory,
              fragmentName: this.fragmentName,
              buildDir: this.buildDir
            })).write(this.generateSlugs);
          }
        },
        directory => {
          const newPath = this.getBuildPath(this.getPageContextPath(directory));
          if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
        }
      );
    }
  }

  isSourcePage(file) {
    return ! file.endsWith(this.layoutFileBasename + '.js') &&
           ( file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md') || file.endsWith('data.json') );
  }

  copyStaticFiles() {
    const staticPath = this.getStaticPath(this.generatePath);
    if (fs.existsSync(staticPath)) {
      ncp(staticPath, this.getBuildPath(this.generatePath), err => {
        if (err) throw err;
      });
    }
  }

  prepBuildDir() {
    if (fs.existsSync(this.getBuildPath())) {
      this.cleanBuildDir();
    } else {
      fs.mkdirSync(this.getBuildPath());
    }
  }

  cleanBuildDir() {
    this.deleteBuildFiles();
    this.deleteBuildDirectories();
  }

  validSlug(file) {
    return this.generateSlugs.length === 0 || this.generateSlugs.includes(path.basename(file));
  }

  get excludedSrcPagePaths() {
    return this.excludedPaths.map(excludedPath => path.join(this.rootPath, this.srcDirectory, this.pagesDirectory, excludedPath));
  }

  get excludedBuildPaths() {
    return this.excludedPaths.map(excludedPath => path.join(this.rootPath, this.buildDir, excludedPath));
  }

  deleteBuildFiles() {
    const deletePath = this.getBuildPath(this.generatePath);
    if (fs.existsSync(deletePath)) {
      fileWalker(deletePath,
        file => {
          if (! this.protectedFileNames.includes(path.basename(file)) &&
              ! this.excludedBuildPaths.some(buildPath => file.startsWith(buildPath)) &&
              this.validSlug(file)) {
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

  deleteBuildDirectories() {
    const deletePath = this.getBuildPath(this.generatePath);
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
