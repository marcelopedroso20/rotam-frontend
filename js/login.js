// ===============================
// 🔐 Login ROTAM - Versão Render Estável (2025)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  if (!form) {
    console.error("⚠️ loginForm não encontrado no DOM.");
    return;
  }

  const button = form.querySelector("button");

  // ===============================
  // 🌍 Detecta ambiente automaticamente
  // ===============================
  const API_URL = window.location.hostname.includes("github.io")
    ? "https://rotam-backend.onrender.com" // 🔹 Produção (Render)
    : "http://localhost:3000";              // 🔹 Desenvolvimento local

  // ===============================
  // 🚀 Evento de envio do formulário
  // ===============================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("username").value.trim();
    const senha = document.getElementById("password").value.trim();

    if (!usuario || !senha) {
      return showError("Usuário e senha obrigatórios.");
    }

    button.disabled = true;
    button.textContent = "🔄 Entrando...";
    errorMsg.style.display = "none";

    try {
      // ===============================
      // 🔐 Envio da requisição de login
      // ===============================
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      // ===============================
      // 📦 Tratamento da resposta
      // ===============================
      const data = await res.json().catch(() => ({})); // evita erro se resposta for vazia

      if (!res.ok) {
        console.warn("⚠️ Resposta do servidor:", data);
        if (res.status === 401) return showError("Usuário ou senha inválidos.");
        if (res.status === 404) return showError("Rota não encontrada no servidor.");
        if (res.status === 500) return showError("Erro interno no servidor.");
        return showError(data.error || `Falha desconhecida (${res.status}).`);
      }

      // ===============================
      // ✅ Login bem-sucedido
      // ===============================
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", usuario);

        button.textContent = "✅ Login realizado!";
        button.style.backgroundColor = "#28a745";

        // Redireciona para o painel principal
        setTimeout(() => {
          window.location.href = "index.html";
        }, 800);
      } else {
        showError(data.error || "Usuário ou senha inválidos.");
      }
    } catch (err) {
      console.error("❌ Erro de conexão:", err);
      showError("Falha na conexão com o servidor. Verifique sua internet ou tente novamente.");
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Entrar";
      }, 1000);
    }
  });

  // ===============================
  // ⚠️ Função elegante para exibir erros
  // ===============================
  function showError(msg) {
    errorMsg.textContent = `❌ ${msg}`;
    errorMsg.style.display = "block";
    errorMsg.style.background = "#f8d7da";
    errorMsg.style.color = "#842029";
    errorMsg.style.padding = "8px";
    errorMsg.style.borderRadius = "6px";
    errorMsg.style.marginTop = "10px";
    errorMsg.style.fontWeight = "500";
  }
});
