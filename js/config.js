// ===============================
// 🌐 Configuração Global do Sistema ROTAM
// ===============================

// URL base do backend
const API_BASE_URL = "https://rotam-backend-production.up.railway.app";

// Endpoints principais
const ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  occurrences: `${API_BASE_URL}/occurrences`,
};

// Função para pegar token salvo
function getAuthToken() {
  return localStorage.getItem("token");
}

// Função para montar headers autenticados
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Exporta tudo em um objeto global
window.CONFIG = {
  API_BASE_URL,
  ENDPOINTS,
  getAuthToken,
  getAuthHeaders,
};
