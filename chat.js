(function () {
  // ============ PARTE PARA EDITAR ============
  // Endereço do seu Worker (copie do painel da Cloudflare, sem barra no final)
  const API = "https://kodex.marcellylemez.workers.dev";
  const TITULO = "Kodex Soluções • Tire suas dúvidas";
  const SAUDACAO = "Olá! Sou o assistente da Kodex Soluções. Posso te ajudar com sites, sistemas, automações e soluções com IA. Como posso ajudar?";
  const WHATSAPP = "https://wa.me/5511941599287";

  // Paleta oficial da Kodex (manual da marca)
  const CORES = {
    principal: "#0B2A5B",           // azul-marinho: botão, topo, Enviar e mensagens do visitante
    textoSobrePrincipal: "#FFFFFF", // texto em cima do azul-marinho
    destaque: "#F89235",            // laranja: detalhe do botão e foco
    fundo: "#FFFFFF",               // janela do chat e campo de digitação
    texto: "#1A1A1A",               // respostas e o que o visitante digita
    balaoResposta: "#F3F4F6",       // cinza claro: fundo das respostas da IA
    textoApagado: "#5B6475",        // texto de exemplo no campo
    borda: "#D6DBE4",
  };
  // ============ FIM DA PARTE PARA EDITAR ============

  // Evita criar um segundo botão se o script for carregado duas vezes
  if (document.getElementById("cv-btn")) return;

  const historico = [];
  const C = CORES;

  const css = document.createElement("style");
  css.textContent = `
    #cv-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;
      border:3px solid ${C.destaque};background:${C.principal};color:${C.textoSobrePrincipal};
      font-size:26px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);z-index:9999}
    #cv-btn:focus-visible{outline:3px solid ${C.destaque};outline-offset:3px}
    #cv-box{position:fixed;bottom:90px;right:20px;width:340px;max-width:calc(100vw - 40px);
      height:460px;max-height:calc(100vh - 110px);background:${C.fundo};color:${C.texto};
      border:1px solid ${C.borda};border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.3);
      display:none;flex-direction:column;overflow:hidden;z-index:9999;
      font-family:Inter,"Open Sans",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
    #cv-box.aberto{display:flex}
    #cv-topo{background:${C.principal};color:${C.textoSobrePrincipal};padding:12px 16px;font-weight:600;
      border-bottom:3px solid ${C.destaque};display:flex;justify-content:space-between;align-items:center}
    #cv-fechar{background:none;border:none;color:${C.textoSobrePrincipal};font-size:20px;cursor:pointer;line-height:1}
    #cv-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
    .cv-m{padding:8px 12px;border-radius:10px;max-width:85%;line-height:1.45;font-size:14px;white-space:pre-wrap;word-wrap:break-word}
    .cv-user{background:${C.principal};color:${C.textoSobrePrincipal};align-self:flex-end}
    .cv-bot{background:${C.balaoResposta};color:${C.texto};align-self:flex-start}
    .cv-bot a{color:${C.principal};font-weight:600}
    #cv-form{display:flex;border-top:1px solid ${C.borda}}
    #cv-input{flex:1;border:none;padding:12px;font:inherit;font-size:14px;outline:none;
      background:${C.fundo};color:${C.texto}}
    #cv-input::placeholder{color:${C.textoApagado};opacity:1}
    #cv-input:focus{box-shadow:inset 0 0 0 2px ${C.destaque}}
    #cv-enviar{border:none;background:${C.principal};color:${C.textoSobrePrincipal};font:inherit;
      font-size:14px;font-weight:600;padding:0 16px;cursor:pointer}
    #cv-enviar:disabled{opacity:.6;cursor:wait}
  `;
  document.head.appendChild(css);

  document.body.insertAdjacentHTML("beforeend", `
    <button id="cv-btn" aria-label="Abrir chat">💬</button>
    <div id="cv-box" role="dialog" aria-label="Chat da Kodex Soluções">
      <div id="cv-topo"><span id="cv-titulo"></span><button id="cv-fechar" aria-label="Fechar chat">×</button></div>
      <div id="cv-msgs" aria-live="polite"></div>
      <form id="cv-form">
        <input id="cv-input" placeholder="Digite sua pergunta..." maxlength="800" autocomplete="off" aria-label="Sua pergunta">
        <button id="cv-enviar" type="submit">Enviar</button>
      </form>
    </div>`);

  const box = document.getElementById("cv-box");
  const msgs = document.getElementById("cv-msgs");
  const input = document.getElementById("cv-input");
  const btnEnviar = document.getElementById("cv-enviar");
  document.getElementById("cv-titulo").textContent = TITULO;

  function adicionar(texto, classe) {
    const div = document.createElement("div");
    div.className = "cv-m " + classe;
    div.textContent = texto; // textContent impede que alguém injete HTML
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  // Mensagem de erro com link seguro para o WhatsApp
  function mostrarErro(div, texto) {
    div.textContent = texto + " ";
    const link = document.createElement("a");
    link.href = WHATSAPP;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Falar no WhatsApp";
    div.appendChild(link);
  }

  document.getElementById("cv-btn").onclick = () => {
    box.classList.toggle("aberto");
    if (!msgs.children.length) adicionar(SAUDACAO, "cv-bot");
    if (box.classList.contains("aberto")) input.focus();
  };

  document.getElementById("cv-fechar").onclick = () => box.classList.remove("aberto");

  document.getElementById("cv-form").onsubmit = async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || btnEnviar.disabled) return;

    input.value = "";
    btnEnviar.disabled = true;
    adicionar(texto, "cv-user");
    historico.push({ role: "user", content: texto });
    const aguardando = adicionar("Digitando...", "cv-bot");

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historico.slice(-10) }),
      });
      const dados = await r.json().catch(() => ({}));
      if (r.ok && dados.resposta) {
        aguardando.textContent = dados.resposta;
        historico.push({ role: "assistant", content: dados.resposta });
      } else {
        mostrarErro(aguardando, dados.erro || "Não consegui responder agora.");
        historico.pop();
      }
    } catch {
      mostrarErro(aguardando, "Erro de conexão. Tente novamente ou");
      historico.pop();
    } finally {
      btnEnviar.disabled = false;
      input.focus();
    }
  };
})();
