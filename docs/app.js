if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('/sw.js')
  .then(function(reg) {
    console.debug('Registration succeeded. Scope is ' + reg.scope);
  }).catch(function(error) {
    console.debug('Registration failed with ' + error);
  });
}

function loadFragment(path, callback) {
  // Determine the fragment path
  var fragmentPath = path.includes('.html')
    ? path.replace('.html', '.fragment.html')
    : path + 'index.fragment.html';

  fetch(fragmentPath)
  .then(res => res.text())
  .then(fragmentHtml => {
    replacePage(fragmentHtml);
    if (typeof callback === 'function') callback(fragmentHtml);
  });
}

function replacePage(fragmentHtml) {
  document.querySelector('main').innerHTML = fragmentHtml;
}

window.addEventListener('popstate', event => {
  event.state && event.state.fragmentHtml
    ? replacePage(event.state.fragmentHtml)
    : loadFragment(document.location.pathname);
});

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener('click', event => {
    var tag = event.target;

    // It's a left click on an <a href=...>.
    if (tag.tagName == 'A' && tag.href && event.button == 0) {
      // It's a same-origin navigation: a link within the site.
      if (tag.origin == document.location.origin) {
        var oldPath = document.location.pathname;
        var newPath = tag.pathname;

        // Only do this for relative urls
        if (newPath.startsWith('/')) {
          // Prevent the browser from doing the navigation.
          event.preventDefault();

          loadFragment(newPath, fragmentHtml => history.pushState({ fragmentHtml }, '', newPath));
        }
      }
    }
  });
});
