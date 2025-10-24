// ===============================
// ⚙️ ROTAM App - Configuração Frontend (v2.3.1)
// ===============================

const API_BASE = "https://rotam-backend.onrender.com/api";
const BACKEND_MAP_URL = "https://rotam-backend.onrender.com/public/maps/mapa.html";

// ===============================
// 🔑 Recupera o token JWT salvo
// ===============================
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("⚠️ Token não encontrado — redirecionando para login...");
    alert("Sessão expirada ou inválida. Faça login novamente.");
    window.location.href = "login.html";
  }
  return token;
}

// ===============================
// 🧩 Cabeçalhos padrão com JWT sempre incluso
// ===============================
function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

// ===============================
// 🚪 Logout rápido
// ===============================
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ===============================
// 🌐 Exporta configuração global
// ===============================
window.CONFIG = {
  API_BASE,
  BACKEND_MAP_URL,
  getToken,
  authHeaders,
  logout,
};
