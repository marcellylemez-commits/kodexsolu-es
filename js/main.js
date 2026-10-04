/* Configuração única para a página principal e todas as demonstrações. */
window.CONFIG = {
  empresa: "Kodex Soluções",
  whatsappUrl: "https://api.whatsapp.com/send?phone=5511941599287",
  instagramUrl: "https://www.instagram.com/kodex_solucoes?stkn=M2plZDlzYmdnczFv",
  siteUrl: "[URL_DO_SITE]",
  whatsappMensagemPadrao: "Olá, Kodex! Quero saber mais sobre sites, sistemas e soluções com IA para o meu negócio."
};

function linkWhatsApp(mensagem) {
  try {
    const url = new URL(window.CONFIG.whatsappUrl);
    const valido = url.protocol === "https:" && (
      (url.hostname === "wa.me" && /^\/\d{10,15}\/?$/.test(url.pathname)) ||
      (url.hostname === "api.whatsapp.com" && url.pathname === "/send" && /^\d{10,15}$/.test(url.searchParams.get("phone") || ""))
    );
    if (!valido) return null;
    url.hash = "";
    url.searchParams.delete("text");
    const base = url.toString();
    return base + (url.search ? "&" : "?") + "text=" + encodeURIComponent(mensagem || CONFIG.whatsappMensagemPadrao);
  } catch (_) { return null; }
}
window.linkWhatsApp = linkWhatsApp;

/* Armazenamento indisponível ou dados corrompidos nunca bloqueiam uma demo. */
window.DemoStorage = {
  read(key, fallback, validate = () => true) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value !== null && validate(value) ? value : structuredCloneSafe(fallback);
    } catch (_) { return structuredCloneSafe(fallback); }
  },
  write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* Estado segue em memória. */ }
  }
};
function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }

document.addEventListener("DOMContentLoaded", () => {
  const contact = document.createElement("dialog");
  contact.className = "contact-dialog";
  contact.setAttribute("aria-labelledby", "contact-title");
  contact.innerHTML = '<h2 id="contact-title">Contato em configuração</h2><p id="contact-message"></p><form method="dialog"><button class="btn btn-primary">Fechar</button></form>';
  document.body.appendChild(contact);
  contact.addEventListener("click", e => { if (e.target === contact) contact.close(); });
  function pending(kind) {
    contact.querySelector("p").textContent = kind === "WhatsApp" ? "[LINK_WHATSAPP] — o contato oficial da KODEX será disponibilizado aqui." : "[LINK_INSTAGRAM] — o perfil oficial da KODEX será disponibilizado aqui.";
    contact.showModal();
  }
  const modelCTA = document.getElementById("btn-quero-assim");
  if (modelCTA) {
    modelCTA.dataset.whatsapp = "";
    modelCTA.dataset.whatsappMsg = `Olá, Kodex! Testei o modelo "${document.body.dataset.modelo}" no site e quero algo parecido para minha empresa.`;
  }
  if (document.body.dataset.modelo && !document.querySelector(".whatsapp-float")) {
    const floating = document.createElement("a");
    floating.className = "whatsapp-float";
    floating.dataset.whatsapp = "";
    floating.dataset.whatsappMsg = modelCTA.dataset.whatsappMsg;
    floating.setAttribute("aria-label", "Falar com a Kodex no WhatsApp sobre este modelo");
    floating.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 1 1-4.1-7.3L21 3l-1.2 4A8.4 8.4 0 0 1 21 11.5z"/></svg>';
    document.body.appendChild(floating);
  }
  document.querySelectorAll("[data-whatsapp]").forEach(el => {
    const url = linkWhatsApp(el.dataset.whatsappMsg);
    el.href = url || "#contato";
    if (url) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
    else el.addEventListener("click", e => { e.preventDefault(); pending("WhatsApp"); });
  });
  document.querySelectorAll("[data-instagram]").forEach(el => {
    let valid = false;
    try { const u = new URL(CONFIG.instagramUrl); valid = u.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(u.hostname); } catch (_) {}
    el.href = valid ? CONFIG.instagramUrl : "#contato";
    if (valid) { el.target = "_blank"; el.rel = "noopener noreferrer"; }
    else el.addEventListener("click", e => { e.preventDefault(); pending("Instagram"); });
  });
  document.querySelectorAll("[data-empresa-nome]").forEach(el => el.textContent = CONFIG.empresa);
  document.querySelectorAll("[data-ano-atual]").forEach(el => el.textContent = new Date().getFullYear());

  /* Metadados usam a mesma origem configurada; placeholders nunca viram URLs públicas. */
  let origin = null;
  try { const u = new URL(CONFIG.siteUrl); if (["https:", "http:"].includes(u.protocol)) origin = u.href.replace(/\/?$/, "/"); } catch (_) {}
  let schema = document.getElementById("organization-schema");
  if (!schema) { schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.id = 'organization-schema'; document.head.appendChild(schema); }
  if (schema) {
    const organization = { "@context": "https://schema.org", "@type": "Organization", name: CONFIG.empresa, alternateName: "Kodex", description: "Sites, portfólios, sistemas e soluções com inteligência artificial para empresas e profissionais." };
    if (origin) { organization.url = origin; organization.logo = new URL("assets/logo.png", origin).href; }
    if (document.querySelector("[data-instagram][target]")) organization.sameAs = [CONFIG.instagramUrl];
    schema.textContent = JSON.stringify(organization);
  }
  if (origin) {
    const path = document.body.dataset.modelo ? "modelos/" + location.pathname.split("/").pop() : "index.html";
    const meta = document.createElement("meta"); meta.setAttribute("property", "og:url"); meta.content = new URL(path, origin).href; document.head.appendChild(meta);
  }

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    const close = () => { toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Abrir menu de navegação"); nav.classList.remove("is-open"); };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open)); toggle.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação"); nav.classList.toggle("is-open", open);
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if (e.key === "Escape" && nav.classList.contains("is-open")) { close(); toggle.focus(); } });
  }
  /* Busca, filtros, prévias e comparação em experience.js. */
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && "IntersectionObserver" in window) {
    document.documentElement.classList.add("has-reveal");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .08 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
  } else document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible"));
  const header = document.querySelector(".site-header");
  if (header) {
    const update = () => header.classList.toggle("is-scrolled", scrollY > 12);
    update(); addEventListener("scroll", update, { passive: true });
  }
  const badge = document.querySelector("[data-badge-rotativo]");
  if (badge) badge.textContent = "Sites · Sistemas · IA";
  const demoBar = document.querySelector('.demo-bar');
  if (document.body.dataset.modelo && demoBar) {
    const updateHeight = () => document.querySelector('.demo-shell').style.paddingTop = (demoBar.getBoundingClientRect().height + 20) + 'px';
    updateHeight();
    if ('ResizeObserver' in window) new ResizeObserver(updateHeight).observe(demoBar);
    else addEventListener('resize', updateHeight);
  }
});
