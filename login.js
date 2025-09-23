document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://rotam-backend-production.up.railway.app/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success && data.token) {
      // Salva token no navegador
      localStorage.setItem("token", data.token);
      window.location.href = "index.html"; // Redireciona para a tela principal
    } else {
      alert("Usuário ou senha inválidos!");
    }
  } catch (err) {
    console.error("Erro no login:", err);
    alert("Erro de conexão com o servidor.");
  }
});
