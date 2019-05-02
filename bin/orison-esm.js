export { default as OrisonGenerator } from './orison-generator.js';
export { default as OrisonRenderer } from './orison-renderer.js';
export { default as OrisonDirectory } from './orison-directory.js';
export { default as OrisonServer } from './orison-server.js';
export { default as OrisonStaticServer } from './orison-static-server.js';
export { mdString, mdFile } from './markdown.js';
export { html, renderToString } from '@popeindustries/lit-html-server';

export const DEFAULT_SRC_DIR = 'src';
export const DEFAULT_BUILD_DIR = 'docs';
export const DEFAULT_PAGES_DIR = 'pages';
export const DEFAULT_DATA_BASENAME = 'data';
export const DEFAULT_LAYOUT_BASENAME = 'layout';
export const DEFAULT_INDEX_BASENAME = 'index';
export const DEFAULT_LIST_BASENAME = 'list';
export const DEFAULT_FRAGMENT_NAME = 'fragment';
export const DEFAULT_PROTECTED_FILES = [ 'CNAME' ];
export const DEFAULT_404_FILENAME = '404.html';
export const DEFAULT_500_FILENAME = '500.html';
export const DEFAULT_STRIP_HTML = false;
export const DEFAULT_STATIC_DIR = 'static';
export const DEFAULT_PORT = 3000;
