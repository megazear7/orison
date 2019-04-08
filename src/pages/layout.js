const { html } = require('@popeindustries/lit-html-server');
import footer from '../partials/footer.js';

export default page => html`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OrisonJS Docs</title>
    <script src="/app.js"></script>
    <link rel="stylesheet" type="text/css" href="/app.css">

    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="OrisonJS documentation">
    <link rel="icon" href="icons/favicon.ico">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#fa5d0f">

    <!-- Add to homescreen for Chrome on Android. Fallback for manifest.json -->
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="Orison Docs">

    <!-- Add to homescreen for Safari on iOS -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="Orison Docs">

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
    ${page}
    ${footer()}
  </body>
</html>
`;
