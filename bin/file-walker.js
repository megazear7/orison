import fs from 'fs';
import path from 'path';

/**
 * Runs either the fileCallback or the directoryCallback on each file and directory under the given directory.
 * @param dir The directory to recursively walk through.
 * @param fileCallback The function to call for each file found.
 * The first parameter to this method is the file path.
 * @param directoryCallback The function to call for each directory found.
 * The first parameter to this method is the directory path.
 */
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
