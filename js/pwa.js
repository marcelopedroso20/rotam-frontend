<script>
// Registro do Service Worker (carrega em todas as páginas)
(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // registra o SW no mesmo diretório dos HTMLs (GitHub Pages ok)
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './' });
      // console.log('SW registrado:', reg.scope);

      // força atualização de versão do SW se houver
      if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // nova versão pronta (opcionalmente, mostrar um toast/alert)
            // location.reload(); // só se quiser recarregar auto
          }
        });
      });
    } catch (err) {
      console.error('Falha ao registrar o Service Worker:', err);
    }
  });
})();
</script>
