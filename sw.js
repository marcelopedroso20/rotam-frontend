// =========================
// Service Worker - ROTAM
// =========================

// 🔁 Troque a versão SEMPRE que publicar mudanças importantes
const CACHE_VERSION = 'v2.0.1';
const STATIC_CACHE = `rotam-static-${CACHE_VERSION}`;

// 🧰 Arquivos para pré-cache (abrir rápido e offline básico)
const PRECACHE_URLS = [
  './',
  './index.html',
  './login.html',
  './cadastro.html',
  './relatorios.html',
  './assets/style.css',
  './assets/logo-rotam-frontend.png',
  './assets/logo-rotam-bg-1920x1080.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/auth.js',
  './js/login.js',
  './js/logout.js',
  './js/pwa.js',
  './manifest.json'
];

// 🛠 Instalação: pré-carrega os assets
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// 🧹 Ativação: limpa caches antigos e assume controle
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
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

  // 1) Chamadas de API: network-first
  const isSameOrigin = url.origin === self.location.origin;
  const isApiPath =
    url.pathname.startsWith('/auth') || url.pathname.startsWith('/occurrences');

  if (!isSameOrigin || isApiPath) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req)) // fallback offline
    );
    return;
  }

  // 2) Páginas HTML: network-first + fallback em cache
  if (
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html')
  ) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // 3) Arquivos estáticos (CSS/JS/Imagens): cache-first
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
