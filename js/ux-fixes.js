// ===============================
// 💡 ux-fixes.js — Correções rápidas de UX
// ===============================

(function() {
  document.addEventListener("DOMContentLoaded", () => {
    try {
      // 🔐 Verificação básica de token
      const token = localStorage.getItem("token");
      if (!token && !location.pathname.endsWith("login.html")) {
        console.warn("[UX] Sem token, redirecionando para login...");
        location.href = "login.html";
        return;
      }

      // 🚪 Mantém apenas 1 botão "Sair" funcional
      const allButtons = Array.from(document.querySelectorAll("button, a"));
      const sairButtons = allButtons.filter(el => {
        const txt = (el.textContent || "").trim().toLowerCase();
        return txt === "sair" || el.id === "btnLogout" || el.dataset.btn === "logout";
      });

      if (sairButtons.length > 0) {
        const mainLogout = sairButtons[0];
        const clone = mainLogout.cloneNode(true);
        mainLogout.parentNode.replaceChild(clone, mainLogout);

        // Remove duplicados
        sairButtons.slice(1).forEach(b => b.remove());

        // Evento de logout
        clone.addEventListener("click", (e) => {
          e.preventDefault();
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          localStorage.removeItem("role");
          window.location.href = "login.html";
        });
        clone.id = "btnLogout";
      }

      // 🧹 Remove duplicações de “Carregando usuário...”
      const candidates = Array.from(document.querySelectorAll("*"))
        .filter(el => (el.textContent || "").trim().toLowerCase().includes("carregando usuário"));
      if (candidates.length > 1) candidates.slice(1).forEach(el => el.remove());

      // ↩️ Adiciona botão "Voltar" apenas em mapa_forca.html
      const isMapaForca = /mapa_forca\.html(\?.*)?$/.test(location.pathname);
      if (isMapaForca && !document.getElementById("btnBack")) {
        const backBtn = document.createElement("button");
        backBtn.id = "btnBack";
        backBtn.textContent = "← Voltar";
        backBtn.className = "btn btn-secondary mb-3";
        backBtn.style.margin = "10px";
        backBtn.addEventListener("click", () => window.location.href = "index.html");

        const containers = document.querySelectorAll("#main, main, .container, .content, .page, .wrapper");
        if (containers.length > 0) containers[0].insertAdjacentElement("afterbegin", backBtn);
        else document.body.insertAdjacentElement("afterbegin", backBtn);
      }

      console.log("[UX-Fixes] aplicado com sucesso.");
    } catch (err) {
      console.error("[UX-Fixes] erro:", err);
    }
  });
})();
