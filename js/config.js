// js/config.js
const API_BASE = "https://rotam-backend-v2-production.up.railway.app/api";
const BACKEND_MAP_URL = "https://rotam-backend-v2-production.up.railway.app/public/maps/mapa.html";
function getToken(){ return localStorage.getItem('token'); }
function authHeaders(){ const t=getToken(); return { 'Content-Type':'application/json', ...(t?{Authorization:`Bearer ${t}`}:{}) }; }
window.CONFIG = { API_BASE, BACKEND_MAP_URL, getToken, authHeaders };
