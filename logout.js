// logout.js

function logout() {
  // Remove dados do usuário
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  // Redireciona para a tela de login
  window.location.href = "login.html";
}
