// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const usuario = document.getElementById("username")?.value?.trim();
    const senha = document.getElementById("password")?.value?.trim();
    if (!usuario || !senha) {
      if (errorMsg) { errorMsg.style.display='block'; errorMsg.textContent='Preencha usuário e senha.'; }
      return;
    }
    try {
      const res = await fetch(`${CONFIG.API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", usuario);
        location.href = "index.html";
      } else {
        if (errorMsg) { errorMsg.style.display='block'; errorMsg.textContent = data.error || 'Usuário ou senha inválidos.'; }
      }
    } catch (e) {
      console.error(e);
      if (errorMsg) { errorMsg.style.display='block'; errorMsg.textContent='Erro ao conectar com o servidor.'; }
    }
  });
});
