/* ==========================================================================
   Modelo B — Site institucional (demonstração)
   ========================================================================== */
(function () {
  const STORAGE_KEY = "kodex-demo-institucional";
  const NOME_MODELO = "Site institucional";

  const TEMAS = {
    azul: { primary: "#0B2A5B", bgAlt: "#F3F4F6", heading: "'Montserrat', sans-serif", body: "'Inter', sans-serif" },
    verde: { primary: "#0F766E", bgAlt: "#F0FDFA", heading: "'Poppins', sans-serif", body: "'Inter', sans-serif" },
    bordo: { primary: "#6B1D32", bgAlt: "#FBF3F0", heading: "'Lora', serif", body: "'Inter', sans-serif" },
  };

  const DEFAULTS = { tema: "azul", view: "desktop", secoes: { depoimentos: true, equipe: true, faq: true } };

  function lerStorage() {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) { return null; }
  }
  function salvarStorage(dados) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(dados)); } catch (e) { /* segue em memória */ }
  }

  let estado = DemoStorage.read(STORAGE_KEY, DEFAULTS, s => s && Object.hasOwn(TEMAS,s.tema) && ['desktop','mobile'].includes(s.view) && s.secoes && ['depoimentos','equipe','faq'].every(k => typeof s.secoes[k] === 'boolean'));

  const frame = document.getElementById("inst-frame");
  const toast = document.getElementById("toast");

  function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add("is-visible");
    window.clearTimeout(mostrarToast._t);
    mostrarToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function aplicarTema() {
    const t = TEMAS[estado.tema];
    frame.style.setProperty("--theme-primary", t.primary);
    frame.style.setProperty("--theme-bg-alt", t.bgAlt);
    frame.style.setProperty("--theme-heading", t.heading);
    frame.style.setProperty("--theme-body", t.body);

    document.querySelectorAll(".theme-swatch").forEach((sw) => {
      const ativo = sw.getAttribute("data-theme") === estado.tema;
      sw.classList.toggle("is-active", ativo);
      sw.setAttribute("aria-pressed", String(ativo));
    });
  }

  function aplicarView() {
    frame.classList.toggle("is-mobile", estado.view === "mobile");
    document.querySelectorAll(".view-toggle button").forEach((b) => {
      const ativo = b.getAttribute("data-view") === estado.view;
      b.classList.toggle("is-active", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
  }

  function aplicarSecoes() {
    Object.keys(estado.secoes).forEach((chave) => {
      const el = document.getElementById("sec-" + chave);
      if (el) el.style.display = estado.secoes[chave] ? "" : "none";
      const checkbox = document.querySelector(`[data-section="${chave}"]`);
      if (checkbox) checkbox.checked = estado.secoes[chave];
    });
  }

  document.querySelectorAll(".theme-swatch").forEach((sw) => {
    sw.addEventListener("click", () => {
      estado.tema = sw.getAttribute("data-theme");
      aplicarTema();
      salvarStorage(estado);
    });
  });

  document.querySelectorAll(".view-toggle button").forEach((b) => {
    b.addEventListener("click", () => {
      estado.view = b.getAttribute("data-view");
      aplicarView();
      salvarStorage(estado);
    });
  });

  document.querySelectorAll('[data-section]').forEach((chk) => {
    chk.addEventListener("change", () => {
      estado.secoes[chk.getAttribute("data-section")] = chk.checked;
      aplicarSecoes();
      salvarStorage(estado);
    });
  });

  document.getElementById("btn-restaurar").addEventListener("click", () => {
    estado = JSON.parse(JSON.stringify(DEFAULTS));
    aplicarTema();
    aplicarView();
    aplicarSecoes();
    salvarStorage(estado);
    mostrarToast("Demonstração restaurada.");
  });

  /* CTA de contato configurado centralmente em ../js/main.js. */

  aplicarTema();
  aplicarView();
  aplicarSecoes();
})();
