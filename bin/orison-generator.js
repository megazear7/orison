import fs from 'fs';
import path from 'path';
import fileWalker from './file-walker.js';
import { ncp } from 'ncp';
import OrisonRenderer from './orison-renderer.js';

export default class OrisonGenerator {
  constructor({
      buildDir = 'docs',
      protectedFileNames = [ 'CNAME' ],
      globalMetadataFile = 'global.json',
      staticDirectory = 'static',
      pagesDirectory = 'pages',
      srcDirectory = 'src',
      layoutFileBasename = 'layout',
      dataFileBasename = 'data'
    } = {}) {
    this.buildDir = buildDir;
    this.protectedFileNames = protectedFileNames;
    this.staticDirectory = staticDirectory;
    this.pagesDirectory = pagesDirectory;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
    this.global = JSON.parse(fs.readFileSync(this.getSrcPath(globalMetadataFile)));
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

    fileWalker(this.getSrcPath(this.pagesDirectory),
      (err, file) => {
        if (err) {
          throw err;
        } else if (file.endsWith(this.layoutFileBasename + '.js')) {
          return;
        } else {
          (new OrisonRenderer(this, file)).render();
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
    return path.join(__dirname, '../', this.srcDirectory, srcPath);
  }

  getBuildPath(buildPath = '') {
    return path.join(__dirname, '..', this.buildDir, buildPath);
  }
}
