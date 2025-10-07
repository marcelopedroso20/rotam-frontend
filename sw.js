// =======================================
// Service Worker - ROTAM Sistema PWA
// =======================================

const CACHE_VERSION = 'v3.0.0';
const STATIC_CACHE = `rotam-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './login.html',
  './cadastro.html',
  './relatorios.html',
  './livro_rt90.html',
  './historico_rt90.html',
  './offline.html',

  // JS/CSS
  './pwa.js',
  './js/login.js',
  './js/logout.js',
  './js/config.js',
  './assets/style.css',

  // Ícones e logos
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo-rotam.png',
  './assets/logo-rotam-192.png',
  './assets/logo-rotam-512.png',
  './assets/logo-rotam-bg.png'
];

// 🧩 Instalação
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ♻️ Ativação (limpa caches antigos)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 🔁 Mensagem para atualização forçada
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 🌐 Estratégias de cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // HTML → network-first
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match('./offline.html')))
    );
    return;
  }

  // CSS/JS/Imagens → cache-first
  if (['style', 'script', 'image', 'font'].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (req.method === 'GET' && res && res.status === 200) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // Outros (API etc)
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
