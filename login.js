const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("https://rotam-backend-production.up.railway.app/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      // Salva sessão no localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redireciona para o sistema
      window.location.href = "index.html";
    } else {
      errorMsg.textContent = data.error || "Usuário ou senha inválidos.";
    }
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Erro de conexão com o servidor.";
  }
});
