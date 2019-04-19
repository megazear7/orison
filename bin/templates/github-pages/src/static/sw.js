// Put all of your caches into an array so we can add other types of caches later.
var appCacheName = 'app-cache-v1';
var cacheNames = [appCacheName];

self.addEventListener('fetch', function(e) {
  console.debug('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.open(appCacheName).then(function(cache) {
      return fetch(e.request)
      .then(function(response){
        console.debug('[ServiceWorker] Updating cache', e.request.url);
        cache.put(e.request.url, response.clone());
        return response;
      })
      .catch(function() {
        console.debug('[ServiceWorker] Using response from cache', e.request.url);
        return cache.match(e.request);
      });
    })
  );
});
