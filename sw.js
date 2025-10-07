// sw.js (na raiz do repositório)
const BASE = '/rotam-frontend';
const CACHE = 'rotam-cache-v4';

const ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/login.html`,
  `${BASE}/cadastro.html`,
  `${BASE}/relatorios.html`,
  `${BASE}/livro_rt90.html`,
  `${BASE}/historico_rt90.html`,
  `${BASE}/assets/style.css`,
  `${BASE}/assets/favicon.ico`,
  `${BASE}/assets/logo-rotam.png`,
  `${BASE}/assets/logo-rotam-frontend.png`,
  `${BASE}/assets/js/config.js`,
  `${BASE}/assets/js/pwa.js`,
  `${BASE}/assets/js/login.js`,
  `${BASE}/assets/js/cadastro.js`,
  `${BASE}/assets/js/index.js`,
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return resp;
        })
        .catch(() => cached || caches.match(`${BASE}/index.html`));
    })
  );
});
