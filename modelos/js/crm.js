/* ==========================================================================
   Modelo C — Mini-CRM de vendas (demonstração)
   ========================================================================== */
(function () {
  const STORAGE_KEY = "kodex-demo-crm";
  const NOME_MODELO = "Sistema de gestão (mini-CRM)";

  const ETAPAS = [
    { id: "novo", label: "Novo contato" },
    { id: "proposta", label: "Proposta" },
    { id: "negociacao", label: "Negociação" },
    { id: "fechado", label: "Fechado" },
    { id: "perdido", label: "Perdido" },
  ];

  const SEED = [
    { id: "c1", nome: "Marina Souza", empresa: "Empresa Fictícia A", valor: 4200, proximaAcao: "Ligar para apresentar proposta", data: "2026-10-05", etapa: "novo" },
    { id: "c2", nome: "Carlos Lima", empresa: "Negócio Fictício B", valor: 8500, proximaAcao: "Enviar orçamento por e-mail", data: "2026-10-07", etapa: "novo" },
    { id: "c3", nome: "Juliana Alves", empresa: "Comércio Fictício C", valor: 6000, proximaAcao: "Agendar reunião de briefing", data: "2026-10-06", etapa: "proposta" },
    { id: "c4", nome: "Rafael Costa", empresa: "Serviços Fictícios D", valor: 12500, proximaAcao: "Revisar escopo com o cliente", data: "2026-10-09", etapa: "proposta" },
    { id: "c5", nome: "Fernanda Dias", empresa: "Indústria Fictícia E", valor: 21000, proximaAcao: "Negociar prazo de entrega", data: "2026-10-10", etapa: "negociacao" },
    { id: "c6", nome: "Thiago Martins", empresa: "Loja Fictícia F", valor: 3800, proximaAcao: "Aguardar retorno do cliente", data: "2026-10-04", etapa: "negociacao" },
    { id: "c7", nome: "Patrícia Gomes", empresa: "Studio Fictício G", valor: 9700, proximaAcao: "Contrato assinado — iniciar projeto", data: "2026-09-28", etapa: "fechado" },
    { id: "c8", nome: "Diego Rocha", empresa: "Consultoria Fictícia H", valor: 5400, proximaAcao: "Projeto entregue", data: "2026-09-20", etapa: "fechado" },
    { id: "c9", nome: "Bianca Freitas", empresa: "Agência Fictícia I", valor: 4000, proximaAcao: "Cliente optou por outro fornecedor", data: "2026-09-15", etapa: "perdido" },
  ];

  function lerStorage() {
    try {
      const bruto = localStorage.getItem(STORAGE_KEY);
      return bruto ? JSON.parse(bruto) : null;
    } catch (e) { return null; }
  }
  function salvarStorage(clientes) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(clientes)); } catch (e) { /* segue em memória */ }
  }

  let clientes = DemoStorage.read(STORAGE_KEY, SEED, s => Array.isArray(s) && new Set(s.map(c => c && c.id)).size === s.length && s.every(c => c && /^c[a-z0-9]+$/i.test(c.id) && typeof c.nome === 'string' && typeof c.empresa === 'string' && typeof c.proximaAcao === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.data) && Number.isFinite(c.valor) && c.valor >= 0 && ETAPAS.some(e => e.id === c.etapa)));

  const board = document.getElementById("kanban-board");
  const busca = document.getElementById("crm-busca");
  const toast = document.getElementById("toast");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const form = document.getElementById("form-cliente");
  const modalTitulo = document.getElementById("modal-titulo");
  const filtroEtapa = document.getElementById('crm-etapa-filtro');
  let focoAnterior = null;
  let ordem = 'nome';

  function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add("is-visible");
    window.clearTimeout(mostrarToast._t);
    mostrarToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function gerarId() {
    return "c" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  }

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }

  function formatarData(iso) {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function listaFiltrada() {
    const termo = busca.value.trim().toLowerCase();
    return clientes.filter((c) =>
      (c.nome.toLowerCase().includes(termo) || c.empresa.toLowerCase().includes(termo)) && (filtroEtapa.value === 'todos' || c.etapa === filtroEtapa.value)
    ).sort((a,b) => ordem === 'valor' ? b.valor-a.valor : ordem === 'data' ? a.data.localeCompare(b.data) : a.nome.localeCompare(b.nome,'pt-BR'));
  }

  function render() {
    const filtrados = listaFiltrada();
    document.getElementById('crm-status').textContent = `${filtrados.length} oportunidades nesta visualização.`;

    ETAPAS.forEach((etapa) => {
      const container = board.querySelector(`[data-coluna="${etapa.id}"]`);
      container.innerHTML = "";
      let total = 0;

      filtrados.filter((c) => c.etapa === etapa.id).forEach((cliente) => {
        total += Number(cliente.valor || 0);
        container.appendChild(criarCard(cliente));
      });
      if (!container.childElementCount) { const empty = document.createElement('p'); empty.className = 'demo-hint'; empty.textContent = 'Nenhuma oportunidade nesta etapa.'; container.appendChild(empty); }

      board.querySelector(`[data-total="${etapa.id}"]`).textContent = formatarMoeda(total);
    });

    configurarDragAndDrop();
    window.dispatchEvent(new Event('kodex:crm-update'));
  }

  function criarCard(cliente) {
    const card = document.createElement("div");
    card.className = "kanban-card";
    card.draggable = true;
    card.setAttribute("data-id", cliente.id);

    const selectOpcoes = ETAPAS.map(
      (e) => `<option value="${e.id}" ${e.id === cliente.etapa ? "selected" : ""}>${e.label}</option>`
    ).join("");

    card.innerHTML = `
      <strong>${escapeHtml(cliente.nome)}</strong>
      <span class="kc-empresa">${escapeHtml(cliente.empresa)}</span>
      <span class="kc-valor">${formatarMoeda(cliente.valor)}</span>
      <span class="kc-data">${escapeHtml(cliente.proximaAcao || "")} ${cliente.data ? "· " + formatarData(cliente.data) : ""}</span>
      <div class="kanban-card-actions">
        <button type="button" class="kc-btn" data-acao="editar">Editar</button>
        <button type="button" class="kc-btn" data-acao="excluir">Excluir</button>
      </div>
      <label class="visually-hidden" for="mover-${cliente.id}">Mover ${escapeHtml(cliente.nome)} para outra etapa</label>
      <select class="kc-move-select" id="mover-${cliente.id}">${selectOpcoes}</select>
    `;

    card.addEventListener("dragstart", (e) => {
      card.classList.add("is-dragging");
      card._dragId = cliente.id;
      e.dataTransfer.setData('text/plain', cliente.id);
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener("dragend", () => card.classList.remove("is-dragging"));

    card.querySelector('[data-acao="editar"]').addEventListener("click", () => abrirModal(cliente.id));
    card.querySelector('[data-acao="excluir"]').addEventListener("click", () => excluirCliente(cliente.id));
    card.querySelector(".kc-move-select").addEventListener("change", (e) => {
      moverCliente(cliente.id, e.target.value);
      const movedSelect = document.getElementById('mover-' + cliente.id);
      if (movedSelect) movedSelect.focus();
      else filtroEtapa.focus();
    });

    return card;
  }

  function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto == null ? "" : String(texto);
    return div.innerHTML;
  }

  function moverCliente(id, novaEtapa) {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente || !ETAPAS.some(e => e.id === novaEtapa)) return;
    cliente.etapa = novaEtapa;
    salvarStorage(clientes);
    render();
    mostrarToast("Oportunidade movida.");
  }

  function excluirCliente(id) {
    const cliente = clientes.find((c) => c.id === id);
    if (!cliente) return;
    if (!window.confirm(`Excluir "${cliente.nome}" desta demonstração?`)) return;
    clientes = clientes.filter((c) => c.id !== id);
    salvarStorage(clientes);
    render();
    mostrarToast("Cliente excluído.");
  }

  /* ---------- Drag and drop entre colunas ---------- */
  function configurarDragAndDrop() {
    document.querySelectorAll(".kanban-cards").forEach((coluna) => {
      coluna.ondragover = (e) => {
        e.preventDefault();
        coluna.closest(".kanban-col").classList.add("is-dragover");
      };
      coluna.ondragleave = () => coluna.closest(".kanban-col").classList.remove("is-dragover");
      coluna.ondrop = (e) => {
        e.preventDefault();
        coluna.closest(".kanban-col").classList.remove("is-dragover");
        const cardArrastado = document.querySelector(".kanban-card.is-dragging");
        if (!cardArrastado) return;
        const id = cardArrastado.getAttribute("data-id");
        const novaEtapa = coluna.getAttribute("data-coluna");
        moverCliente(id, novaEtapa);
      };
    });
  }

  /* ---------- Modal de cadastro/edição ---------- */
  function abrirModal(id) {
    focoAnterior = document.activeElement;
    const edicao = Boolean(id);
    modalTitulo.textContent = edicao ? "Editar cliente" : "Novo cliente";
    form.reset();
    document.getElementById("cliente-id").value = "";

    if (edicao) {
      const c = clientes.find((x) => x.id === id);
      if (!c) return;
      document.getElementById("cliente-id").value = c.id;
      document.getElementById("cliente-nome").value = c.nome;
      document.getElementById("cliente-empresa").value = c.empresa;
      document.getElementById("cliente-valor").value = c.valor;
      document.getElementById("cliente-acao").value = c.proximaAcao || "";
      document.getElementById("cliente-data").value = c.data || "";
      document.getElementById("cliente-etapa").value = c.etapa;
    } else {
      document.getElementById("cliente-data").value = new Date().toISOString().slice(0, 10);
      document.getElementById("cliente-etapa").value = "novo";
    }

    modalBackdrop.classList.add("is-open");
    document.querySelector('.demo-shell').inert = true;
    document.querySelector('.demo-bar').inert = true;
    const floating = document.querySelector('.whatsapp-float'); if (floating) floating.inert = true;
    document.getElementById("cliente-nome").focus();
  }

  function fecharModal() {
    modalBackdrop.classList.remove("is-open");
    document.querySelector('.demo-shell').inert = false;
    document.querySelector('.demo-bar').inert = false;
    const floating = document.querySelector('.whatsapp-float'); if (floating) floating.inert = false;
    if (focoAnterior && focoAnterior.isConnected) focoAnterior.focus(); else document.getElementById('btn-novo-cliente').focus();
  }

  document.getElementById("btn-novo-cliente").addEventListener("click", () => abrirModal(null));
  document.getElementById("btn-cancelar-modal").addEventListener("click", fecharModal);
  modalBackdrop.addEventListener("click", (e) => { if (e.target === modalBackdrop) fecharModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modalBackdrop.classList.contains('is-open')) fecharModal(); });
  modalBackdrop.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(modalBackdrop.querySelectorAll('button,input:not([type="hidden"]),select'));
    const first = nodes[0], last = nodes[nodes.length-1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("cliente-id").value;
    const dados = {
      nome: document.getElementById("cliente-nome").value.trim(),
      empresa: document.getElementById("cliente-empresa").value.trim(),
      valor: Number(document.getElementById("cliente-valor").value || 0),
      proximaAcao: document.getElementById("cliente-acao").value.trim(),
      data: document.getElementById("cliente-data").value,
      etapa: document.getElementById("cliente-etapa").value,
    };

    if (!dados.nome || !dados.empresa) return;

    if (id) {
      const cliente = clientes.find((c) => c.id === id);
      Object.assign(cliente, dados);
    } else {
      clientes.push(Object.assign({ id: gerarId() }, dados));
    }

    salvarStorage(clientes);
    render();
    fecharModal();
    mostrarToast(id ? "Cliente atualizado." : "Cliente cadastrado.");
  });

  /* ---------- Busca ---------- */
  busca.addEventListener("input", render);
  filtroEtapa.addEventListener('change', render);

  /* ---------- Exportar CSV ---------- */
  document.getElementById("btn-exportar-csv").addEventListener("click", () => {
    const cabecalho = ["Nome", "Empresa", "Valor", "Proxima acao", "Data", "Etapa"];
    const linhas = listaFiltrada().map((c) => [
      c.nome, c.empresa, c.valor,
      (c.proximaAcao || "").replace(/;/g, ","),
      c.data, ETAPAS.find((e) => e.id === c.etapa)?.label || c.etapa,
    ]);
    const safeCell = v => { let s = String(v); if (/^[\s]*[=+@\-]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    const csv = [cabecalho, ...linhas].map(linha => linha.map(safeCell).join(';')).join('\r\n');

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kodex-crm-demo.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    mostrarToast("CSV exportado.");
  });

  /* ---------- Restaurar demo ---------- */
  document.getElementById("btn-restaurar").addEventListener("click", () => {
    clientes = JSON.parse(JSON.stringify(SEED));
    busca.value = "";
    filtroEtapa.value = 'todos';
    salvarStorage(clientes);
    render();
    mostrarToast("Demonstração restaurada.");
  });

  /* CTA de contato configurado centralmente em ../js/main.js. */
  window.KodexCRM = { list: listaFiltrada, stages: ETAPAS, move: moverCliente, edit: abrirModal, remove: excluirCliente, sort(value) { if (['nome','valor','data'].includes(value)) { ordem=value; render(); } } };
  render();
})();
