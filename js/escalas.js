// ===============================
// 📅 ROTAM - Gerador de Escalas (v1.0)
// ===============================

let militares = [];
let escalaAtual = null;
let contadorGuarda = 0;
let contadorRotam90 = 0;
let contadorRotam02 = 0;

// ===============================
// 🌐 Inicialização
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  // Verifica autenticação
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login.html";
    return;
  }

  // Define data padrão como hoje
  document.getElementById("data-escala").valueAsDate = new Date();

  // Carrega militares
  await carregarMilitares();

  // Carrega escalas existentes
  await carregarListaEscalas();

  // Event listener para submit
  document.getElementById("form-escala").addEventListener("submit", salvarEscala);
});

// ===============================
// 👥 Carrega lista de militares
// ===============================
async function carregarMilitares() {
  try {
    const resp = await fetch(`${CONFIG.API_BASE}/efetivo`, {
      headers: CONFIG.authHeaders()
    });

    if (!resp.ok) throw new Error("Erro ao carregar militares");

    militares = await resp.json();
    
    // Ordena por patente e nome
    militares.sort((a, b) => {
      if (a.patente !== b.patente) return a.patente.localeCompare(b.patente);
      return a.nome.localeCompare(b.nome);
    });

    // Preenche todos os selects
    preencherSelects();
    
    console.log(`✅ ${militares.length} militares carregados`);
  } catch (e) {
    console.error("Erro ao carregar militares:", e);
    alert("Erro ao carregar lista de militares");
  }
}

// ===============================
// 📋 Preenche selects com militares
// ===============================
function preencherSelects() {
  const selects = document.querySelectorAll(".militar-select");
  
  selects.forEach(select => {
    select.innerHTML = '<option value="">-- Selecionar --</option>';
    
    militares.forEach(m => {
      const option = document.createElement("option");
      option.value = m.id;
      option.textContent = `${m.patente} ${m.nome}`;
      select.appendChild(option);
    });
  });
}

// ===============================
// ➕ Adiciona militar na guarda
// ===============================
function adicionarGuarda() {
  contadorGuarda++;
  const container = document.getElementById("guarda-container");
  
  const div = document.createElement("div");
  div.className = "row g-2 mb-2 guarda-item";
  div.dataset.id = contadorGuarda;
  div.innerHTML = `
    <div class="col-md-10">
      <select class="form-select militar-select" data-tipo="guarda" data-pos="${contadorGuarda}">
        <option value="">-- Selecionar Militar --</option>
        ${militares.map(m => `<option value="${m.id}">${m.patente} ${m.nome}</option>`).join('')}
      </select>
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-danger w-100" onclick="removerItem(this, 'guarda')">
        🗑️
      </button>
    </div>
  `;
  
  container.appendChild(div);
}

// ===============================
// ➕ Adiciona militar em viatura
// ===============================
function adicionarViatura(viatura) {
  const containerId = viatura === 'ROTAM-90' ? 'rotam90-container' : 'rotam02-container';
  const container = document.getElementById(containerId);
  
  let contador;
  if (viatura === 'ROTAM-90') {
    contadorRotam90++;
    contador = contadorRotam90;
  } else {
    contadorRotam02++;
    contador = contadorRotam02;
  }
  
  const div = document.createElement("div");
  div.className = "row g-2 mb-2 viatura-item";
  div.dataset.viatura = viatura;
  div.dataset.id = contador;
  div.innerHTML = `
    <div class="col-md-2">
      <input type="text" class="form-control" value="${contador}ºH" readonly>
    </div>
    <div class="col-md-8">
      <select class="form-select militar-select" data-tipo="viatura" data-viatura="${viatura}" data-pos="${contador}">
        <option value="">-- Selecionar Militar --</option>
        ${militares.map(m => `<option value="${m.id}">${m.patente} ${m.nome}</option>`).join('')}
      </select>
    </div>
    <div class="col-md-2">
      <button type="button" class="btn btn-danger w-100" onclick="removerItem(this, 'viatura')">
        🗑️
      </button>
    </div>
  `;
  
  container.appendChild(div);
}

// ===============================
// 🗑️ Remove item
// ===============================
function removerItem(btn, tipo) {
  const item = btn.closest(`.${tipo}-item`);
  item.remove();
}

// ===============================
// 💾 Salva escala
// ===============================
async function salvarEscala(e) {
  e.preventDefault();

  const data = document.getElementById("data-escala").value;
  const turno = document.getElementById("turno-escala").value;
  const observacoes = document.getElementById("obs-escala").value;

  if (!data) {
    return alert("⚠️ Data é obrigatória!");
  }

  // Coleta dados principais
  const payload = {
    data,
    turno,
    observacoes,
    comandante_dia: document.getElementById("comandante-dia").value || null,
    fiscal_dia: document.getElementById("fiscal-dia").value || null,
    adjunto_dia: document.getElementById("adjunto-dia").value || null,
    chefe_ali: document.getElementById("chefe-ali").value || null,
    alocacoes: []
  };

  // Coleta guarda
  document.querySelectorAll('.guarda-item select').forEach(select => {
    if (select.value) {
      payload.alocacoes.push({
        efetivo_id: parseInt(select.value),
        tipo_alocacao: 'guarda',
        horario_inicio: '07:00',
        horario_fim: '07:00'
      });
    }
  });

  // Coleta viaturas
  document.querySelectorAll('.viatura-item select').forEach(select => {
    if (select.value) {
      const viatura = select.dataset.viatura;
      const posicao = `${select.dataset.pos}ºH`;
      
      payload.alocacoes.push({
        efetivo_id: parseInt(select.value),
        tipo_alocacao: 'viatura',
        viatura,
        posicao,
        horario_inicio: '07:00',
        horario_fim: '07:00'
      });
    }
  });

  console.log("📤 Enviando escala:", payload);

  try {
    const resp = await fetch(`${CONFIG.API_BASE}/escalas`, {
      method: 'POST',
      headers: CONFIG.authHeaders(),
      body: JSON.stringify(payload)
    });

    const result = await resp.json();

    if (!resp.ok) {
      throw new Error(result.error || "Erro ao salvar escala");
    }

    alert("✅ Escala salva com sucesso!");
    limparFormulario();
    await carregarListaEscalas();

    // Muda para aba de lista
    document.getElementById("lista-tab").click();

  } catch (e) {
    console.error("❌ Erro ao salvar escala:", e);
    alert(`Erro ao salvar escala: ${e.message}`);
  }
}

// ===============================
// 📋 Carrega lista de escalas
// ===============================
async function carregarListaEscalas() {
  try {
    const resp = await fetch(`${CONFIG.API_BASE}/escalas`, {
      headers: CONFIG.authHeaders()
    });

    if (!resp.ok) throw new Error("Erro ao carregar escalas");

    const escalas = await resp.json();
    const tbody = document.getElementById("lista-escalas");

    if (escalas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma escala criada ainda</td></tr>';
      return;
    }

    tbody.innerHTML = escalas.map(e => `
      <tr>
        <td>${new Date(e.data).toLocaleDateString('pt-BR')}</td>
        <td>${e.turno}</td>
        <td>${e.fiscal_nome ? `${e.fiscal_patente} ${e.fiscal_nome}` : '-'}</td>
        <td>${e.adjunto_nome ? `${e.adjunto_patente} ${e.adjunto_nome}` : '-'}</td>
        <td>${e.criado_por || '-'}</td>
        <td>
          <button class="btn btn-sm btn-info" onclick="visualizarEscala(${e.id})">👁️</button>
          <button class="btn btn-sm btn-primary" onclick="editarEscala(${e.id})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="excluirEscala(${e.id})">🗑️</button>
        </td>
      </tr>
    `).join('');

  } catch (e) {
    console.error("Erro ao carregar escalas:", e);
  }
}

// ===============================
// 👁️ Visualizar escala
// ===============================
async function visualizarEscala(id) {
  try {
    const resp = await fetch(`${CONFIG.API_BASE}/escalas/${id}`, {
      headers: CONFIG.authHeaders()
    });

    if (!resp.ok) throw new Error("Erro ao carregar escala");

    const escala = await resp.json();
    
    // Exibe modal com detalhes (simplificado)
    let html = `
      <strong>Data:</strong> ${new Date(escala.data).toLocaleDateString('pt-BR')}<br>
      <strong>Turno:</strong> ${escala.turno}<br><br>
      <strong>Fiscal de Dia:</strong> ${escala.fiscal_nome ? `${escala.fiscal_patente} ${escala.fiscal_nome}` : '-'}<br>
      <strong>Adjunto:</strong> ${escala.adjunto_nome ? `${escala.adjunto_patente} ${escala.adjunto_nome}` : '-'}<br><br>
      <strong>Total de militares alocados:</strong> ${escala.alocacoes.length}
    `;

    alert(html);

  } catch (e) {
    console.error("Erro ao visualizar escala:", e);
    alert("Erro ao carregar detalhes da escala");
  }
}

// ===============================
// ✏️ Editar escala (placeholder)
// ===============================
function editarEscala(id) {
  alert("Função de edição em desenvolvimento");
}

// ===============================
// 🗑️ Excluir escala
// ===============================
async function excluirEscala(id) {
  if (!confirm("Confirma exclusão desta escala?")) return;

  try {
    const resp = await fetch(`${CONFIG.API_BASE}/escalas/${id}`, {
      method: 'DELETE',
      headers: CONFIG.authHeaders()
    });

    if (!resp.ok) throw new Error("Erro ao excluir escala");

    alert("✅ Escala excluída com sucesso!");
    await carregarListaEscalas();

  } catch (e) {
    console.error("Erro ao excluir escala:", e);
    alert("Erro ao excluir escala");
  }
}

// ===============================
// 🧹 Limpa formulário
// ===============================
function limparFormulario() {
  document.getElementById("form-escala").reset();
  document.getElementById("data-escala").valueAsDate = new Date();
  document.getElementById("guarda-container").innerHTML = '';
  document.getElementById("rotam90-container").innerHTML = '';
  document.getElementById("rotam02-container").innerHTML = '';
  
  contadorGuarda = 0;
  contadorRotam90 = 0;
  contadorRotam02 = 0;
}

// ===============================
// 📄 Gerar PDF (placeholder)
// ===============================
function gerarPDF() {
  alert("Geração de PDF em desenvolvimento.\nUse a função de salvar primeiro, depois poderemos gerar o PDF.");
}
