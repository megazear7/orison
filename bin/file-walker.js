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
export default async function fileWalker(dir, fileCallback = function() {}, directoryCallback = function() {}) {
  for (var file of fs.readdirSync(dir)) {
    const filePath = path.resolve(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      await Promise.resolve(directoryCallback(filePath));
      await fileWalker(filePath, await Promise.resolve(fileCallback), await Promise.resolve(directoryCallback));
    } else {
      await Promise.resolve(fileCallback(filePath));
    }
  }
}
