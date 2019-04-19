if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
  navigator.serviceWorker.register('/sw.js')
  .then(function(reg) {
    console.debug('Registration succeeded. Scope is ' + reg.scope);
  }).catch(function(error) {
    console.debug('Registration failed with ' + error);
  });
}

document.addEventListener("DOMContentLoaded", function() {
  document.body.addEventListener('click', function(event) {
    var tag = event.target;

    // It's a left click on an <a href=...>.
    if (tag.tagName == 'A' && tag.href && event.button == 0) {
      // It's a same-origin navigation: a link within the site.
      if (tag.origin == document.location.origin) {
        var oldPath = document.location.pathname;
        var newPath = tag.pathname;

        // Only do this for relative urls
        if (newPath.startsWith('/')) {
          // Determine the fragment path
          var fragment = newPath.includes('.html')
            ? newPath.replace('.html', '.fragment.html')
            : newPath + 'index.fragment.html';

          // Prevent the browser from doing the navigation.
          event.preventDefault();
          fetch(fragment)
          .then(res => res.text())
          .then(html => {
            // Update the <main> element with the fragment and push the new history state.
            document.querySelector('main').innerHTML = html;
            history.pushState(null, '', newPath);
          });
        }
      }
    }
  });
});
