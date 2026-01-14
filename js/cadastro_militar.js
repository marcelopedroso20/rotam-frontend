// ===============================
// 🪖 ROTAM - Cadastro de Efetivo (v2.3.5 - TEMPORÁRIA)
// ⚠️ Versão que funciona SEM o campo nome_completo no banco
// ✅ Use esta versão até atualizar o backend e banco
// ===============================

const UI = { form: null, fields: {}, tableBody: null, btnSalvar: null, btnCancelar: null, preview: null };
let EDIT_ID = null;

// ===============================
// 🔐 Verifica Token JWT antes de tudo
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

  // 🌐 Inicialização
  UI.form = document.getElementById("form-efetivo");
  UI.tableBody = document.querySelector("#tabela-efetivo tbody");
  UI.btnSalvar = document.getElementById("btn-salvar");
  UI.btnCancelar = document.getElementById("btn-cancelar");
  UI.preview = document.getElementById("foto-preview");

  // ⚠️ REMOVIDO nome_completo temporariamente
  ["nome", "patente", "funcao", "setor", "turno", "viatura", "placa", "status", "latitude", "longitude", "foto"]
    .forEach(id => UI.fields[id] = document.getElementById(id));

  if (UI.form) UI.form.addEventListener("submit", onSubmit);
  if (UI.btnCancelar) UI.btnCancelar.addEventListener("click", resetForm);

  if (UI.fields.foto && UI.preview) {
    UI.fields.foto.addEventListener("change", async () => {
      const f = UI.fields.foto.files?.[0];
      if (!f) { UI.preview.style.display = "none"; return; }
      const b64 = await toBase64(f);
      UI.preview.src = b64;
      UI.preview.style.display = "block";
    });
  }

  preencherGPS();
  await carregarLista();
});

// ===============================
// 📸 Converte arquivo para Base64
// ===============================
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

// ===============================
// 🌍 Preenche campos GPS
// ===============================
function preencherGPS() {
  if (!("geolocation" in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      if (UI.fields.latitude) UI.fields.latitude.value = latitude.toFixed(6);
      if (UI.fields.longitude) UI.fields.longitude.value = longitude.toFixed(6);
    },
    err => console.warn("GPS indisponível:", err?.message),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
}

// ===============================
// 📋 Renderiza tabela de efetivo
// ⚠️ SEM coluna nome_completo
// ===============================
function renderLista(lista) {
  if (!UI.tableBody) return;
  UI.tableBody.innerHTML = (lista && lista.length)
    ? lista.map(i => `
      <tr>
        <td>${i.id}</td>
        <td>${i.nome || "-"}</td>
        <td>${i.patente || "-"}</td>
        <td>${i.funcao || "-"}</td>
        <td>${i.setor || "-"}</td>
        <td>${i.turno || "-"}</td>
        <td>${i.viatura || "-"}</td>
        <td>${i.status || "-"}</td>
        <td>${i.latitude && i.longitude ? `${i.latitude}, ${i.longitude}` : "-"}</td>
        <td>
          <button class="btn btn-sm btn-primary" data-edit="${i.id}">✏️ Editar</button>
          <button class="btn btn-sm btn-danger" data-del="${i.id}">🗑️ Excluir</button>
        </td>
      </tr>`).join("")
    : `<tr><td colspan="10" class="text-center">Sem registros.</td></tr>`;

  UI.tableBody.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => carregarParaEdicao(Number(b.dataset.edit)));
  UI.tableBody.querySelectorAll("[data-del]").forEach(b => b.onclick = () => deletarRegistro(Number(b.dataset.del)));
}

// ===============================
// 📦 Carrega lista completa
// ===============================
async function carregarLista() {
  try {
    const r = await fetch(`${CONFIG.API_BASE}/efetivo`, { headers: CONFIG.authHeaders() });
    if (r.status === 401) throw new Error("Sessão expirada");
    const data = await r.json();
    console.log("✅ Dados recebidos:", data); // Debug
    renderLista(data);
  } catch (e) {
    console.error("❌ Erro ao carregar lista:", e);
    renderLista([]);
  }
}

// ===============================
// ✏️ Editar registro
// ===============================
async function carregarParaEdicao(id) {
  try {
    const r = await fetch(`${CONFIG.API_BASE}/efetivo`, { headers: CONFIG.authHeaders() });
    const data = await r.json();
    const it = data.find(x => x.id === id);
    if (!it) return;
    EDIT_ID = id;

    // ⚠️ SEM nome_completo
    for (const k of ["nome", "patente", "funcao", "setor", "turno", "viatura", "placa", "status", "latitude", "longitude"])
      if (UI.fields[k]) UI.fields[k].value = it[k] ?? "";

    if (it.foto && UI.preview) {
      UI.preview.src = it.foto;
      UI.preview.style.display = "block";
    }

    UI.btnSalvar.textContent = "Atualizar";
    UI.btnCancelar.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) { console.error(e); }
}

// ===============================
// 🗑️ Excluir registro
// ===============================
async function deletarRegistro(id) {
  if (!confirm("Confirma excluir este registro?")) return;
  try {
    const r = await fetch(`${CONFIG.API_BASE}/efetivo/${id}`, { method: "DELETE", headers: CONFIG.authHeaders() });
    if (!r.ok) throw 0;
    alert("✅ Registro excluído com sucesso!");
    await carregarLista();
  } catch {
    alert("❌ Erro ao excluir registro.");
  }
}

// ===============================
// 🧹 Resetar formulário
// ===============================
function resetForm() {
  EDIT_ID = null;
  if (UI.form) UI.form.reset();
  if (UI.preview) { UI.preview.src = ""; UI.preview.style.display = "none"; }
  UI.btnSalvar.textContent = "Salvar";
  UI.btnCancelar.style.display = "none";
  preencherGPS();
}

// ===============================
// 💾 Salvar ou atualizar
// ✅ CORRIGIDO: Trata campos numéricos vazios como null
// ===============================
async function onSubmit(e) {
  e.preventDefault();

  const payload = {};
  
  // Campos de texto
  for (const k of ["nome", "patente", "funcao", "setor", "turno", "viatura", "placa", "status"]) {
    payload[k] = UI.fields[k]?.value?.trim() || "";
  }

  // ✅ CORRIGIDO: Campos numéricos devem ser null se vazios
  payload.latitude = UI.fields.latitude?.value?.trim() || null;
  payload.longitude = UI.fields.longitude?.value?.trim() || null;

  // Converte para número se houver valor
  if (payload.latitude) payload.latitude = parseFloat(payload.latitude);
  if (payload.longitude) payload.longitude = parseFloat(payload.longitude);

  if (UI.fields.foto?.files?.[0]) {
    try {
      payload.foto = await toBase64(UI.fields.foto.files[0]);
    } catch {
      payload.foto = "";
    }
  }

  console.log("📤 Enviando payload:", payload);

  const url = EDIT_ID ? `${CONFIG.API_BASE}/efetivo/${EDIT_ID}` : `${CONFIG.API_BASE}/efetivo`;
  const method = EDIT_ID ? "PUT" : "POST";

  try {
    const r = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(payload)
    });

    const text = await r.text();
    console.log("📥 Resposta:", text);

    if (!r.ok) throw new Error(`Erro ${r.status}: ${text}`);

    resetForm();
    await carregarLista();
    alert("✅ Registro salvo com sucesso!");
  } catch (e) {
    console.error("❌ Erro ao salvar:", e);
    alert("❌ Erro ao salvar registro. Veja o console para detalhes.");
  }
}
