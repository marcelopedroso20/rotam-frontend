// logout.js
function logout() {
  localStorage.removeItem("token"); // apaga o token salvo
  window.location.href = "login.html"; // volta para tela de login
}
