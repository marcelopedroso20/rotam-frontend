// ===============================
// 🗺️ ROTAM - Mapa da Força (com autenticação JWT)
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() > payload.exp * 1000) {
      alert("Sessão expirada. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }
  } catch {
    alert("Token inválido. Faça login novamente.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return;
  }

  try {
    // 🔹 Busca os dados do efetivo no backend
    const res = await fetch(`${CONFIG.API_BASE}/efetivo`, {
      headers: CONFIG.authHeaders(),
    });

    if (!res.ok) throw new Error(`Erro ${res.status}`);

    const data = await res.json();
    console.log("📡 Dados do Mapa da Força:", data);

    // 🔹 Contagem por setor
    const comando = data.filter(e => e.setor?.toLowerCase().includes("comando")).length;
    const adm = data.filter(e => e.setor?.toLowerCase().includes("adm") || e.setor?.toLowerCase().includes("admin")).length;
    const oper = data.filter(e => e.setor?.toLowerCase().includes("oper") || e.setor?.toLowerCase().includes("rotam")).length;

    // 🔹 Atualiza os cards do mapa
    document.getElementById("cardComando").textContent = comando;
    document.getElementById("cardAdm").textContent = adm;
    document.getElementById("cardOper").textContent = oper;

  } catch (err) {
    console.error("⚠️ Erro ao carregar o mapa:", err);
    alert("Erro ao carregar dados do Mapa da Força. Veja o console para detalhes.");
  }
});
