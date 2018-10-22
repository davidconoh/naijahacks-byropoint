cacheName = 'byropoint-v1';

// Call install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

// Call activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  // Remove unwanted caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      )
    })
  )
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Clone response
        const resClone = res.clone();
        // Open cache
        caches
          .open(cacheName)
          .then(cache => {
            // Add the response to the cache
            cache.put(event.request, resClone);
          });
        return res;
      }).catch(err => {
        // If connection drops, use the cached result
        return caches.match(event.request).then(res => res);
      })
  );
})