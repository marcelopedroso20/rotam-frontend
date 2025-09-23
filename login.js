const API_URL = "https://rotam-backend-production.up.railway.app";

// Captura o evento de envio do formulário de login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert(data.error || "Usuário ou senha inválidos");
      return;
    }

    // 👉 Aqui salva o token no navegador
    localStorage.setItem("token", data.token);

    // Redireciona para tela principal
    window.location.href = "index.html";
  } catch (err) {
    console.error("Erro no login", err);
    alert("Erro no servidor. Tente novamente mais tarde.");
  }
});
