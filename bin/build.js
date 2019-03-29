import { renderToString } from '@popeindustries/lit-html-server';
import index from '../src/pages/index.js';
import fileWalker from './file-walker.js';
import fs from 'fs';

fileWalker(__dirname + '/../src/pages',
  (err, file) => {
    if (err) throw err;
    if (file.includes('/layout.js')) return;

    const newPath = '/build' + file
      .slice(__dirname.length)
      .slice('/pages'.length)
      .replace('.js', '.html');
    const page = renderToString(require(file).default);

    if (!fs.existsSync(__dirname + '/../build')){
      fs.mkdirSync(__dirname + '/../build');
    }

    page.then(html => {
      fs.writeFile(__dirname + '/..' + newPath, html, err => {
        if (err) console.log(err);
      });
    });
  },
  (err, directory) => {
    const newPath = '/build' + directory.slice(__dirname.length).slice('/pages'.length)
    fs.mkdir(__dirname + '/..' + newPath, err => {
      if (err) console.log(err);
    });
  }
);
