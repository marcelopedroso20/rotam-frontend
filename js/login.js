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

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch(CONFIG.ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        // 🔑 Salva token e usuário
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", username);

        // ✅ Redireciona para o painel
        window.location.href = "index.html";
      } else {
        if (errorMsg) {
          errorMsg.style.display = "block";
          errorMsg.textContent =
            data.error || "Usuário ou senha incorretos.";
        }
      }
    } catch (err) {
      console.error("Erro no login:", err);
      if (errorMsg) {
        errorMsg.style.display = "block";
        errorMsg.textContent = "❌ Erro ao conectar com o servidor.";
      }
    }
  });
});
