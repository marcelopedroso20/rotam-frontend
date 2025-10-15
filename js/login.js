// ===============================
// 🔐 Login ROTAM - Corrigido e aprimorado
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const submitBtn = document.getElementById("loginButton");

  const API_URL = "https://rotam-backend-production.up.railway.app/api/auth/login";

  if (!form) {
    console.error("⚠️ Formulário não encontrado no DOM.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("⚠️ Usuário e senha obrigatórios.");
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      showError("⏳ Conectando ao servidor...");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: username, senha: password })
      });

      const data = await res.json();

      if (!res.ok) {
        showError(`❌ Erro: ${data.error || res.statusText}`);
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      if (data.success) {
        showError("✅ Login realizado com sucesso!");
        localStorage.setItem("token", data.token);
        setTimeout(() => (window.location.href = "index.html"), 1200);
      } else {
        showError("❌ Usuário ou senha incorretos.");
        if (submitBtn) submitBtn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      showError("🚨 Erro de conexão com o servidor.");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function showError(msg) {
    if (errorMsg) {
      errorMsg.style.display = "block";
      errorMsg.textContent = msg;
    }
  }
});
