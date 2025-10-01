// js/config.js

// Endereço do backend da aplicação
const API_BASE_URL = "https://rotam-backend-production.up.railway.app";

// Endpoints principais
const ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  occurrences: `${API_BASE_URL}/occurrences`,
};

// Função utilitária para pegar o token salvo
function getAuthToken() {
  return localStorage.getItem("token");
}

// Função utilitária para headers autenticados
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };
}

// Export simples (se precisar no futuro em bundlers)
window.CONFIG = {
  API_BASE_URL,
  ENDPOINTS,
  getAuthToken,
  getAuthHeaders,
};
