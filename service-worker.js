self.addEventListener("install", event => {
  console.log("Service Worker instalado");
  event.waitUntil(
    caches.open("rotam-cache").then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./manifest.json"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
