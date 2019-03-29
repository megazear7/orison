import { renderToString } from '@popeindustries/lit-html-server';
import index from '../src/pages/index.js';
import fileWalker from './file-walker.js';
import fs from 'fs';

export default function({
    buildDir = 'docs'
  } = {}) {
  fileWalker(__dirname + '/../src/pages',
    (err, file) => {
      if (err) throw err;
      if (file.includes('/layout.js')) return;

      const renderers = require(file).default;

      let pages = [ ];
      if (renderers.constructor.name === 'TemplateResult') {
        pages.push({
          path: '/' + buildDir + file.slice(__dirname.length).slice('/pages'.length).replace('.js', '.html'),
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

      if (!fs.existsSync(__dirname + '/../' + buildDir)){
        fs.mkdirSync(__dirname + '/../' + buildDir);
      }

      pages.forEach(page => {
        page.html.then(html => {
          fs.writeFile(__dirname + '/..' + page.path, html, err => {
            if (err) console.log(err);
          });
        });
      });
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
}
