import fs from 'fs';
import path from 'path';

export default function fileWalker(dir, fileCallback = function() {}, directoryCallback = function() {}) {
  fs.readdir(dir, (err, list) => {
    if (err) return directoryCallback(err);

    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          directoryCallback(null, file);
          fileWalker(file, fileCallback, directoryCallback);
        } else {
          fileCallback(null, file);
        }
      });
    });
  });
}
