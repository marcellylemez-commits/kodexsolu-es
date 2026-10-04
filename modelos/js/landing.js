/* ==========================================================================
   Modelo A — Landing page de captação (demonstração)
   ========================================================================== */
(function () {
  const STORAGE_KEY = "kodex-demo-landing";
  const NOME_MODELO = "Landing page de captação";

  const DEFAULTS = {
    titulo: "Consultoria que organiza as finanças da sua empresa",
    subtitulo: "Diagnóstico completo, plano de ação e acompanhamento mensal para você decidir com segurança.",
    botao: "Quero um diagnóstico gratuito",
    cor: "#2563EB",
    estilo: "classic",
    leads: 0,
    countdownEnd: null,
  };

  const els = {
    titulo: document.getElementById("campo-titulo"),
    subtitulo: document.getElementById("campo-subtitulo"),
    botao: document.getElementById("campo-botao"),
    cor: document.getElementById("campo-cor"),
    estiloBotoes: document.querySelectorAll(".style-option"),
    previewHero: document.getElementById("lp-hero"),
    previewTitulo: document.getElementById("preview-titulo"),
    previewSubtitulo: document.getElementById("preview-subtitulo"),
    previewBotao: document.getElementById("preview-botao"),
    form: document.getElementById("form-lead"),
    leadSuccess: document.getElementById("lead-success"),
    leadCount: document.getElementById("lead-count"),
    btnRestaurar: document.getElementById("btn-restaurar"),
    btnQueroAssim: document.getElementById("btn-quero-assim"),
    toast: document.getElementById("toast"),
  };

  function lerStorage() {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) {
      return null;
    }
  }

  function salvarStorage(dados) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch (e) {
      /* localStorage indisponível: demo continua funcionando só em memória */
    }
  }

  let estado = DemoStorage.read(STORAGE_KEY, DEFAULTS, s => s && typeof s.titulo === 'string' && typeof s.subtitulo === 'string' && typeof s.botao === 'string' && /^#[0-9a-f]{6}$/i.test(s.cor) && ['classic','split','minimal'].includes(s.estilo) && Number.isInteger(s.leads) && s.leads >= 0 && (s.countdownEnd === null || Number.isFinite(s.countdownEnd)));
  if (!estado.countdownEnd) {
    estado.countdownEnd = Date.now() + 2 * 60 * 60 * 1000; // 2h a partir de agora
  }

  function aplicarEstadoNosCampos() {
    els.titulo.value = estado.titulo;
    els.subtitulo.value = estado.subtitulo;
    els.botao.value = estado.botao;
    els.cor.value = estado.cor;
    els.estiloBotoes.forEach((b) => {
      const ativo = b.getAttribute("data-style") === estado.estilo;
      b.classList.toggle("is-active", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
  }

  function renderPreview() {
    els.previewTitulo.textContent = estado.titulo;
    els.previewSubtitulo.textContent = estado.subtitulo;
    els.previewBotao.textContent = estado.botao;

    els.previewHero.className = "lp-hero style-" + estado.estilo;
    els.previewHero.style.background = estado.cor;
    const rgb = estado.cor.slice(1).match(/.{2}/g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    const light = .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
    const foreground = light > .179 ? '#111827' : '#FFFFFF';
    els.previewHero.querySelector('h1').style.color = foreground;
    els.previewHero.querySelector('p').style.color = foreground;
    els.previewBotao.style.background = estado.cor;
    els.previewBotao.style.color = foreground;

    els.leadCount.textContent = estado.leads;
  }

  function mostrarToast(mensagem) {
    els.toast.textContent = mensagem;
    els.toast.classList.add("is-visible");
    window.clearTimeout(mostrarToast._t);
    mostrarToast._t = window.setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
  }

  /* ---------- eventos do editor ---------- */
  els.titulo.addEventListener("input", () => { estado.titulo = els.titulo.value; renderPreview(); salvarStorage(estado); });
  els.subtitulo.addEventListener("input", () => { estado.subtitulo = els.subtitulo.value; renderPreview(); salvarStorage(estado); });
  els.botao.addEventListener("input", () => { estado.botao = els.botao.value; renderPreview(); salvarStorage(estado); });
  els.cor.addEventListener("input", () => { estado.cor = els.cor.value; renderPreview(); salvarStorage(estado); });

  els.estiloBotoes.forEach((botao) => {
    botao.addEventListener("click", () => {
      estado.estilo = botao.getAttribute("data-style");
      aplicarEstadoNosCampos();
      renderPreview();
      salvarStorage(estado);
    });
  });

  /* ---------- formulário de captura de lead ---------- */
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexWhats = /^[\d\s()+-]+$/;

  function validarCampo(input, valido) {
    input.classList.add("touched");
    input.setAttribute('aria-invalid', String(!valido));
    const erro = document.querySelector(`[data-error-for="${input.id}"]`);
    if (erro) erro.classList.toggle("is-visible", !valido);
    return valido;
  }

  els.form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("lead-nome");
    const whats = document.getElementById("lead-whatsapp");
    const email = document.getElementById("lead-email");

    const nomeOk = validarCampo(nome, nome.value.trim().length >= 2);
    const digits = whats.value.replace(/\D/g, '');
    const whatsOk = validarCampo(whats, regexWhats.test(whats.value.trim()) && digits.length >= 10 && digits.length <= 15);
    const emailOk = validarCampo(email, regexEmail.test(email.value.trim()));

    if (!(nomeOk && whatsOk && emailOk)) { [nome,whats,email].find(i => i.getAttribute('aria-invalid') === 'true').focus(); return; }

    estado.leads += 1;
    salvarStorage(estado);
    renderPreview();

    els.leadSuccess.classList.add("is-visible");
    els.form.reset();
    [nome, whats, email].forEach((i) => { i.classList.remove("touched"); i.removeAttribute('aria-invalid'); });
    mostrarToast("Lead capturado com sucesso!");

    window.setTimeout(() => els.leadSuccess.classList.remove("is-visible"), 4000);
  });

  /* ---------- contador regressivo ---------- */
  const cdHoras = document.getElementById("cd-horas");
  const cdMin = document.getElementById("cd-min");
  const cdSeg = document.getElementById("cd-seg");

  function atualizarContador() {
    let restante = estado.countdownEnd - Date.now();
    restante = Math.max(0, restante);
    const h = Math.floor(restante / 3600000);
    const m = Math.floor((restante % 3600000) / 60000);
    const s = Math.floor((restante % 60000) / 1000);
    cdHoras.textContent = String(h).padStart(2, "0");
    cdMin.textContent = String(m).padStart(2, "0");
    cdSeg.textContent = String(s).padStart(2, "0");
  }
  atualizarContador();
  setInterval(atualizarContador, 1000);

  /* ---------- restaurar demo ---------- */
  els.btnRestaurar.addEventListener("click", () => {
    estado = Object.assign({}, DEFAULTS, { countdownEnd: Date.now() + 2 * 60 * 60 * 1000 });
    salvarStorage(estado);
    aplicarEstadoNosCampos();
    renderPreview();
    els.leadSuccess.classList.remove("is-visible");
    els.form.reset();
    els.form.querySelectorAll('input').forEach(i => { i.classList.remove('touched'); i.removeAttribute('aria-invalid'); });
    atualizarContador();
    mostrarToast("Demonstração restaurada.");
  });

  /* CTA de contato configurado centralmente em ../js/main.js. */

  aplicarEstadoNosCampos();
  renderPreview();
  salvarStorage(estado);
  document.querySelector('.editor-toggle').addEventListener('click', e => {
    const button = e.currentTarget;
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.querySelector('span').textContent = open ? '−' : '+';
    document.getElementById('editor-controls').hidden = !open;
  });
})();
