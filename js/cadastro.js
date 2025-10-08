// js/cadastro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const agente = document.getElementById("agente").value.trim();
    const comunicante = document.getElementById("comunicante").value.trim();
    const local = document.getElementById("local").value.trim();
    const tipo = document.getElementById("tipo").value;
    const descricao = document.getElementById("descricao").value.trim();

    if (!agente || !comunicante || !local || !descricao) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    const ocorrencia = {
      agente,
      comunicante,
      local,
      tipo,
      descricao,
      data: new Date().toLocaleString()
    };

    // Salvar localmente no navegador (IndexedDB ou LocalStorage)
    const dados = JSON.parse(localStorage.getItem("ocorrenciasROTAM")) || [];
    dados.push(ocorrencia);
    localStorage.setItem("ocorrenciasROTAM", JSON.stringify(dados));

    alert("✅ Ocorrência salva com sucesso!");
    form.reset();
  });
});
