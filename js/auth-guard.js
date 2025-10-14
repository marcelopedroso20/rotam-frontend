// js/auth-guard.js
(function(){
  const isLogin = location.pathname.endsWith('/login.html') || location.pathname.endsWith('/');
  const token = localStorage.getItem('token');
  if (!isLogin && !token) { location.href = 'login.html'; }
})();
