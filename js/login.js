// ===============================
// 📌 Login ROTAM
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const errorMsg = document.getElementById("errorMsg");

  if (!form) {
    console.error("⚠ loginForm não encontrado no DOM.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();

    try {
      // ✅ Envia dados para o backend ajustado
      const res = await fetch(
        "https://rotam-backend-production.up.railway.app/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario, senha }),
        }
      );

      const data = await res.json();

      // 🔍 Verifica resposta
      if (res.ok && data.success) {
        // 🔑 Salva informações básicas (sem token ainda)
        localStorage.setItem("usuario", data.usuario);
        localStorage.setItem("logado", "true");

        // ✅ Redireciona para o painel principal
        window.location.href = "index.html";
      } else {
        if (errorMsg) {
          errorMsg.style.display = "block";
          errorMsg.textContent = data.error || "Usuário ou senha incorretos.";
        }
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      if (errorMsg) {
        errorMsg.style.display = "block";
        errorMsg.textContent = "Erro ao conectar com o servidor.";
      }
    }
  });
});
