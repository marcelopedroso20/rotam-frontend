// ===============================
// 🚓 ROTAM - Controle de Sessão e Token
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  // Verifica se há token salvo
  if (!token) {
    alert("Sessão expirada ou não autenticada. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  try {
    // Decodifica o token (parte payload do JWT)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // tempo em ms

    // Verifica expiração
    if (Date.now() > exp) {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    // Exibe informações básicas
    userInfo.innerHTML = `👮 Usuário: <b>${payload.usuario}</b> | Perfil: <b>${payload.role}</b>`;

  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    alert("Erro de autenticação. Faça login novamente.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }

  // Botão de logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Você saiu do sistema.");
    window.location.href = "login.html";
  });
});
