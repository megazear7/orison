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
  DEFAULT_STATIC_DIR } from './orison.js';

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
    this.global = JSON.parse(fs.readFileSync(this.getPagesPath(globalMetadataFile)));
  }

  build() {
    if (fs.existsSync(this.getBuildPath())){
      fileWalker(this.getBuildPath(),
        (err, file) => {
          if (! this.protectedFileNames.includes(path.basename(file))) fs.unlinkSync(file);
        }
      );
    } else {
      fs.mkdirSync(this.getBuildPath());
    }

    ncp(this.getSrcPath(this.staticDirectory), this.getBuildPath(), err => {
     if (err) {
       return console.error(err);
     }
    });

    console.log(`Generating to ${this.buildDir} from ${this.srcDirectory}:`);
    fileWalker(this.getSrcPath(this.pagesDirectory),
      (err, file) => {
        if (err) {
          throw err;
        } else if (file.endsWith(this.layoutFileBasename + '.js')) {
          return;
        } else {
          (new OrisonRenderer({file, rootPath: this.rootPath})).render();
        }
      },
      (err, directory) => {
        const newPath = this.getBuildPath(this.getPageContextPath(directory));
        if (!fs.existsSync(newPath)){
          fs.mkdir(newPath, err => {
            if (err) console.log(err);
          });
        }
      }
    );
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
}
