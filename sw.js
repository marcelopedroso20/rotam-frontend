// =========================
// Service Worker - ROTAM
// =========================

const CACHE_VERSION = 'v2.0.2'; // ⚡ Sempre mudar ao atualizar
const STATIC_CACHE = `rotam-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './login.html',
  './cadastro.html',
  './relatorios.html',
  './assets/style.css',
  './assets/logo-rotam-frontend.png',
  './assets/logo-rotam-bg-1920x1080.png', // cuidado: se não existir, será ignorado
  './assets/logo-rotam-192.png',
  './assets/logo-rotam-512.png',
  './js/api.js',
  './js/auth.js',
  './js/login.js',
  './js/logout.js',
  './js/cadastro.js',
  './js/relatorios.js',
  './js/pwa.js',
  './manifest.json'
];

// 🛠 Instalação: pré-carrega os assets
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn('⚠️ Não foi possível adicionar ao cache:', url, err)
          )
        )
      );
    })
  );
  self.skipWaiting();
});

// 🧹 Ativação: remove caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativado!');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== STATIC_CACHE)
        .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 🌐 Estratégias de cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isSameOrigin = url.origin === self.location.origin;
  const isApiPath = url.pathname.startsWith('/auth') || url.pathname.startsWith('/occurrences');

  // 1) APIs → network first
  if (!isSameOrigin || isApiPath) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // 2) Navegação → network first com fallback
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./login.html')))
    );
    return;
  }

  // 3) Assets estáticos → cache first
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
});
