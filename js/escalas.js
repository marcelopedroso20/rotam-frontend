// ===============================
// 📅 ROTAM - Gerador de Escalas (v2.0)
// ===============================

let militares = [];
let escalaAtual = null;
let escalaEditando = null;
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
    // Se está editando E mudou a data → criar nova escala
    if (escalaEditando && escalaEditando.data !== data) {
      const confirma = confirm("A data foi alterada. Deseja criar uma NOVA escala com esta data?");
      if (!confirma) return;
      escalaEditando = null; // Força criação de nova
    }

    const metodo = escalaEditando ? 'PUT' : 'POST';
    const url = escalaEditando 
      ? `${CONFIG.API_BASE}/escalas/${escalaEditando.id}`
      : `${CONFIG.API_BASE}/escalas`;

    const resp = await fetch(url, {
      method: metodo,
      headers: CONFIG.authHeaders(),
      body: JSON.stringify(payload)
    });

    const result = await resp.json();

    if (!resp.ok) {
      throw new Error(result.error || "Erro ao salvar escala");
    }

    const msg = escalaEditando ? "✅ Escala atualizada com sucesso!" : "✅ Escala salva com sucesso!";
    alert(msg);
    
    limparFormulario();
    escalaEditando = null;
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
          <button class="btn btn-sm btn-info" onclick="visualizarEscala(${e.id})" title="Visualizar">👁️</button>
          <button class="btn btn-sm btn-primary" onclick="editarEscala(${e.id})" title="Editar">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="excluirEscala(${e.id})" title="Excluir">🗑️</button>
        </td>
      </tr>
    `).join('');

  } catch (e) {
    console.error("Erro ao carregar escalas:", e);
  }
}

// ===============================
// 👁️ Visualizar escala COMPLETA
// ===============================
async function visualizarEscala(id) {
  try {
    const resp = await fetch(`${CONFIG.API_BASE}/escalas/${id}`, {
      headers: CONFIG.authHeaders()
    });

    if (!resp.ok) throw new Error("Erro ao carregar escala");

    const escala = await resp.json();
    
    // Monta HTML completo
    let html = `
      <div style="max-height: 70vh; overflow-y: auto; padding: 20px;">
        <h5>📅 Escala de ${new Date(escala.data).toLocaleDateString('pt-BR')} - ${escala.turno}</h5>
        <hr>
        
        <h6 class="text-primary mt-3">🚔 Serviço Operacional</h6>
        <ul>
          <li><strong>Comandante:</strong> ${escala.comandante_nome ? `${escala.comandante_patente} ${escala.comandante_nome}` : '-'}</li>
          <li><strong>Fiscal de Dia:</strong> ${escala.fiscal_nome ? `${escala.fiscal_patente} ${escala.fiscal_nome}` : '-'}</li>
          <li><strong>Adjunto de Dia:</strong> ${escala.adjunto_nome ? `${escala.adjunto_patente} ${escala.adjunto_nome}` : '-'}</li>
          <li><strong>Chefe da ALI:</strong> ${escala.chefe_ali_nome ? `${escala.chefe_ali_patente} ${escala.chefe_ali_nome}` : '-'}</li>
        </ul>
    `;

    // Guarda do Batalhão
    const guarda = escala.alocacoes.filter(a => a.tipo_alocacao === 'guarda');
    if (guarda.length > 0) {
      html += `
        <h6 class="text-warning mt-3">🏢 Guarda do Batalhão (${guarda.length})</h6>
        <ul>
          ${guarda.map(g => `<li>${g.patente} ${g.nome}</li>`).join('')}
        </ul>
      `;
    }

    // ROTAM 90
    const rotam90 = escala.alocacoes.filter(a => a.tipo_alocacao === 'viatura' && a.viatura === 'ROTAM-90');
    if (rotam90.length > 0) {
      html += `
        <h6 class="text-success mt-3">🚓 ROTAM 90 (${rotam90.length})</h6>
        <ul>
          ${rotam90.map(v => `<li><strong>${v.posicao}:</strong> ${v.patente} ${v.nome}</li>`).join('')}
        </ul>
      `;
    }

    // ROTAM 02
    const rotam02 = escala.alocacoes.filter(a => a.tipo_alocacao === 'viatura' && a.viatura === 'ROTAM-02');
    if (rotam02.length > 0) {
      html += `
        <h6 class="text-success mt-3">🚓 ROTAM 02 (${rotam02.length})</h6>
        <ul>
          ${rotam02.map(v => `<li><strong>${v.posicao}:</strong> ${v.patente} ${v.nome}</li>`).join('')}
        </ul>
      `;
    }

    html += `
        <hr>
        <p><strong>Total de militares alocados:</strong> ${escala.alocacoes.length}</p>
        ${escala.observacoes ? `<p><strong>Observações:</strong> ${escala.observacoes}</p>` : ''}
      </div>
    `;

    // Cria modal Bootstrap
    const modal = `
      <div class="modal fade" id="modalVisualizacao" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content bg-dark text-light">
            <div class="modal-header">
              <h5 class="modal-title">👁️ Visualização Completa da Escala</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">${html}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove modal antigo se existir
    const oldModal = document.getElementById('modalVisualizacao');
    if (oldModal) oldModal.remove();

    // Adiciona novo modal
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Exibe modal
    const modalEl = new bootstrap.Modal(document.getElementById('modalVisualizacao'));
    modalEl.show();

  } catch (e) {
    console.error("Erro ao visualizar escala:", e);
    alert("Erro ao carregar detalhes da escala");
  }
}

// ===============================
// ✏️ Editar escala
// ===============================
async function editarEscala(id) {
  try {
    const resp = await fetch(`${CONFIG.API_BASE}/escalas/${id}`, {
      headers: CONFIG.authHeaders()
    });

    if (!resp.ok) throw new Error("Erro ao carregar escala");

    const escala = await resp.json();
    escalaEditando = escala;

    // Preenche formulário
    document.getElementById("data-escala").value = escala.data;
    document.getElementById("turno-escala").value = escala.turno;
    document.getElementById("obs-escala").value = escala.observacoes || '';
    document.getElementById("comandante-dia").value = escala.comandante_dia || '';
    document.getElementById("fiscal-dia").value = escala.fiscal_dia || '';
    document.getElementById("adjunto-dia").value = escala.adjunto_dia || '';
    document.getElementById("chefe-ali").value = escala.chefe_ali || '';

    // Limpa containers
    document.getElementById("guarda-container").innerHTML = '';
    document.getElementById("rotam90-container").innerHTML = '';
    document.getElementById("rotam02-container").innerHTML = '';

    // Preenche guarda
    escala.alocacoes.filter(a => a.tipo_alocacao === 'guarda').forEach(() => {
      adicionarGuarda();
    });
    escala.alocacoes.filter(a => a.tipo_alocacao === 'guarda').forEach((aloc, i) => {
      const select = document.querySelectorAll('.guarda-item select')[i];
      if (select) select.value = aloc.efetivo_id;
    });

    // Preenche ROTAM 90
    escala.alocacoes.filter(a => a.viatura === 'ROTAM-90').forEach(() => {
      adicionarViatura('ROTAM-90');
    });
    escala.alocacoes.filter(a => a.viatura === 'ROTAM-90').forEach((aloc, i) => {
      const selects = document.querySelectorAll('[data-viatura="ROTAM-90"]');
      if (selects[i]) selects[i].value = aloc.efetivo_id;
    });

    // Preenche ROTAM 02
    escala.alocacoes.filter(a => a.viatura === 'ROTAM-02').forEach(() => {
      adicionarViatura('ROTAM-02');
    });
    escala.alocacoes.filter(a => a.viatura === 'ROTAM-02').forEach((aloc, i) => {
      const selects = document.querySelectorAll('[data-viatura="ROTAM-02"]');
      if (selects[i]) selects[i].value = aloc.efetivo_id;
    });

    // Muda para aba de nova escala
    document.getElementById("nova-tab").click();

    alert("✏️ Escala carregada para edição!\n\n💡 Se você mudar a DATA, será criada uma NOVA escala.");

  } catch (e) {
    console.error("Erro ao editar escala:", e);
    alert("Erro ao carregar escala para edição");
  }
}

// ===============================
// 🗑️ Excluir escala
// ===============================
async function excluirEscala(id) {
  if (!confirm("⚠️ Confirma exclusão desta escala?")) return;

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
  escalaEditando = null;
}

// ===============================
// 📄 Gerar PDF da Escala - PÁGINA 1 COMPLETA
// ===============================
async function gerarPDF() {
  // Valida se tem dados preenchidos
  const data = document.getElementById("data-escala").value;
  if (!data) {
    return alert("⚠️ Preencha a data da escala antes de gerar o PDF!");
  }

  // Coleta dados do formulário
  const turno = document.getElementById("turno-escala").value;
  const observacoes = document.getElementById("obs-escala").value;

  // Comandantes
  const comandante_id = document.getElementById("comandante-dia").value;
  const fiscal_id = document.getElementById("fiscal-dia").value;
  const adjunto_id = document.getElementById("adjunto-dia").value;
  const chefe_ali_id = document.getElementById("chefe-ali").value;

  // Busca dados completos dos militares
  const getMilitar = (id) => militares.find(m => m.id == id);

  const comandante = getMilitar(comandante_id);
  const fiscal = getMilitar(fiscal_id);
  const adjunto = getMilitar(adjunto_id);
  const chefe_ali = getMilitar(chefe_ali_id);

  // Coleta Guarda do Batalhão
  const guarda = [];
  document.querySelectorAll('.guarda-item select').forEach(select => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m) guarda.push(m);
    }
  });

  // Coleta ROTAM 90
  const rotam90 = [];
  document.querySelectorAll('[data-viatura="ROTAM-90"]').forEach((select, idx) => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m) rotam90.push({ posicao: `${idx + 1}ºH`, militar: m });
    }
  });

  // Coleta ROTAM 02
  const rotam02 = [];
  document.querySelectorAll('[data-viatura="ROTAM-02"]').forEach((select, idx) => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m) rotam02.push({ posicao: `${idx + 1}ºH`, militar: m });
    }
  });

  // Formata data
  const dataObj = new Date(data + "T12:00:00");
  const diaSemana = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"][dataObj.getDay()];
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();

  // Gera PDF
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurações
    let y = 10;
    const marginLeft = 15;
    const marginRight = 15;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // ========== LOGOS ROTAM (simuladas com retângulos) ==========
    // Logo esquerda
    doc.setDrawColor(0);
    doc.setFillColor(200, 200, 200);
    doc.rect(marginLeft, y, 30, 30, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ROTAM', marginLeft + 15, y + 15, { align: 'center' });
    
    // Logo direita
    doc.rect(pageWidth - marginRight - 30, y, 30, 30, 'FD');
    doc.text('ROTAM', pageWidth - marginRight - 15, y + 15, { align: 'center' });
    
    y += 35;

    // ========== CABEÇALHO ==========
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    doc.text(`ESCALA DE ${dataFormatada.split(' ')[0]} DE ${dataFormatada.split(' ')[2]} DE ${dataFormatada.split(' ')[4]} (${diaSemana})`, pageWidth / 2, y, { align: 'center' });
    y += 6;

    doc.setFontSize(9);
    doc.text('ESTADO DE MATO GROSSO', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('POLÍCIA MILITAR', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('COMANDO ESPECIALIZADO', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text('BATALHÃO ROTAM', pageWidth / 2, y, { align: 'center' });
    y += 4;
    doc.text(`CUIABÁ - MT, ${dataFormatada}.`, pageWidth / 2, y, { align: 'center' });
    y += 8;

    // Título da seção (verde)
    doc.setFillColor(0, 128, 0);
    doc.rect(marginLeft, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCALA DE SERVIÇO DIÁRIO', pageWidth / 2, y + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    // ========== TABELA DE COMANDANTES ==========
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    
    // Linha 1: Comandante do Batalhão
    doc.setDrawColor(0);
    doc.rect(marginLeft, y, contentWidth * 0.5, 6);
    doc.rect(marginLeft + contentWidth * 0.5, y, contentWidth * 0.5, 6);
    doc.text('COMANDANTE DO BATALHÃO ROTAM', marginLeft + 2, y + 4);
    doc.setFont('helvetica', 'normal');
    if (comandante) {
      doc.text(`${comandante.patente} ${comandante.nome} ${comandante.rgpm ? 'RGPMMT ' + comandante.rgpm : ''}`, marginLeft + contentWidth * 0.5 + 2, y + 4);
    }
    y += 6;

    // Linha 2: Comandante Adjunto
    doc.setFont('helvetica', 'bold');
    doc.rect(marginLeft, y, contentWidth * 0.5, 6);
    doc.rect(marginLeft + contentWidth * 0.5, y, contentWidth * 0.5, 6);
    doc.text('COMANDANTE ADJUNTO DO BATALHÃO ROTAM', marginLeft + 2, y + 4);
    doc.setFont('helvetica', 'normal');
    if (fiscal) {
      doc.text(`${fiscal.patente} ${fiscal.nome} ${fiscal.rgpm ? 'RGPMMT ' + fiscal.rgpm : ''}`, marginLeft + contentWidth * 0.5 + 2, y + 4);
    }
    y += 6;

    // Linha 3: Chefe da ALI
    doc.setFont('helvetica', 'bold');
    doc.rect(marginLeft, y, contentWidth * 0.5, 6);
    doc.rect(marginLeft + contentWidth * 0.5, y, contentWidth * 0.5, 6);
    doc.text('CHEFE DA ALI', marginLeft + 2, y + 4);
    doc.setFont('helvetica', 'normal');
    if (chefe_ali) {
      doc.text(`${chefe_ali.patente} ${chefe_ali.nome} ${chefe_ali.rgpm ? 'RGPMMT ' + chefe_ali.rgpm : ''}`, marginLeft + contentWidth * 0.5 + 2, y + 4);
    }
    y += 6;

    // ========== SERVIÇO OPERACIONAL (azul) ==========
    doc.setFillColor(0, 100, 255);
    doc.rect(marginLeft, y, contentWidth, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇO OPERACIONAL', pageWidth / 2, y + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    doc.setFontSize(8);

    // ROTAM Comando - 3 colunas
    if (fiscal) {
      doc.setFont('helvetica', 'bold');
      doc.rect(marginLeft, y, contentWidth * 0.4, 6);
      doc.rect(marginLeft + contentWidth * 0.4, y, contentWidth * 0.4, 6);
      doc.rect(marginLeft + contentWidth * 0.8, y, contentWidth * 0.2, 6);
      doc.text('ROTAM COMANDO (FISCAL DE DIA)', marginLeft + 2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`${fiscal.patente} ${fiscal.nome} ${fiscal.rgpm ? 'RGPMMT ' + fiscal.rgpm : ''}`, marginLeft + contentWidth * 0.4 + 2, y + 4);
      doc.text('07H00 AS 07H00 – 24H', marginLeft + contentWidth * 0.8 + 2, y + 4);
      y += 6;
    }

    // ROTAM 90 (Adjunto)
    if (adjunto) {
      doc.setFont('helvetica', 'bold');
      doc.rect(marginLeft, y, contentWidth * 0.4, 6);
      doc.rect(marginLeft + contentWidth * 0.4, y, contentWidth * 0.4, 6);
      doc.rect(marginLeft + contentWidth * 0.8, y, contentWidth * 0.2, 6);
      doc.text('ROTAM NOVENTA (ADJUNTO DE DIA)', marginLeft + 2, y + 4);
      doc.setFont('helvetica', 'normal');
      doc.text(`${adjunto.patente} ${adjunto.nome} ${adjunto.rgpm ? 'RGPMMT ' + adjunto.rgpm : ''}`, marginLeft + contentWidth * 0.4 + 2, y + 4);
      doc.text('07H00 AS 07H00 – 24H', marginLeft + contentWidth * 0.8 + 2, y + 4);
      y += 6;
    }

    // ========== GUARDA DO BATALHÃO ==========
    if (guarda.length > 0) {
      // Cabeçalho da seção
      const guardaHeight = guarda.length * 4 + 2;
      doc.setFont('helvetica', 'bold');
      doc.rect(marginLeft, y, contentWidth * 0.4, guardaHeight);
      doc.rect(marginLeft + contentWidth * 0.4, y, contentWidth * 0.4, guardaHeight);
      doc.rect(marginLeft + contentWidth * 0.8, y, contentWidth * 0.2, guardaHeight);
      doc.text('GUARDA DO BATALHÃO', marginLeft + 2, y + 4);
      
      // Lista de militares
      doc.setFont('helvetica', 'normal');
      let guardaY = y + 4;
      guarda.forEach((m, idx) => {
        const texto = `${m.patente} ${m.nome} ${m.rgpm ? '- RGPMMT ' + m.rgpm : ''}`;
        if (texto.includes('ESTÁGIO')) {
          doc.text(`${m.patente} ${m.nome} - RGPMMT ${m.rgpm} (ESTÁGIO NIVEL I)`, marginLeft + contentWidth * 0.4 + 2, guardaY);
        } else {
          doc.text(`${m.patente} ${m.nome}`, marginLeft + contentWidth * 0.4 + 2, guardaY);
          if (m.rgpm) doc.text(`RGPMMT ${m.rgpm}`, marginLeft + contentWidth * 0.4 + 50, guardaY);
        }
        guardaY += 4;
      });
      
      // Horário (última linha)
      doc.text('07H00 AS 07H00 – 24H', marginLeft + contentWidth * 0.8 + 2, y + guardaHeight - 2);
      y += guardaHeight;
    }

    // ========== AUXILIAR OPERACIONAL ==========
    const auxiliares = [];
    document.querySelectorAll('.viatura-item select').forEach(select => {
      if (select.value) {
        const m = getMilitar(select.value);
        if (m && !auxiliares.find(a => a.id === m.id)) {
          auxiliares.push(m);
        }
      }
    });

    if (auxiliares.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('AUXILIAR OPERACIONAL', marginLeft, y);
      y += 5;
      doc.setFont('helvetica', 'normal');

      auxiliares.slice(0, 3).forEach(m => {
        doc.text(`${m.patente} ${m.nome}`, marginLeft + 5, y);
        if (m.rgpm) doc.text(`RGPMMT ${m.rgpm}`, marginLeft + 85, y);
        doc.text('07H00 AS 07H00 – 24H', marginLeft + 140, y);
        y += 4;
      });
      y += 5;
    }

    // ========== 1º PELOTÃO ==========
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('1º PELOTÃO – SERVIÇO DIÁRIO – EQUIPE ROTAM – SERVIÇO DAS 07H00MIN AS 07H00MIN – 24H', pageWidth / 2, y, { align: 'center' });
    y += 8;

    // ROTAM 90
    if (rotam90.length > 0) {
      doc.setFillColor(0, 150, 255);
      doc.rect(marginLeft + 20, y, contentWidth - 40, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('VTR', marginLeft + 25, y + 3.5);
      doc.text('ROTAM 90 – VTR A DEFINIR', marginLeft + 40, y + 3.5);
      doc.setTextColor(0, 0, 0);
      y += 7;

      rotam90.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.posicao, marginLeft + 25, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.militar.patente} ${item.militar.nome}`, marginLeft + 35, y);
        if (item.militar.rgpm) doc.text(`RGPMMT ${item.militar.rgpm}`, marginLeft + 100, y);
        y += 4;
      });
      y += 5;
    }

    // ROTAM 02
    if (rotam02.length > 0) {
      doc.setFillColor(0, 150, 255);
      doc.rect(marginLeft + 20, y, contentWidth - 40, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text('VTR', marginLeft + 25, y + 3.5);
      doc.text('ROTAM 02 – VTR A DEFINIR', marginLeft + 40, y + 3.5);
      doc.setTextColor(0, 0, 0);
      y += 7;

      rotam02.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.text(item.posicao, marginLeft + 25, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.militar.patente} ${item.militar.nome}`, marginLeft + 35, y);
        if (item.militar.rgpm) doc.text(`RGPMMT ${item.militar.rgpm}`, marginLeft + 100, y);
        y += 4;
      });
    }

    // Observações
    if (observacoes) {
      y += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', marginLeft, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.text(observacoes, marginLeft + 5, y);
    }

    // ========== RODAPÉ ==========
    const rodapeY = pageHeight - 30; // 30mm do final da página
    
    // Texto do local e data
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
    doc.text(`QUARTEL DA ROTAM EM CUIABÁ – MT, ${dataAtual.split(' ')[0]} DE ${dataAtual.split(' ')[2]} DE ${dataAtual.split(' ')[4]}.`, pageWidth / 2, rodapeY, { align: 'center' });
    
    // Linha de assinatura
    doc.setLineWidth(0.3);
    doc.line(pageWidth / 2 - 50, rodapeY + 15, pageWidth / 2 + 50, rodapeY + 15);
    
    // Nome do comandante adjunto (quem assina)
    doc.setFont('helvetica', 'bold');
    if (fiscal) {
      doc.text(`${fiscal.patente} ${fiscal.nome}`, pageWidth / 2, rodapeY + 19, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('COMANDANTE ADJUNTO DO BATALHÃO ROTAM', pageWidth / 2, rodapeY + 23, { align: 'center' });
      if (fiscal.rgpm) {
        doc.text(`RGPMMT ${fiscal.rgpm}`, pageWidth / 2, rodapeY + 27, { align: 'center' });
      }
    }

    // Salva PDF
    const nomeArquivo = `ESCALA_ROTAM_${data.replace(/-/g, '_')}_${turno}.pdf`;
    doc.save(nomeArquivo);

    alert("✅ PDF gerado com sucesso!");

  } catch (e) {
    console.error("❌ Erro ao gerar PDF:", e);
    alert(`Erro ao gerar PDF: ${e.message}\n\nVerifique se a biblioteca jsPDF está carregada.`);
  }
}
