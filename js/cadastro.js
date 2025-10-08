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

    // 🔒 Validação básica
    if (!agente || !comunicante || !local || !descricao) {
      alert("⚠️ Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // 🗂️ Criação da estrutura de ocorrência
    const dataHora = new Date();
    const dataStr = dataHora.toLocaleDateString("pt-BR");
    const horaStr = dataHora.toLocaleTimeString("pt-BR");

    const ocorrencia = {
      agente,
      comunicante,
      local,
      tipo,
      descricao,
      data: dataStr,
      hora: horaStr,
      criadoEm: dataHora.toISOString()
    };

    // 📦 Salvar localmente no mesmo LocalStorage usado pelo histórico RT90
    const dados = JSON.parse(localStorage.getItem("ocorrenciasROTAM")) || [];
    dados.push(ocorrencia);
    localStorage.setItem("ocorrenciasROTAM", JSON.stringify(dados));

    // 🔗 Adicionar também no histórico principal (usado pelo Livro RT90)
    const historico = JSON.parse(localStorage.getItem("rotam_historico_rt90")) || [];
    historico.push({
      numero: historico.length + 1,
      data: dataStr,
      hora: horaStr,
      nomeArquivo: `Ocorrência - ${local}`
    });
    localStorage.setItem("rotam_historico_rt90", JSON.stringify(historico));

    // ✅ Confirmação e reset
    alert("✅ Ocorrência salva com sucesso no histórico ROTAM!");
    form.reset();
  });
});
