const { html } = require('@popeindustries/lit-html-server');
import footer from '../partials/footer.js';
import header from '../partials/header.js';

export default page => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OrisonJS</title>
    <script src="/app.js"></script>
    <link rel="stylesheet" type="text/css" href="/app.css">

    <link rel="stylesheet" href="/highlightjs/github.css">
    <script src="/highlightjs/highlight.pack.min.js"></script>
    <script>hljs.initHighlightingOnLoad();</script>

    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Orison server and static stite generator documentation">
    <link rel="icon" href="icons/favicon.ico">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#fa5d0f">

    <!-- Add to homescreen for Chrome on Android. Fallback for manifest.json -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="OrisonJS">

    <!-- Add to homescreen for Safari on iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="OrisonJS">

    <!-- Homescreen icons -->
    <link rel="apple-touch-icon" href="icons/icon-640x640.png">
    <link rel="apple-touch-icon" sizes="512x512" href="icons/icon-512x512.png">

    <!-- Tile icon for Windows 8 (144x144 + tile color) -->
    <meta name="msapplication-TileImage" content="icons/icon-512x512.png">
    <meta name="msapplication-TileColor" content="#fa5d0f">
    <meta name="msapplication-tap-highlight" content="no">

    <!-- Default twitter cards -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:site" content="@username">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="orison">
    <meta property="og:image" content="icons/icon-512x512.png" />
  </head>
  <body>
    ${header()}
    ${page}
    ${footer()}
  </body>
</html>
`;
