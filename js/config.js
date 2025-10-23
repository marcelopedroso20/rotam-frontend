// ===============================
// ⚙️ ROTAM App - Configuração Frontend
// ===============================

const API_BASE = "https://rotam-backend.onrender.com/api";
const BACKEND_MAP_URL = "https://rotam-backend.onrender.com/public/maps/mapa.html";

// Recupera o token JWT salvo
function getToken() {
  return localStorage.getItem("token");
}

// Cabeçalhos padrão
function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Logout rápido
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// Exporta config global
window.CONFIG = {
  API_BASE,
  BACKEND_MAP_URL,
  getToken,
  authHeaders,
  logout,
};
