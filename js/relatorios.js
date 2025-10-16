// ===============================
// 📊 ROTAM - Relatórios de Ocorrências (versão aprimorada)
// Protegido com verificação JWT automática
// ===============================

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Sessão expirada ou não autenticada. Faça login novamente.");
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

  const form = document.getElementById("filtroForm");
  const tbody = document.querySelector("#tabelaOcorrencias tbody");
  const erro = document.getElementById("erroMsg");

  async function carregar(di, df) {
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/occurrences`, { headers: CONFIG.authHeaders() });
      if (resp.status === 401) throw new Error("Sessão expirada");
      const dados = await resp.json();

      let filtrados = dados;
      if (di) filtrados = filtrados.filter(o => new Date(o.data) >= new Date(di));
      if (df) filtrados = filtrados.filter(o => new Date(o.data) <= new Date(df + "T23:59:59"));

      tbody.innerHTML = filtrados.length ? filtrados.map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${o.equipe_nome || "-"}</td>
          <td>${(o.observacoes || "").replace("Comunicante: ", "")}</td>
          <td>${o.local || "-"}</td>
          <td>${(o.titulo || "-").split(" - ")[0]}</td>
          <td>${o.descricao || "-"}</td>
          <td>${o.status || "-"}</td>
          <td>${o.data ? new Date(o.data).toLocaleString("pt-BR") : "-"}</td>
        </tr>`).join("") : '<tr><td colspan="8" class="text-center">Sem dados.</td></tr>';

      erro.style.display = "none";
    } catch (e) {
      console.error("Erro ao carregar relatórios:", e);
      erro.style.display = "block";
      erro.textContent = "❌ Erro ao carregar dados do servidor.";
    }
  }

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const di = document.getElementById("dataInicio")?.value;
      const df = document.getElementById("dataFim")?.value;
      carregar(di, df);
    });
  }

  await carregar();
});
