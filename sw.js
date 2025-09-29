// =========================
// Service Worker - ROTAM
// =========================

// 🔁 Troque a versão SEMPRE que publicar mudanças importantes
const CACHE_VERSION = 'v2.0.0';
const STATIC_CACHE = `rotam-static-${CACHE_VERSION}`;

// 🧰 Arquivos que queremos pré-cachear (abrir rápido e funcionar offline básico)
const PRECACHE_URLS = [
  './',                // fallback
  './index.html',
  './login.html',
  './cadastro.html',
  './relatorios.html',
  './assets/style.css',
  './assets/logo-rotam-frontend.png',
  './assets/logo-rotam-bg-1920x1080.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
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
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// 🧹 Ativação: limpa caches antigos e assume controle imediatamente
self.addEventListener('activate', (event) => {
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

  // 1) Para chamadas de API (outro domínio OU rotas /auth e /occurrences): network-first
  const isSameOrigin = url.origin === self.location.origin;
  const isApiPath = url.pathname.startsWith('/auth') || url.pathname.startsWith('/occurrences');

  if (!isSameOrigin || isApiPath) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req)) // se offline, tenta cache (se existir)
    );
    return;
  }

  // 2) Navegação (HTML): network-first com fallback em cache
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

  // 3) Assets estáticos (CSS/JS/Imagens): cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Só cacheia GET bem-sucedido
        if (req.method === 'GET' && res && res.status === 200) {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
