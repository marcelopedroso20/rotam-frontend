// js/logout.js
function logout(){ localStorage.removeItem('token'); localStorage.removeItem('usuario'); location.href='login.html'; }
