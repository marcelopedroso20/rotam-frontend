function logout() {
  localStorage.removeItem("token"); // remove token salvo
  window.location.href = "login.html"; // redireciona para login
}
