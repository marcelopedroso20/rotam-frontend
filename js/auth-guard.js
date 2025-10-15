// js/auth-guard.js
(function(){ const isLogin=location.pathname.endsWith('/login.html'); const t=localStorage.getItem('token'); if(!isLogin && !t) location.href='login.html'; })();
