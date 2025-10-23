// ===============================
// 🎖️ topo-rotam.js — Cabeçalho global dinâmico (corrigido)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const headers = document.querySelectorAll("#topoRotam");
  const topo = headers.length ? headers[0] : null;
  const usuarioSpan = document.getElementById("usuarioLogado");

  if (!topo || !usuarioSpan) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      usuarioSpan.textContent = "⚠️ Sessão expirada. Redirecionando...";
      setTimeout(() => (window.location.href = "login.html"), 1500);
      return;
    }

    // Decodifica payload do JWT
    const payload = JSON.parse(atob(token.split(".")[1] || "{}"));
    const usuario = payload?.usuario || "Usuário";
    const role = payload?.role || "Padrão";

    // Atualiza cabeçalho
    usuarioSpan.innerHTML = `
      👮 <strong>${usuario}</strong>
      <small class="text-warning usuario-info">(${role.toUpperCase()})</small>
    `;

    // Remove duplicações (se existirem)
    document.querySelectorAll(".usuario-info-lateral").forEach(el => el.remove());
  } catch (err) {
    console.error("[Topo ROTAM] Erro ao carregar usuário:", err);
    usuarioSpan.textContent = "Erro ao carregar sessão.";
  }
});
