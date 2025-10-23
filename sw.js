// ============================================
// ROTAM - SERVICE WORKER (PWA CACHE MANAGER)
// ============================================

const CACHE_NAME = 'rotam-cache-v6';
const BASE = '/rotam-frontend';

const ASSETS = [
  `${BASE}/`,
  `${BASE}/index.html`,
  `${BASE}/login.html`,
  `${BASE}/cadastro.html`,
  `${BASE}/relatorios.html`,
  `${BASE}/livro_rt90.html`,
  `${BASE}/historico_rt90.html`,
  `${BASE}/offline.html`,
  `${BASE}/manifest.json`,

  // CSS e imagens
  `${BASE}/assets/style.css`,
  `${BASE}/assets/favicon.ico`,
  `${BASE}/assets/logo-rotam.png`,
  `${BASE}/assets/logo-rotam.jpg`,
  `${BASE}/assets/logo-rotam-bg.png`,

  // JS principais
  `${BASE}/js/pwa.js`,
  `${BASE}/js/login.js`,
  `${BASE}/js/logout.js`,
  `${BASE}/js/config.js`,
  `${BASE}/js/auth.js`
];

// ============================
// INSTALL
// ============================
self.addEventListener('install', event => {
  console.log('[SW] Instalando e criando cache...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ============================
// ACTIVATE
// ============================
self.addEventListener('activate', event => {
  console.log('[SW] Ativado');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ============================
// FETCH (Offline fallback)
// ============================
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(resp => resp || fetch(event.request))
      .catch(() => caches.match(`${BASE}/offline.html`))
  );
});
