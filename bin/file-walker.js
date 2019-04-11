import fs from 'fs';
import path from 'path';

export default function fileWalker(dir, fileCallback = function() {}, directoryCallback = function() {}) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      directoryCallback(filePath);
      fileWalker(filePath, fileCallback, directoryCallback);
    } else {
      fileCallback(filePath);
    }
  });
}
