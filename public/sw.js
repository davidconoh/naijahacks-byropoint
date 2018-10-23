const cacheName = 'byropoint-v1';

const cacheAssets = [
  'index.html',
  '/css/style.css',
  '/js/main.js',
  'manifest.json'
];

// Call Install Event
self.addEventListener('install', e => {
  console.log('Service Worker: Installed');

  e.waitUntil(
    caches
      .open(cacheName)
      .then(cache => {
        console.log('Service Worker: Caching Files');
        cache.addAll(cacheAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Call Activate Event
self.addEventListener('activate', e => {
  console.log('Service Worker: Activated');
  // Remove unwanted caches
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== cacheName) {
            console.log('Service Worker: Clearing Old Cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Call Fetch Event
self.addEventListener('fetch', e => {
  console.log('Service Worker: Fetching');
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});


self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.notification.title, {
    body: data.notification.body,
    icon: "img/favicon.png",
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
