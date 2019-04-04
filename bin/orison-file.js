import path from 'path';
import fs from 'fs';

export default class OrisonFile {
  constructor(file, srcDirectory = 'src', layoutFileBasename = 'layout', dataFileBasename = 'data') {
    this.file = file;
    this.srcDirectory = srcDirectory;
    this.layoutFileBasename = layoutFileBasename;
    this.dataFileBasename = dataFileBasename;
  }

  getLayout() {
    let directory = path.dirname(this.file);

    while (! directory.endsWith(this.srcDirectory) && directory != '/') {
      let jsLayoutPath = path.join(directory, this.layoutFileBasename + '.js');
      let htmlLayoutPath = path.join(directory, this.layoutFileBasename + '.html');

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
        directory = path.dirname(directory);
      }
    }

    return new Promise(resolve => resolve(page => html`${page}`));
  }

  getData() {
    let directory = path.dirname(this.file);
    let jsonFilePath = path.join(directory, this.dataFileBasename + '.json');

    return fs.existsSync(jsonFilePath)
      ? import(jsonFilePath)
      : new Promise(resolve => resolve({}));
  }
}
