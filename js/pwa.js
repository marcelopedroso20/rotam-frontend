// ===============================
// Registro do Service Worker PWA
// ===============================
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      console.log('✅ Service Worker registrado:', reg.scope);

      // Atualiza automaticamente se houver nova versão
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('⚙️ Nova versão do app disponível.');
          }
        });
      });
    } catch (err) {
      console.error('❌ Falha ao registrar o Service Worker:', err);
    }
  });
})();
