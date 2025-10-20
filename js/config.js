// ===============================
// ⚙️ ROTAM App - Configuração Frontend
// ===============================

// URL base da API hospedada no Render
// 🔹 Se mudar o nome do backend no Render, atualize este link:
const API_BASE = "https://rotam-backend.onrender.com/api/";

// 🔹 (Opcional) URL pública do mapa real (Leaflet) hospedado no backend
const BACKEND_MAP_URL = "https://rotam-backend.onrender.com/public/maps/mapa.html";

// ===============================
// 🔑 Funções utilitárias globais
// ===============================

// Recupera o token JWT do login (armazenado no navegador)
function getToken() {
  return localStorage.getItem("token");
}

// Cabeçalhos padrão para requisições autenticadas
function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Logout simples
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

// ===============================
// 🌍 Exporta para uso global
// ===============================
window.CONFIG = {
  API_BASE,
  BACKEND_MAP_URL,
  getToken,
  authHeaders,
  logout,
};
