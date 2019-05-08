import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import { ncp } from 'ncp';
import OrisonRenderer from './orison-renderer.js';
import {
  DEFAULT_GENERATE_PATH,
  DEFAULT_GENERATE_SLUGS,
  DEFAULT_SRC_DIR,
  DEFAULT_BUILD_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_DATA_BASENAME,
  DEFAULT_LAYOUT_BASENAME,
  DEFAULT_PROTECTED_FILES,
  DEFAULT_FRAGMENT_NAME,
  DEFAULT_STATIC_DIR } from './orison-esm.js';

export default class OrisonGenerator {
  constructor({
      rootPath,
      generatePath = DEFAULT_GENERATE_PATH,
      generateSlugs = DEFAULT_GENERATE_SLUGS,
      buildDir = DEFAULT_BUILD_DIR,
      protectedFileNames = DEFAULT_PROTECTED_FILES,
      staticDirectory = DEFAULT_STATIC_DIR,
      pagesDirectory = DEFAULT_PAGES_DIR,
      srcDirectory = DEFAULT_SRC_DIR,
      layoutFileBasename = DEFAULT_LAYOUT_BASENAME,
      dataFileBasename = DEFAULT_DATA_BASENAME,
      fragmentName = DEFAULT_FRAGMENT_NAME
    }) {
    this.rootPath = rootPath;
    this.generatePath = generatePath;
    this.generateSlugs = generateSlugs;
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
          if (this.isSourcePage(file) && relFilePath.startsWith(this.generatePath)) {
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

  deleteBuildFiles() {
    const deletePath = this.getBuildPath(this.generatePath);
    if (fs.existsSync(deletePath)) {
      fileWalker(deletePath,
        file => {
          if (! this.protectedFileNames.includes(path.basename(file))) {
            try {
              if (this.generateSlugs.length === 0 || this.generateSlugs.includes(path.basename(file))) {
                fs.unlinkSync(file);
              }
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
