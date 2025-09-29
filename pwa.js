// Registro do Service Worker para o PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { scope: './' })
      .then(reg => {
        // console.log('SW registrado:', reg.scope);
      })
      .catch(err => {
        console.error('Falha ao registrar o SW:', err);
      });
  });
}
