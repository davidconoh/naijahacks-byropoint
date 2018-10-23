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
  if(event.request.method == 'POST') return;

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
});

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.notification.title, {
    body: data.notification.body,
    icon: "img/favicon.ico",
    vibrate: [100, 50, 100],
  });

  // Send new data to display
  clients.matchAll().then(clients => {
    sendData(clients[0],data.article);
  })
});

function sendData(client, data){
  return new Promise(function(resolve, reject){
      var msg_chan = new MessageChannel();

      msg_chan.port1.onmessage = function(event){
          if(event.data.error){
              reject(event.data.error);
          }else{
              resolve(event.data);
          }
      };

      client.postMessage(data, [msg_chan.port2]);
  });
}
