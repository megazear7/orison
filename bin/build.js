import fs from 'fs';
import path from 'path';
import { renderToString } from '@popeindustries/lit-html-server';
import index from '../src/pages/index.js';
import fileWalker from './file-walker.js';
import md from 'markdown-it';
import { ncp } from 'ncp';

export default function({ buildDir = 'docs' } = {}) {
  if (!fs.existsSync(getBuildPath())){
    fs.mkdirSync(getBuildPath());
  }

  ncp(getSrcPath('static'), getBuildPath(), function (err) {
   if (err) {
     return console.error(err);
   }
  });

  fileWalker(getSrcPath('pages'),
    (err, file) => {
      if (err) throw err;

      if (file.includes('/layout.js')) {
        return;
      } else if (file.endsWith('.md')) {
        renderMdFile(file);
      } else if (file.endsWith('.js')) {
        renderJsFile(file);
      }
    },
    (err, directory) => {
      const newPath = getBuildPath(getPageContextPath(directory));
      if (!fs.existsSync(newPath)){
        fs.mkdir(newPath, err => {
          if (err) console.log(err);
        });
      }
    }
  );

  function renderMdFile(file) {
    let markdown = fs.readFileSync(file).toString();
    let html = md().render(markdown);

    fs.writeFile(getBuildFilePath(file), html, err => {
      if (err) console.log(err);
    });
  }

  function renderJsFile(file) {
    const renderers = require(file).default;

    let pages = [ ];
    if (renderers.constructor.name === 'TemplateResult') {
      pages.push({
        path: getBuildFilePath(file),
        html: renderToString(renderers)
      });
    } else {
      Object.keys(renderers).forEach(key => {
        const renderer = renderers[key];
        let filePath = replaceFileName(getPageContextPath(file), key + '.html');

        pages.push({
          path: getBuildPath(filePath),
          html: renderToString(renderer)
        });
      });
    }

    pages.forEach(page => {
      page.html.then(html => {
        fs.writeFile(page.path, html, err => {
          if (err) console.log(err);
        });
      });
    });
  }

  function replaceFileName(filePath, fileName) {
    let directory = filePath.slice(0, filePath.lastIndexOf('/'))
    return path.join(directory, fileName);
  }

  function replaceExtension(filePath, extension) {
    let newFilePath = path.basename(filePath, path.extname(filePath)) + '.' + extension;
    return path.join(path.dirname(filePath), newFilePath);
  }

  function getBuildFilePath(file) {
    return getBuildPath(replaceExtension(getPageContextPath(file), 'html'));
  }

  function getPageContextPath(pagePath) {
    return pagePath.split('/pages')[1];
  }

  function getSrcPath(srcPath = '') {
    return path.join(__dirname, '../src', srcPath);
  }

  function getBuildPath(buildPath = '') {
    return path.join(__dirname, '..', buildDir, buildPath);
  }
}
