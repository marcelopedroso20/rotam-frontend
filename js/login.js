const backendUrl = "https://rotam-backend-production.up.railway.app/auth/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // 🔑 Salva no navegador
      localStorage.setItem("token", data.token);   // token JWT
      localStorage.setItem("user", username);      // salva apenas o nome do usuário

      // ✅ Redireciona para o painel
      window.location.href = "index.html";
    } else {
      document.getElementById("errorMsg").style.display = "block";
      document.getElementById("errorMsg").textContent =
        data.error || "Usuário ou senha incorretos.";
    }
  } catch (err) {
    console.error("Erro no login:", err);
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("errorMsg").textContent =
      "❌ Erro ao conectar com o servidor.";
  }
});
