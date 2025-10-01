// login.js

// Usa a URL centralizada do config.js
const backendUrl = CONFIG.ENDPOINTS.login;

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
      localStorage.setItem("loggedIn", "true");    // flag de sessão

      // ✅ Redireciona para o painel
      window.location.href = "index.html";
    } else {
      const msgBox = document.getElementById("errorMsg");
      if (msgBox) {
        msgBox.style.display = "block";
        msgBox.textContent = data.error || "Usuário ou senha incorretos.";
      } else {
        alert(data.error || "Usuário ou senha incorretos.");
      }
    }
  } catch (err) {
    console.error("Erro no login:", err);
    const msgBox = document.getElementById("errorMsg");
    if (msgBox) {
      msgBox.style.display = "block";
      msgBox.textContent = "❌ Erro ao conectar com o servidor.";
    } else {
      alert("❌ Erro ao conectar com o servidor.");
    }
  }
});
