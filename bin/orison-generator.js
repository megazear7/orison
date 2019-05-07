import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import { ncp } from 'ncp';
import OrisonRenderer from './orison-renderer.js';
import {
  DEFAULT_GENERATE_PATH,
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
    this.generatePath = generatePath
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

  getPagesPath(pagesPath = '') {
    return path.join(this.getSrcPath(this.pagesDirectory), pagesPath);
  }

  getBuildPath(buildPath = '') {
    return path.join(this.rootPath, this.buildDir, buildPath);
  }

  generatePages() {
    console.log(`Generating to ${this.buildDir} from ${this.srcDirectory}:`);
    fileWalker(this.getSrcPath(this.pagesDirectory),
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
          })).write();
        }
      },
      directory => {
        const newPath = this.getBuildPath(this.getPageContextPath(directory));
        if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
      }
    );
  }

  isSourcePage(file) {
    return ! file.endsWith(this.layoutFileBasename + '.js') &&
           ( file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md') || file.endsWith('data.json') );
  }

  copyStaticFiles() {
    ncp(this.getSrcPath(this.staticDirectory), this.getBuildPath(), err => {
      if (err) throw err;
    });
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
    fileWalker(this.getBuildPath(),
      file => {
        if (! this.protectedFileNames.includes(path.basename(file))) {
          try {
            fs.unlinkSync(file);
          } catch {
            console.debug('Could not delete build file: ' + file);
          }
        }
      }
    );
  }

  deleteBuildDirectories() {
    fileWalker(this.getBuildPath(),
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
