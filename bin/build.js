import { renderToString } from '@popeindustries/lit-html-server';
import index from '../src/pages/index.js';
import fileWalker from './file-walker.js';
import fs from 'fs';
import md from 'markdown-it';
import { ncp } from 'ncp';

export default function({ buildDir = 'docs' } = {}) {
  ncp(__dirname + '/../src/static', __dirname + '/../' + buildDir, function (err) {
   if (err) {
     return console.error(err);
   }
  });

  fileWalker(__dirname + '/../src/pages',
    (err, file) => {
      if (err) throw err;

      if (!fs.existsSync(__dirname + '/../' + buildDir)){
        fs.mkdirSync(__dirname + '/../' + buildDir);
      }

      if (file.includes('/layout.js')) {
        return;
      } else if (file.endsWith('.md')) {
        renderMdFile(file);
      } else if (file.endsWith('.js')) {
        renderJsFile(file);
      }
    },
    (err, directory) => {
      const newPath = __dirname + '/../' + buildDir + directory.slice(__dirname.length).slice('/pages'.length)
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

    fs.writeFile(__dirname + '/..' + getBuildPath(file), html, err => {
      if (err) console.log(err);
    });
  }

  function renderJsFile(file) {
    const renderers = require(file).default;

    let pages = [ ];
    if (renderers.constructor.name === 'TemplateResult') {
      pages.push({
        path: getBuildPath(file),
        html: renderToString(renderers)
      });
    } else {
      Object.keys(renderers).forEach(key => {
        const renderer = renderers[key];
        let path = '/' + buildDir + file.slice(__dirname.length).slice('/pages'.length);
        path = path.slice(0, path.lastIndexOf('/'))
        path = path + '/' + key + '.html';

        pages.push({
          path: path,
          html: renderToString(renderer)
        });
      });
    }

    pages.forEach(page => {
      page.html.then(html => {
        fs.writeFile(__dirname + '/..' + page.path, html, err => {
          if (err) console.log(err);
        });
      });
    });
  }

  function getBuildPath(file) {
    return '/' + buildDir + file.slice(__dirname.length).slice('/pages'.length).replace('.js', '.html');
  }
}
