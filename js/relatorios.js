// js/relatorios.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("filtroForm");
  const tbody = document.querySelector("#tabelaOcorrencias tbody");
  const erro = document.getElementById("erroMsg");
  async function carregar(di, df){
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/occurrences`, { headers: CONFIG.authHeaders() });
      if (!resp.ok) throw 0;
      let dados = await resp.json();
      if (di) dados = dados.filter(o => new Date(o.data) >= new Date(di));
      if (df) dados = dados.filter(o => new Date(o.data) <= new Date(df + "T23:59:59"));
      tbody.innerHTML = dados.length ? dados.map(o => `
        <tr>
          <td>${o.id}</td><td>${o.equipe_nome||"-"}</td><td>${(o.observacoes||"").replace("Comunicante: ","")}</td>
          <td>${o.local||"-"}</td><td>${(o.titulo||"-").split(" - ")[0]}</td>
          <td>${o.descricao||"-"}</td><td>${o.status||"-"}</td>
          <td>${o.data ? new Date(o.data).toLocaleString("pt-BR") : "-"}</td>
        </tr>`).join("") : '<tr><td colspan="8" class="text-center">Sem dados.</td></tr>';
      erro.style.display = "none";
    } catch { erro.style.display = "block"; }
  }
  if (form){ form.addEventListener("submit", e => { e.preventDefault(); carregar(document.getElementById("dataInicio")?.value, document.getElementById("dataFim")?.value); }); }
  carregar();
});
