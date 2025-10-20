// ===============================
// 🔐 Login ROTAM - Versão Final Aprimorada (2025)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  if (!form) {
    console.error("⚠️ loginForm não encontrado no DOM.");
    return;
  }

  const button = form.querySelector("button");

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
      const res = await fetch("https://rotam-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await res.json();

      // Verifica se o servidor respondeu corretamente
      if (!res.ok) {
        console.warn("⚠️ Resposta do servidor:", data);
        if (res.status === 401) return showError("Usuário ou senha inválidos.");
        if (res.status === 500) return showError("Erro interno no servidor.");
        return showError(data.error || "Falha desconhecida ao fazer login.");
      }

      // Se o login for bem-sucedido
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);

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
      console.error("❌ Erro ao conectar:", err);
      showError("Falha na conexão com o servidor.");
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Entrar";
      }, 1000);
    }
  });

  // Função para exibir mensagens de erro de forma elegante
  function showError(msg) {
    errorMsg.textContent = `❌ ${msg}`;
    errorMsg.style.display = "block";
    errorMsg.style.background = "#f8d7da";
    errorMsg.style.color = "#842029";
    errorMsg.style.padding = "8px";
    errorMsg.style.borderRadius = "6px";
    errorMsg.style.marginTop = "10px";
  }
});
