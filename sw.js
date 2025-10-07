// ============================================
// ROTAM - SERVICE WORKER (PWA CACHE MANAGER)
// ============================================

const CACHE_NAME = 'rotam-cache-v5';
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
  `${BASE}/assets/logo-rotam-frontend.png`,
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
      .then(cache => {
        return Promise.allSettled(
          ASSETS.map(url =>
            fetch(url).then(resp => {
              if (resp.ok) {
                return cache.put(url, resp.clone());
              } else {
                console.warn('[SW] Falha ao buscar:', url);
              }
            }).catch(() => console.warn('[SW] Não foi possível armazenar:', url))
          )
        );
      })
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
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
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
