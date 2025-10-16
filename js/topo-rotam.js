// ===============================
// 🚪 ROTAM - Cabeçalho Global com Logout e Usuário Logado
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const spanUsuario = document.getElementById("usuarioLogado");
  const btnLogout = document.getElementById("logoutGlobal");
  const token = localStorage.getItem("token");

  if (!token) {
    spanUsuario.textContent = "⚠️ Sessão expirada. Faça login novamente.";
    window.location.href = "login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;

    // Se o token expirou
    if (Date.now() > exp) {
      localStorage.removeItem("token");
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }

    // Mostra o usuário logado
    spanUsuario.textContent = `👮 Bem-vindo, ${payload.usuario.toUpperCase()} (${payload.role})`;

  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }

  // Logout global
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    });

    // Efeito hover visual
    btnLogout.addEventListener("mouseover", () => btnLogout.style.background = "#c9302c");
    btnLogout.addEventListener("mouseout", () => btnLogout.style.background = "#d9534f");
  }
});
