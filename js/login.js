// ===============================
// 🔐 Login ROTAM (Versão aprimorada)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const button = form.querySelector("button");

  if (!form) return console.error("⚠️ loginForm não encontrado no DOM.");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("username").value.trim();
    const senha = document.getElementById("password").value.trim();

    if (!usuario || !senha) {
      showError("Usuário e senha obrigatórios");
      return;
    }

    try {
      button.disabled = true;
      button.textContent = "🔄 Entrando...";
      errorMsg.textContent = "";

      const res = await fetch("https://rotam-backend-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Erro interno no servidor");
        return;
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        button.textContent = "✅ Sucesso!";
        setTimeout(() => (window.location.href = "index.html"), 1000);
      } else {
        showError(data.error || "Usuário ou senha inválidos");
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      showError("Falha ao conectar ao servidor");
    } finally {
      button.disabled = false;
      button.textContent = "Entrar";
    }
  });

  function showError(msg) {
    errorMsg.textContent = `❌ ${msg}`;
    errorMsg.style.display = "block";
  }
});
