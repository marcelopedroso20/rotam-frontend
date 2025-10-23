// ===============================
// 🚓 ROTAM - Controle de Sessão JWT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userInfo = document.getElementById("userInfo");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!token) {
    alert("Sessão expirada ou não autenticada. Faça login novamente.");
    return (window.location.href = "login.html");
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    if (Date.now() > exp) {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      return (window.location.href = "login.html");
    }
    if (userInfo)
      userInfo.innerHTML = `👮 Usuário: <b>${payload.usuario}</b> | Perfil: <b>${payload.role || "N/A"}</b>`;
  } catch (err) {
    console.error("Erro ao decodificar token:", err);
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }

  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      alert("Você saiu do sistema.");
      window.location.href = "login.html";
    });
});
