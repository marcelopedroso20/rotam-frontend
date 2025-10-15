// js/cadastro_militar.js
const UI = { form:null, fields:{}, tableBody:null, btnSalvar:null, btnCancelar:null, preview:null };
let EDIT_ID = null;

function toBase64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }

function preencherGPS(){
  if(!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    pos=>{ const {latitude,longitude}=pos.coords;
      if(UI.fields.latitude) UI.fields.latitude.value = latitude.toFixed(6);
      if(UI.fields.longitude) UI.fields.longitude.value = longitude.toFixed(6);
    },
    err=>console.warn('GPS indisponível:', err?.message),
    { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
  );
}

function renderLista(lista){
  if(!UI.tableBody) return;
  UI.tableBody.innerHTML = (lista && lista.length) ? lista.map(i=>`
    <tr>
      <td>${i.id}</td><td>${i.nome||'-'}</td><td>${i.patente||'-'}</td><td>${i.funcao||'-'}</td>
      <td>${i.setor||'-'}</td><td>${i.turno||'-'}</td><td>${i.viatura||'-'}</td><td>${i.status||'-'}</td>
      <td>${(i.latitude??'')&&(i.longitude??'')?i.latitude+','+i.longitude:'-'}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-primary me-2" data-edit="${i.id}">Editar</button>
        <button class="btn btn-sm btn-danger" data-del="${i.id}">Excluir</button>
      </td>
    </tr>`).join("") : '<tr><td colspan="10" class="text-center">Sem registros.</td></tr>';

  UI.tableBody.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>carregarParaEdicao(Number(b.dataset.edit)));
  UI.tableBody.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>deletarRegistro(Number(b.dataset.del)));
}

async function carregarLista(){
  try{
    const r = await fetch(`${CONFIG.API_BASE}/efetivo`, { headers: CONFIG.authHeaders() });
    const data = await r.json();
    renderLista(data);
  }catch(e){ console.error(e); renderLista([]); }
}

async function carregarParaEdicao(id){
  try{
    const r = await fetch(`${CONFIG.API_BASE}/efetivo`, { headers: CONFIG.authHeaders() });
    const data = await r.json();
    const it = data.find(x=>x.id===id);
    if(!it) return;
    EDIT_ID = id;
    for(const k of ['nome','patente','funcao','setor','turno','viatura','placa','status','latitude','longitude']){
      if(UI.fields[k]) UI.fields[k].value = it[k] ?? '';
    }
    if(it.foto && UI.preview){ UI.preview.src = it.foto; UI.preview.style.display='block'; }
    UI.btnSalvar.textContent = 'Atualizar';
    if(UI.btnCancelar){ UI.btnCancelar.style.display='inline-block'; }
    window.scrollTo({top:0,behavior:'smooth'});
  }catch(e){ console.error(e); }
}

async function deletarRegistro(id){
  if(!confirm('Confirma excluir este registro?')) return;
  try{
    const r = await fetch(`${CONFIG.API_BASE}/efetivo/${id}`, { method:'DELETE', headers: CONFIG.authHeaders() });
    if(!r.ok) throw 0;
    await carregarLista();
  }catch{ alert('Erro ao excluir.'); }
}

function resetForm(){
  EDIT_ID = null;
  if(UI.form) UI.form.reset();
  if(UI.preview){ UI.preview.src=''; UI.preview.style.display='none'; }
  if(UI.btnSalvar) UI.btnSalvar.textContent='Salvar';
  if(UI.btnCancelar) UI.btnCancelar.style.display='none';
  preencherGPS();
}

async function onSubmit(e){
  e.preventDefault();
  const payload = {};
  for(const k of ['nome','patente','funcao','setor','turno','viatura','placa','status','latitude','longitude']){
    if(UI.fields[k]) payload[k] = UI.fields[k].value?.trim() || null;
  }
  if(UI.fields.foto && UI.fields.foto.files && UI.fields.foto.files[0]){
    try{ payload.foto = await toBase64(UI.fields.foto.files[0]); }catch{ payload.foto=null; }
  }
  const url = EDIT_ID ? `${CONFIG.API_BASE}/efetivo/${EDIT_ID}` : `${CONFIG.API_BASE}/efetivo`;
  const method = EDIT_ID ? 'PUT' : 'POST';
  try{
    const r = await fetch(url, { method, headers: CONFIG.authHeaders(), body: JSON.stringify(payload) });
    if(!r.ok) throw 0;
    resetForm(); await carregarLista();
  }catch(e){ console.error(e); alert('Erro ao salvar registro.'); }
}

document.addEventListener('DOMContentLoaded', ()=>{
  UI.form = document.getElementById('form-efetivo');
  UI.tableBody = document.querySelector('#tabela-efetivo tbody');
  UI.btnSalvar = document.getElementById('btn-salvar');
  UI.btnCancelar = document.getElementById('btn-cancelar');
  UI.preview = document.getElementById('foto-preview');
  ['nome','patente','funcao','setor','turno','viatura','placa','status','latitude','longitude','foto']
    .forEach(id=> UI.fields[id] = document.getElementById(id));
  if(UI.form) UI.form.addEventListener('submit', onSubmit);
  if(UI.btnCancelar) UI.btnCancelar.addEventListener('click', resetForm);
  if(UI.fields.foto && UI.preview){
    UI.fields.foto.addEventListener('change', async () => {
      const f = UI.fields.foto.files?.[0];
      if(!f){ UI.preview.style.display='none'; return; }
      const b64 = await toBase64(f); UI.preview.src=b64; UI.preview.style.display='block';
    });
  }
  preencherGPS();
  carregarLista();
});
