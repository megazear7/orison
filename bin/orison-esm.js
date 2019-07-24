export { default as OrisonGenerator } from './orison-generator.js';
export { default as OrisonRenderer } from './orison-renderer.js';
export { default as OrisonDirectory } from './orison-directory.js';
export { default as OrisonServer } from './orison-server.js';
export { default as OrisonStaticServer } from './orison-static-server.js';
export { mdString, mdFile } from './markdown.js';
export { html, renderToString } from '@popeindustries/lit-html-server';
export { unsafeHTML } from '@popeindustries/lit-html-server/directives/unsafe-html.js';

export const DEFAULTS = {
  GENERATE_PATH: '/',
  GENERATE_SLUGS: [ ],
  EXCLUDED_PATHS: [ ],
  SRC_DIR: 'src',
  BUILD_DIR: 'docs',
  PAGES_DIR: 'pages',
  DATA_BASENAME: 'data',
  LAYOUT_BASENAME: 'layout',
  INDEX_BASENAME: 'index',
  LIST_BASENAME: 'list',
  FRAGMENT_NAME: 'fragment',
  LOADER_DIRECTORY: 'loaders',
  PROTECTED_FILES: [ 'CNAME' ],
  FILENAME_404: '/404.html',
  FILENAME_500: '/500.html',
  STRIP_HTML: false,
  STATIC_DIR: 'static',
  PORT: 3000
};
