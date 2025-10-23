// ===============================
// 🚔 ROTAM - Proteção de Rotas
// ===============================
(function () {
  const isLogin = location.pathname.endsWith('/login.html');
  const token = localStorage.getItem('token');
  if (!isLogin && !token) {
    location.href = 'login.html';
  }
})();
