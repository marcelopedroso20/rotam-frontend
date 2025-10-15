// ===============================
// 🔐 Login ROTAM - v2 Aprimorado
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const btn = form.querySelector("button[type='submit']");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("⚠️ Informe usuário e senha.");
      return;
    }

    btn.disabled = true;
    btn.innerText = "⏳ Conectando...";

    try {
      const res = await fetch(`${CONFIG.API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: username, senha: password }),
      });

      if (res.status === 404) {
        showError("❌ Rota de login não encontrada (404).");
      } else if (res.status === 401) {
        showError("🔒 Usuário ou senha incorretos.");
      } else if (res.status === 500) {
        showError("💥 Erro interno no servidor. Tente novamente.");
      } else if (!res.ok) {
        showError(`⚠️ Erro inesperado (${res.status}).`);
      } else {
        const data = await res.json();
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "index.html";
        } else {
          showError("⚠️ Resposta inválida do servidor.");
        }
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      showError("🌐 Servidor indisponível. Verifique sua conexão.");
    } finally {
      btn.disabled = false;
      btn.innerText = "Entrar";
    }
  });

  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = "block";
      errorMsg.style.background = "#fee";
      errorMsg.style.color = "#b00";
      errorMsg.style.padding = "6px 10px";
      errorMsg.style.borderRadius = "6px";
      errorMsg.style.marginTop = "10px";
      errorMsg.style.textAlign = "center";
      errorMsg.style.fontWeight = "500";
    } else {
      alert(msg);
    }
  }
});
