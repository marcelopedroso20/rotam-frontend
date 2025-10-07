<!-- assets/js/pwa.js -->
<script>
(() => {
  const BASE = '/rotam-frontend';
  const SW_URL = `${BASE}/sw.js`;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const reg = await navigator.serviceWorker.register(SW_URL, { scope: BASE + '/' });
        console.log('[PWA] Service Worker OK:', reg.scope);
      } catch (err) {
        console.error('[PWA] Erro ao registrar SW:', err);
      }
    });
  }
})();
</script>
