// ===============================
// 🚓 ROTAM - Cabeçalho Global com Logo, Usuário e Logout
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const spanUsuario = document.getElementById("usuarioLogado");
  const btnLogout = document.getElementById("logoutGlobal");
  const token = localStorage.getItem("token");

  if (!token) {
    spanUsuario.textContent = "⚠️ Sessão expirada. Faça login novamente.";
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;

    // 🔒 Verifica expiração
    if (Date.now() > exp) {
      localStorage.removeItem("token");
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "login.html";
      return;
    }

    // ✅ Exibe informações do usuário logado
    spanUsuario.textContent = `👮 ${payload.usuario.toUpperCase()} (${payload.role.toUpperCase()})`;

  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }

  // 🚪 Botão de logout
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }
    });

    // 💅 Efeito visual do botão
    btnLogout.addEventListener("mouseover", () => (btnLogout.style.background = "#c9302c"));
    btnLogout.addEventListener("mouseout", () => (btnLogout.style.background = "#d9534f"));
  }
});
