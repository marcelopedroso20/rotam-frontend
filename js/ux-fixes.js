
// js/ux-fixes.js
// Correções rápidas de UX para páginas do ROTAM (mapa_forca, cadastro, relatorios).
// - Garante apenas um botão "Sair" funcional por página.
// - Adiciona botão "Voltar" na mapa_forca.html (leva para index.html).
// - Remove rótulos/elementos duplicados de "Carregando usuário..." se existirem.

(function() {
  document.addEventListener("DOMContentLoaded", () => {
    try {
      // 1) Guard de autenticação básico (não conflita com seu auth-guard.js)
      const token = localStorage.getItem("token");
      if (!token) {
        if (!location.pathname.endsWith("login.html")) {
          location.href = "login.html";
          return;
        }
      }

      // 2) Sair: manter um único botão e torná-lo funcional
      const allButtons = Array.from(document.querySelectorAll("button, a"));
      const sairButtons = allButtons.filter(el => {
        const txt = (el.textContent || "").trim().toLowerCase();
        return txt === "sair" || el.id === "btnLogout" || el.dataset.btn === "logout";
      });

      if (sairButtons.length > 0) {
        const mainLogout = sairButtons[0];
        const clone = mainLogout.cloneNode(true);
        mainLogout.parentNode.replaceChild(clone, mainLogout);

        for (let i = 1; i < sairButtons.length; i++) {
          const b = sairButtons[i];
          if (b && b.parentNode) b.parentNode.removeChild(b);
        }

        clone.addEventListener("click", (e) => {
          e.preventDefault();
          try {
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            localStorage.removeItem("role");
          } catch(_) {}
          window.location.href = "login.html";
        });
        clone.id = "btnLogout";
      }

      // 3) Remover duplicações de "Carregando usuário..."
      const candidates = Array.from(document.querySelectorAll("*"))
        .filter(el => (el.textContent || "").trim().toLowerCase().includes("carregando usuário"));
      if (candidates.length > 1) {
        for (let i = 1; i < candidates.length; i++) {
          const el = candidates[i];
          if (el && el.parentNode) el.parentNode.removeChild(el);
        }
      }

      // 4) Botão "Voltar" somente na página mapa_forca.html
      const isMapaForca = /mapa_forca\.html(\?.*)?$/.test(location.pathname);
      if (isMapaForca && !document.getElementById("btnBack")) {
        const backBtn = document.createElement("button");
        backBtn.id = "btnBack";
        backBtn.textContent = "← Voltar";
        backBtn.style.margin = "10px 0 15px 10px";
        backBtn.style.padding = "8px 14px";
        backBtn.style.borderRadius = "6px";
        backBtn.style.border = "1px solid #444";
        backBtn.style.cursor = "pointer";
        backBtn.style.background = "#2d2d2d";
        backBtn.style.color = "#fff";
        backBtn.addEventListener("mouseenter", () => backBtn.style.background = "#3a3a3a");
        backBtn.addEventListener("mouseleave", () => backBtn.style.background = "#2d2d2d");
        backBtn.addEventListener("click", () => window.location.href = "index.html");

        const containers = document.querySelectorAll("#main, main, .container, .content, .page, .wrapper");
        if (containers.length > 0) {
          containers[0].insertAdjacentElement("afterbegin", backBtn);
        } else {
          document.body.insertAdjacentElement("afterbegin", backBtn);
        }
      }
    } catch (err) {
      console.error("[ux-fixes] erro:", err);
    }
  });
})();
