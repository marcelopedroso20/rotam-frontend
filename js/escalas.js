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
// 📄 Gerar PDF da Escala - VERSÃO DEFINITIVA COM TABELAS
// ===============================
// ===============================
// 📄 Gerar PDF Completo - 4 PÁGINAS
// ===============================
async function gerarPDF() {
  const data = document.getElementById("data-escala").value;
  if (!data) {
    return alert("⚠️ Preencha a data da escala antes de gerar o PDF!");
  }

  const turno = document.getElementById("turno-escala").value;
  const observacoes = document.getElementById("obs-escala").value;
  const assinante_id = document.getElementById("assinante-doc").value;

  const comandante_id = document.getElementById("comandante-dia").value;
  const fiscal_id = document.getElementById("fiscal-dia").value;
  const adjunto_id = document.getElementById("adjunto-dia").value;
  const chefe_ali_id = document.getElementById("chefe-ali").value;

  const getMilitar = (id) => militares.find(m => m.id == id);

  const comandante = getMilitar(comandante_id);
  const fiscal = getMilitar(fiscal_id);
  const adjunto = getMilitar(adjunto_id);
  const chefe_ali = getMilitar(chefe_ali_id);
  
  // Assinante: usa o selecionado ou fiscal como padrão
  const assinante = assinante_id ? getMilitar(assinante_id) : fiscal;

  const guarda = [];
  document.querySelectorAll('.guarda-item select').forEach(select => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m) guarda.push(m);
    }
  });

  const rotam90 = [];
  document.querySelectorAll('[data-viatura="ROTAM-90"]').forEach((select, idx) => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m) rotam90.push({ posicao: `${idx + 1}ºH`, militar: m });
    }
  });

  const rotam02 = [];
  document.querySelectorAll('[data-viatura="ROTAM-02"]').forEach((select, idx) => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m) rotam02.push({ posicao: `${idx + 1}ºH`, militar: m });
    }
  });

  const auxiliares = [];
  document.querySelectorAll('.viatura-item select').forEach(select => {
    if (select.value) {
      const m = getMilitar(select.value);
      if (m && !auxiliares.find(a => a.id === m.id)) {
        auxiliares.push(m);
      }
    }
  });

  const dataObj = new Date(data + "T12:00:00");
  const diaSemana = ["DOMINGO", "SEGUNDA-FEIRA", "TERÇA-FEIRA", "QUARTA-FEIRA", "QUINTA-FEIRA", "SEXTA-FEIRA", "SÁBADO"][dataObj.getDay()];
  const meses = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];
  const dia = dataObj.getDate();
  const mes = meses[dataObj.getMonth()];
  const ano = dataObj.getFullYear();

  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const ml = 15; // margin left
    const mr = 15; // margin right
    const mt = 10; // margin top
    const pw = 210; // page width
    const ph = 297; // page height
    const cw = pw - ml - mr; // content width

    // ========================================
    // PÁGINA 1: SERVIÇO OPERACIONAL
    // ========================================
    let y = mt;

    // Função para adicionar cabeçalho com logos
    const addHeader = (pageNum) => {
      let hy = mt;
      
      // Logos
      const logoUrl = 'https://marcelopedroso20.github.io/rotam-frontend/assets/logo-rotam.png';
      try {
        doc.addImage(logoUrl, 'PNG', ml, hy, 35, 35);
        doc.addImage(logoUrl, 'PNG', pw - mr - 35, hy, 35, 35);
      } catch (e) {
        doc.setFillColor(240, 240, 240);
        doc.rect(ml, hy, 35, 35, 'F');
        doc.rect(pw - mr - 35, hy, 35, 35, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ROTAM', ml + 17.5, hy + 18, { align: 'center' });
        doc.text('ROTAM', pw - mr - 17.5, hy + 18, { align: 'center' });
      }
      
      hy += 40;

      // Título da página
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`ESCALA DE ${dia} DE ${mes} DE ${ano} (${diaSemana})`, pw / 2, hy, { align: 'center' });
      hy += 6;

      if (pageNum === 1) {
        doc.setFontSize(9);
        doc.text('ESTADO DE MATO GROSSO', pw / 2, hy, { align: 'center' });
        hy += 4;
        doc.text('POLÍCIA MILITAR', pw / 2, hy, { align: 'center' });
        hy += 4;
        doc.text('COMANDO ESPECIALIZADO', pw / 2, hy, { align: 'center' });
        hy += 4;
        doc.text('BATALHÃO ROTAM', pw / 2, hy, { align: 'center' });
        hy += 4;
        doc.text(`CUIABÁ - MT, ${dia} DE ${mes} DE ${ano}.`, pw / 2, hy, { align: 'center' });
        hy += 8;
      }

      return hy;
    };

    y = addHeader(1);

    // Título Verde
    doc.setFillColor(0, 128, 0);
    doc.rect(ml, y, cw, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('ESCALA DE SERVIÇO DIÁRIO', pw / 2, y + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    // Funções auxiliares para tabelas
    doc.setFontSize(8);
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);

    const drawTableRow = (label, value, height = 6) => {
      doc.setFont('helvetica', 'bold');
      doc.rect(ml, y, cw * 0.45, height);
      doc.text(label, ml + 2, y + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.rect(ml + cw * 0.45, y, cw * 0.55, height);
      if (value) doc.text(value, ml + cw * 0.45 + 2, y + 4);
      
      y += height;
    };

    const drawTableRow3Col = (col1, col2, col3, height = 6) => {
      doc.setFont('helvetica', 'bold');
      doc.rect(ml, y, cw * 0.35, height);
      doc.text(col1, ml + 2, y + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.rect(ml + cw * 0.35, y, cw * 0.45, height);
      if (col2) doc.text(col2, ml + cw * 0.35 + 2, y + 4);
      
      doc.rect(ml + cw * 0.8, y, cw * 0.2, height);
      if (col3) doc.text(col3, ml + cw * 0.8 + 2, y + 4);
      
      y += height;
    };

    // Comandantes
    drawTableRow('COMANDANTE DO BATALHÃO ROTAM', 
      comandante ? `${comandante.patente} ${comandante.nome} ${comandante.rgpm ? 'RGPMMT ' + comandante.rgpm : ''}` : '');
    
    drawTableRow('COMANDANTE ADJUNTO DO BATALHÃO ROTAM',
      fiscal ? `${fiscal.patente} ${fiscal.nome} ${fiscal.rgpm ? 'RGPMMT ' + fiscal.rgpm : ''}` : '');
    
    drawTableRow('CHEFE DA ALI',
      chefe_ali ? `${chefe_ali.patente} ${chefe_ali.nome} ${chefe_ali.rgpm ? 'RGPMMT ' + chefe_ali.rgpm : ''}` : '');

    // Título Azul
    doc.setFillColor(0, 100, 255);
    doc.rect(ml, y, cw, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇO OPERACIONAL', pw / 2, y + 4, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 6;

    if (fiscal) {
      drawTableRow3Col('ROTAM COMANDO (FISCAL DE DIA)',
        `${fiscal.patente} ${fiscal.nome} ${fiscal.rgpm ? 'RGPMMT ' + fiscal.rgpm : ''}`,
        '07H00 AS 07H00 – 24H');
    }

    if (adjunto) {
      drawTableRow3Col('ROTAM NOVENTA (ADJUNTO DE DIA)',
        `${adjunto.patente} ${adjunto.nome} ${adjunto.rgpm ? 'RGPMMT ' + adjunto.rgpm : ''}`,
        '07H00 AS 07H00 – 24H');
    }

    // Guarda do Batalhão
    if (guarda.length > 0) {
      const guardaHeight = guarda.length * 4 + 2;
      
      doc.setFont('helvetica', 'bold');
      doc.rect(ml, y, cw * 0.35, guardaHeight);
      doc.text('GUARDA DO BATALHÃO', ml + 2, y + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.rect(ml + cw * 0.35, y, cw * 0.45, guardaHeight);
      
      let gy = y + 4;
      guarda.forEach(m => {
        doc.text(`${m.patente} ${m.nome} ${m.rgpm ? '- RGPMMT ' + m.rgpm : ''}`, ml + cw * 0.35 + 2, gy);
        gy += 4;
      });
      
      doc.rect(ml + cw * 0.8, y, cw * 0.2, guardaHeight);
      doc.text('07H00 AS 07H00 – 24H', ml + cw * 0.8 + 2, y + guardaHeight - 2);
      
      y += guardaHeight;
    }

    // Auxiliar Operacional
    if (auxiliares.length > 0) {
      const auxHeight = auxiliares.length * 4 + 2;
      
      doc.setFont('helvetica', 'bold');
      doc.rect(ml, y, cw * 0.35, auxHeight);
      doc.text('AUXILIAR OPERACIONAL', ml + 2, y + 4);
      
      doc.setFont('helvetica', 'normal');
      doc.rect(ml + cw * 0.35, y, cw * 0.45, auxHeight);
      
      let ay = y + 4;
      auxiliares.forEach(m => {
        doc.text(`${m.patente} ${m.nome} ${m.rgpm ? 'RGPMMT ' + m.rgpm : ''}`, ml + cw * 0.35 + 2, ay);
        ay += 4;
      });
      
      doc.rect(ml + cw * 0.8, y, cw * 0.2, auxHeight);
      doc.text('07H00 AS 07H00 – 24H', ml + cw * 0.8 + 2, y + auxHeight - 2);
      
      y += auxHeight;
    }

    // 1º Pelotão
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('1º PELOTÃO – SERVIÇO DIÁRIO – EQUIPE ROTAM – SERVIÇO DAS 07H00MIN AS 07H00MIN – 24H', pw / 2, y, { align: 'center' });
    y += 7;

    doc.setFontSize(8);

    // ROTAM 90
    if (rotam90.length > 0) {
      doc.setFillColor(0, 150, 255);
      doc.rect(ml + 20, y, 30, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('VTR', ml + 23, y + 3.5);
      doc.setTextColor(0, 0, 0);
      doc.rect(ml + 50, y, cw - 50, 5);
      doc.setFont('helvetica', 'bold');
      doc.text('ROTAM 90 – VTR A DEFINIR', ml + 52, y + 3.5);
      y += 5;

      rotam90.forEach(item => {
        doc.rect(ml + 20, y, 30, 4);
        doc.setFont('helvetica', 'bold');
        doc.text(item.posicao, ml + 23, y + 3);
        
        doc.rect(ml + 50, y, cw - 50, 4);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.militar.patente} ${item.militar.nome} ${item.militar.rgpm ? 'RGPMMT ' + item.militar.rgpm : ''}`, ml + 52, y + 3);
        y += 4;
      });
      y += 3;
    }

    // ROTAM 02
    if (rotam02.length > 0) {
      doc.setFillColor(0, 150, 255);
      doc.rect(ml + 20, y, 30, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('VTR', ml + 23, y + 3.5);
      doc.setTextColor(0, 0, 0);
      doc.rect(ml + 50, y, cw - 50, 5);
      doc.setFont('helvetica', 'bold');
      doc.text('ROTAM 02 – VTR A DEFINIR', ml + 52, y + 3.5);
      y += 5;

      rotam02.forEach(item => {
        doc.rect(ml + 20, y, 30, 4);
        doc.setFont('helvetica', 'bold');
        doc.text(item.posicao, ml + 23, y + 3);
        
        doc.rect(ml + 50, y, cw - 50, 4);
        doc.setFont('helvetica', 'normal');
        doc.text(`${item.militar.patente} ${item.militar.nome} ${item.militar.rgpm ? 'RGPMMT ' + item.militar.rgpm : ''}`, ml + 52, y + 3);
        y += 4;
      });
    }

    // ========================================
    // PÁGINA 2: ATIVIDADES E EXPEDIENTE
    // ========================================
    doc.addPage();
    y = addHeader(2);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ATIVIDADES (DETERMINAÇÕES)', ml, y);
    y += 6;

    // Tabela de Atividades
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.rect(ml, y, cw * 0.25, 5);
    doc.text('EVENTO', ml + 2, y + 3.5);
    doc.rect(ml + cw * 0.25, y, cw * 0.25, 5);
    doc.text('LOCAL', ml + cw * 0.25 + 2, y + 3.5);
    doc.rect(ml + cw * 0.5, y, cw * 0.2, 5);
    doc.text('HORÁRIO', ml + cw * 0.5 + 2, y + 3.5);
    doc.rect(ml + cw * 0.7, y, cw * 0.3, 5);
    doc.text('POLICIAIS ESCALADOS', ml + cw * 0.7 + 2, y + 3.5);
    y += 5;

    // Atividades padrão
    const atividades = [
      { evento: 'EDUCAÇÃO FISICA MILITAR', local: 'ROTAM', horario: '07H00', policiais: 'EQUIPES DE SERVIÇO' },
      { evento: 'TAF - COR', local: '44º BIMTZ', horario: '07H00 AS 14H00', policiais: 'CONFORME PORTARIA DO ADF' }
    ];

    doc.setFont('helvetica', 'normal');
    atividades.forEach(atv => {
      doc.rect(ml, y, cw * 0.25, 5);
      doc.text(atv.evento, ml + 2, y + 3.5);
      doc.rect(ml + cw * 0.25, y, cw * 0.25, 5);
      doc.text(atv.local, ml + cw * 0.25 + 2, y + 3.5);
      doc.rect(ml + cw * 0.5, y, cw * 0.2, 5);
      doc.text(atv.horario, ml + cw * 0.5 + 2, y + 3.5);
      doc.rect(ml + cw * 0.7, y, cw * 0.3, 5);
      doc.text(atv.policiais, ml + cw * 0.7 + 2, y + 3.5);
      y += 5;
    });

    y += 5;

    // Expediente Administrativo
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('EXPEDIENTE ADMINISTRATIVO', ml, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('08H00 ÀS 12H00 E 14H00 ÀS 18H00', ml, y);
    y += 6;

    // Seções administrativas (dados padrão)
    const secoes = [
      { nome: 'SEÇÃO DE PESSOAL – P1', auxiliares: ['AUXILIAR'] },
      { nome: 'SEÇÃO DE PLANEJAMENTO E OPERAÇÕES – P3', auxiliares: ['AUXILIAR'] },
      { nome: 'SEÇÃO DE LOGÍSTICA E PATRIMÔNIO – P4', auxiliares: ['AUXILIAR'] },
      { nome: 'SEÇÃO DE MARKETING INSTITUCIONAL – P5', auxiliares: ['AUXILIAR'] },
      { nome: 'SEÇÃO DE JUSTIÇA E DISCIPLINA – SJD', auxiliares: ['GERENTE SUBALTERNO', 'AUXILIAR'] }
    ];

    doc.setFontSize(7);
    secoes.forEach(sec => {
      doc.setFont('helvetica', 'bold');
      doc.text(sec.nome, ml, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      sec.auxiliares.forEach(aux => {
        doc.text(aux, ml + 5, y);
        y += 3;
      });
      y += 2;
    });

    // ========================================
    // PÁGINA 3: FÉRIAS E APRESENTAÇÕES
    // ========================================
    doc.addPage();
    y = addHeader(3);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('FÉRIAS', ml, y);
    y += 5;

    // Tabela de Férias (exemplo com dados padrão)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('(Nenhum militar em férias neste período)', ml + 5, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('LP (LICENÇA PRÊMIO)', ml, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('(Nenhum militar em licença prêmio neste período)', ml + 5, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('LICENÇA PARA TRATAMENTO DE SAÚDE – LTS', ml, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.text('(Nenhum militar em LTS neste período)', ml + 5, y);
    y += 10;

    // Apresentações Judiciais
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('JUSTIÇA E DISCIPLINA', ml, y);
    y += 4;
    doc.text('RELAÇÃO DE POLICIAIS MILITARES PARA APRESENTAÇÃO', ml, y);
    y += 4;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('ENTRAR EM CONTATO COM A SEÇÃO DE PESSOAL ANTES DA DATA', ml, y);
    y += 6;

    // Cabeçalho da tabela de apresentações
    doc.setFont('helvetica', 'bold');
    doc.rect(ml, y, cw * 0.3, 5);
    doc.text('NOME', ml + 2, y + 3.5);
    doc.rect(ml + cw * 0.3, y, cw * 0.25, 5);
    doc.text('EVENTO', ml + cw * 0.3 + 2, y + 3.5);
    doc.rect(ml + cw * 0.55, y, cw * 0.25, 5);
    doc.text('LOCAL', ml + cw * 0.55 + 2, y + 3.5);
    doc.rect(ml + cw * 0.8, y, cw * 0.2, 5);
    doc.text('DATA/HORÁRIO', ml + cw * 0.8 + 2, y + 3.5);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.text('(Nenhuma apresentação judicial agendada)', ml + 5, y + 3);

    // ========================================
    // PÁGINA 4: CUSTODIADOS E ASSINATURA
    // ========================================
    doc.addPage();
    y = addHeader(4);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTODIADOS NESTA UPM', ml, y);
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('(Nenhum militar custodiado)', ml + 5, y);
    y += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MANUTENÇÃO DO BATALHÃO', ml, y);
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('08H00 AS 12H00 E DAS 14H00 AS 18H00', ml + 5, y);
    y += 4;
    doc.text('DISPOSIÇÃO DO GERENTE ADJUNTO DE MANUTENÇÃO', ml + 5, y);
    y += 4;
    doc.text('REFEIÇÕES (DESJEJUM, ALMOÇO E JANTAR)', ml + 5, y);

    // Rodapé com assinatura APENAS na página 4
    doc.setPage(4);
    const ry = ph - 30;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date();
    const diaAtual = dataAtual.getDate();
    const mesAtual = meses[dataAtual.getMonth()];
    const anoAtual = dataAtual.getFullYear();
    
    doc.text(`QUARTEL DA ROTAM EM CUIABÁ – MT, ${diaAtual} DE ${mesAtual} DE ${anoAtual}.`, pw / 2, ry, { align: 'center' });
    
    doc.setLineWidth(0.3);
    doc.line(pw / 2 - 50, ry + 15, pw / 2 + 50, ry + 15);
    
    doc.setFont('helvetica', 'bold');
    if (assinante) {
      doc.text(`${assinante.patente} ${assinante.nome}`, pw / 2, ry + 19, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.text('COMANDANTE ADJUNTO DO BATALHÃO ROTAM', pw / 2, ry + 23, { align: 'center' });
      if (assinante.rgpm) {
        doc.text(`RGPMMT ${assinante.rgpm}`, pw / 2, ry + 27, { align: 'center' });
      }
    }

    const nomeArquivo = `ESCALA_ROTAM_${data.replace(/-/g, '_')}_${turno}_4PAGINAS.pdf`;
    doc.save(nomeArquivo);

    alert("✅ PDF de 4 páginas gerado com sucesso!");

  } catch (e) {
    console.error("❌ Erro ao gerar PDF:", e);
    alert(`Erro ao gerar PDF: ${e.message}\n\nVerifique se a biblioteca jsPDF está carregada.`);
  }
}
