// =========================
// Service Worker - ROTAM PWA
// =========================

// 🔁 Troque a versão SEMPRE que publicar mudanças importantes
const CACHE_VERSION = 'v3.0.0';
const STATIC_CACHE = `rotam-static-${CACHE_VERSION}`;

// 🧰 Arquivos para pré-cache (coloque o que existe no seu repositório)
const PRECACHE_URLS = [
  './', // fallback de raiz
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

  // Ícones do PWA
  './icon-192.png',
  './icon-512.png',

  // Logos/Imagens usadas
  './logo-rotam.png'
];

// 🛠 Instala: pré-carrega os assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// 🧹 Ativa: remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Recebe mensagem do app (atualizar SW imediatamente)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 🌐 Estratégias de cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Navegação/HTML → network-first com fallback
  const acceptsHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (acceptsHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          return cached || caches.match('./offline.html');
        })
    );
    return;
  }

  // Assets estáticos (CSS/JS/Imagens) → cache-first
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

  // Demais (ex.: APIs) → network-first, fallback cache
  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});
