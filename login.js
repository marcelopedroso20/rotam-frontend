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

    if (res.ok && data.success) {
      // Salva login no navegador
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("loggedIn", "true");

      // Redireciona
      window.location.href = "index.html";
    } else {
      document.getElementById("errorMsg").style.display = "block";
      document.getElementById("errorMsg").textContent = data.error || "Usuário ou senha incorretos.";
    }
  } catch (err) {
    document.getElementById("errorMsg").style.display = "block";
    document.getElementById("errorMsg").textContent = "Erro ao conectar com o servidor.";
  }
});
