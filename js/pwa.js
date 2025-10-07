// =====================================
// ROTAM PWA - Registro do Service Worker
// =====================================
(() => {
  const BASE = '/rotam-frontend';
  const SW_URL = `${BASE}/sw.js`;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(SW_URL, { scope: BASE + '/' });
        console.log('[PWA] Service Worker registrado com sucesso:', reg.scope);
      } catch (err) {
        console.error('[PWA] Erro ao registrar o Service Worker:', err);
      }
    });
  }
})();
