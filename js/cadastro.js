// js/cadastro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const agente = document.getElementById("agente")?.value?.trim();
    const comunicante = document.getElementById("comunicante")?.value?.trim();
    const local = document.getElementById("local")?.value?.trim();
    const tipo = document.getElementById("tipo")?.value;
    const descricao = document.getElementById("descricao")?.value?.trim();
    if (!agente || !comunicante || !local || !descricao) return alert("Preencha todos os campos obrigatórios!");
    const payload = {
      titulo: `${tipo || "Ocorrência"} - ${local}`,
      descricao,
      data: new Date().toISOString(),
      local,
      equipe_id: null,
      equipe_nome: agente,
      status: "Em andamento",
      observacoes: `Comunicante: ${comunicante}`,
      registrado_por: localStorage.getItem("usuario") || "anônimo"
    };
    try {
      const resp = await fetch(`${CONFIG.API_BASE}/occurrences`, { method:'POST', headers: CONFIG.authHeaders(), body: JSON.stringify(payload) });
      if (!resp.ok) throw 0;
      alert("✅ Ocorrência registrada!");
      form.reset();
    } catch { alert("❌ Erro ao registrar ocorrência."); }
  });
});
