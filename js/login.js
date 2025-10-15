// ===============================
// 🔐 Login ROTAM - Versão aprimorada
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const errorMsg = document.getElementById("errorMsg");
  const submitBtn = form ? form.querySelector("button[type='submit']") : null;

  const API_URL = "https://rotam-backend-production.up.railway.app/api/auth/login";

  if (!form) {
    console.error("⚠️ Formulário de login não encontrado no DOM.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("⚠️ Informe usuário e senha.");
      return;
    }

    try {
      if (submitBtn) submitBtn.disabled = true;
      showError("⏳ Conectando ao servidor...");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showError(`❌ Erro: ${data.error || response.statusText}`);
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      if (data.success) {
        showError("✅ Login realizado com sucesso!");
        localStorage.setItem("token", data.token);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      } else {
        showError("❌ Usuário ou senha inválidos.");
        if (submitBtn) submitBtn.disabled = false;
      }

    } catch (err) {
      console.error("Erro de conexão:", err);
      showError("🚨 Erro ao conectar com o servidor.");
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  function showError(message) {
    if (!errorMsg) return;
    errorMsg.style.display = "block";
    errorMsg.textContent = message;
  }
});
