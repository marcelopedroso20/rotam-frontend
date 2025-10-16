// ===============================
// 🎖️ topo-rotam.js — Cabeçalho global dinâmico
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const topo = document.getElementById("topoRotam");
  const usuarioSpan = document.getElementById("usuarioLogado");

  // Caso o cabeçalho não exista (por segurança)
  if (!topo || !usuarioSpan) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      usuarioSpan.textContent = "⚠️ Usuário não autenticado";
      setTimeout(() => (window.location.href = "./login.html"), 1500);
      return;
    }

    // Decodifica o token JWT para extrair dados do usuário
    const payload = JSON.parse(atob(token.split(".")[1] || "{}"));
    const usuario = payload?.usuario || "Desconhecido";
    const role = payload?.role || "user";

    // Atualiza cabeçalho com nome e perfil formatados
    usuarioSpan.innerHTML = `
      👮 <strong>${usuario}</strong>
      <small class="text-warning">(${role.toUpperCase()})</small>
    `;

    // Remove texto lateral antigo (caso ainda exista)
    const duplicado = document.querySelector(".usuario-info-lateral");
    if (duplicado) duplicado.remove();

  } catch (err) {
    console.error("Erro ao carregar topo ROTAM:", err);
    usuarioSpan.textContent = "Erro ao carregar usuário";
  }
});
