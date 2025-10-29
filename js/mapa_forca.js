// ===============================
// 🗺️ Mapa da Força ROTAM (v2.0)
// ===============================

const API_URL = `${CONFIG.API_BASE}/mapa`;
const token = localStorage.getItem("token");

// Exibe alerta flutuante
function showAlert(tipo, msg) {
  const el = tipo === "sucesso" ? document.getElementById("alertaSucesso") : document.getElementById("alertaErro");
  el.textContent = msg;
  el.style.display = "block";
  setTimeout(() => (el.style.display = "none"), 4000);
}

// 🔹 Carrega o mapa da força (por data e turno)
async function carregarMapa() {
  const data = document.getElementById("dataEscala").value;
  const turno = document.getElementById("turnoEscala").value;

  if (!data || !turno) return;

  try {
    const res = await fetch(`${API_URL}?data=${data}&turno=${turno}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Erro ao carregar o mapa da força");

    const dados = await res.json();
    renderizarMapa(dados);
  } catch (err) {
    console.error("Erro:", err);
    showAlert("erro", "❌ Falha ao carregar mapa da força.");
  }
}

// 🔹 Renderiza os setores e postos
async function renderizarMapa(dados) {
  const container = document.getElementById("setoresContainer");
  container.innerHTML = "";

  // Agrupa por setor
  const setores = {};
  dados.forEach(p => {
    if (!setores[p.setor]) setores[p.setor] = [];
    setores[p.setor].push(p);
  });

  // Busca militares disponíveis
  const militaresRes = await fetch(`${CONFIG.API_BASE}/efetivo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const militares = await militaresRes.json();

  Object.keys(setores).forEach(setor => {
    const col = document.createElement("div");
    col.classList.add("col-md-4");

    const card = document.createElement("div");
    card.classList.add("card", "border-dark", "shadow-sm");

    const header = document.createElement("div");
    header.classList.add("card-header", "bg-dark", "text-white", "fw-bold", "text-center");
    header.textContent = setor;

    const body = document.createElement("div");
    body.classList.add("card-body");

    setores[setor].forEach(posto => {
      const div = document.createElement("div");
      div.classList.add("mb-3", "text-start");

      const label = document.createElement("label");
      label.classList.add("fw-bold");
      label.textContent = posto.nome_posto;

      const select = document.createElement("select");
      select.classList.add("form-select", "form-select-sm", "mt-1");
      select.dataset.postoId = posto.posto_id;

      const optionVazia = document.createElement("option");
      optionVazia.value = "";
      optionVazia.textContent = "-- Selecionar Militar --";
      select.appendChild(optionVazia);

      militares.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id;
        opt.textContent = `${m.patente} ${m.nome}`;
        if (posto.efetivo_id === m.id) opt.selected = true;
        select.appendChild(opt);
      });

      div.appendChild(label);
      div.appendChild(select);
      body.appendChild(div);
    });

    card.appendChild(header);
    card.appendChild(body);
    col.appendChild(card);
    container.appendChild(col);
  });
}

// 🔹 Salva escala no banco
async function salvarMapa() {
  try {
    const data = document.getElementById("dataEscala").value;
    const turno = document.getElementById("turnoEscala").value;

    if (!data || !turno) {
      showAlert("erro", "⚠️ Informe a data e o turno.");
      return;
    }

    const selects = document.querySelectorAll("select[data-posto-id]");
    const alocacoes = Array.from(selects)
      .filter(sel => sel.value)
      .map(sel => ({
        posto_id: parseInt(sel.dataset.postoId),
        efetivo_id: parseInt(sel.value),
      }));

    const res = await fetch(`${API_URL}/salvar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data, turno, alocacoes }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Erro ao salvar escala.");

    showAlert("sucesso", "✅ Escala salva com sucesso!");
    carregarMapa(); // Atualiza logo após salvar
  } catch (err) {
    console.error("Erro ao salvar:", err);
    showAlert("erro", "❌ Falha ao salvar escala.");
  }
}

// 🔹 Inicializa com data de hoje
document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataEscala").value = hoje;
  carregarMapa();
});
