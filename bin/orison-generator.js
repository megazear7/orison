import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import { ncp } from 'ncp';
import OrisonRenderer from './orison-renderer.js';
import {
  DEFAULT_SRC_DIR,
  DEFAULT_BUILD_DIR,
  DEFAULT_PAGES_DIR,
  DEFAULT_DATA_BASENAME,
  DEFAULT_LAYOUT_BASENAME,
  DEFAULT_PROTECTED_FILES,
  DEFAULT_GLOBAL_METADATA_FILENAME,
  DEFAULT_STATIC_DIR } from './orison-esm.js';

export default class OrisonGenerator {
  constructor({
      rootPath,
      buildDir = DEFAULT_BUILD_DIR,
      protectedFileNames = DEFAULT_PROTECTED_FILES,
      globalMetadataFile = DEFAULT_GLOBAL_METADATA_FILENAME,
      staticDirectory = DEFAULT_STATIC_DIR,
      pagesDirectory = DEFAULT_PAGES_DIR,
      srcDirectory = DEFAULT_SRC_DIR,
      layoutFileBasename = DEFAULT_LAYOUT_BASENAME,
      dataFileBasename = DEFAULT_DATA_BASENAME
    }) {
    this.buildDir = buildDir;
    this.protectedFileNames = protectedFileNames;
    this.staticDirectory = staticDirectory;
    this.pagesDirectory = pagesDirectory;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.rootPath = rootPath;

    const globalMetadataFilePath = this.getPagesPath(globalMetadataFile)
    this.global = fs.existsSync(globalMetadataFilePath)
      ? JSON.parse(fs.readFileSync(globalMetadataFilePath))
      : { };
  }

  build() {
    this.prepBuildDir();
    this.copyStaticFiles();
    this.generatePages();
  }

  getPageContextPath(pagePath) {
    return pagePath.split('/' + this.pagesDirectory)[1];
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
        if (this.isSourcePage(file)) (new OrisonRenderer({file, rootPath: this.rootPath})).write();
      },
      directory => {
        const newPath = this.getBuildPath(this.getPageContextPath(directory));
        if (!fs.existsSync(newPath)) fs.mkdirSync(newPath);
      }
    );
  }

  isSourcePage(file) {
    return ! file.endsWith(this.layoutFileBasename + '.js') &&
           ( file.endsWith('.js') || file.endsWith('.html') || file.endsWith('.md') );
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
