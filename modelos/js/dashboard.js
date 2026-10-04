/* ==========================================================================
   Modelo D — Dashboard executivo (demonstração)
   ========================================================================== */
(function () {
  const STORAGE_KEY = "kodex-demo-dashboard-v2";
  const NOME_MODELO = "Dashboard executivo";

  const CORES = {
    primary: "#0B2A5B",
    secondary: "#2563EB",
    accent: "#F89235",
    verde: "#059669",
    roxo: "#7C3AED",
    cinza: "#9CA3AF",
  };

  const DATASETS = {
    7: {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      faturamentoSerie: [2200, 2600, 1900, 3100, 3400, 2800, 2400],
      kpis: { faturamento: 18400, ticket: 328, clientesNovos: 14, conversao: 7.2 },
      deltas: { faturamento: 4.8, ticket: -1.2, clientesNovos: 9.0, conversao: 0.6 },
      canal: { labels: ["Loja física", "Site", "WhatsApp", "Indicação"], valores: [6200, 5400, 4300, 2500] },
      origem: { labels: ["Indicação", "Redes sociais", "Busca no Google", "Outros"], valores: [38, 29, 24, 9] },
    },
    30: {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
      faturamentoSerie: [16200, 18700, 19800, 21500],
      kpis: { faturamento: 76200, ticket: 345, clientesNovos: 52, conversao: 8.1 },
      deltas: { faturamento: 11.3, ticket: 2.4, clientesNovos: 14.0, conversao: 1.1 },
      canal: { labels: ["Loja física", "Site", "WhatsApp", "Indicação"], valores: [24500, 21800, 18200, 11700] },
      origem: { labels: ["Indicação", "Redes sociais", "Busca no Google", "Outros"], valores: [34, 31, 27, 8] },
    },
    90: {
      labels: ["Mês 1", "Mês 2", "Mês 3"],
      faturamentoSerie: [64800, 71200, 78900],
      kpis: { faturamento: 214900, ticket: 352, clientesNovos: 168, conversao: 8.6 },
      deltas: { faturamento: 17.6, ticket: 3.1, clientesNovos: 22.4, conversao: 1.8 },
      canal: { labels: ["Loja física", "Site", "WhatsApp", "Indicação"], valores: [72300, 64100, 51200, 27300] },
      origem: { labels: ["Indicação", "Redes sociais", "Busca no Google", "Outros"], valores: [36, 30, 25, 9] },
    },
  };

  function lerPeriodoSalvo() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function salvarPeriodo(periodo) {
    try { localStorage.setItem(STORAGE_KEY, periodo); } catch (e) { /* segue em memória */ }
  }

  const defaults = { periodo: '30', ticket: 350, conversao: 8, leads: 200 };
  const state = DemoStorage.read(STORAGE_KEY, defaults, s => s && ['7','30','90'].includes(s.periodo) && Number.isFinite(s.ticket) && s.ticket >= 100 && s.ticket <= 2000 && Number.isFinite(s.conversao) && s.conversao >= 1 && s.conversao <= 40 && Number.isFinite(s.leads) && s.leads >= 10 && s.leads <= 2000);
  let periodoAtual = state.periodo;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let charts = {};

  function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }

  function renderDeltaBadge(el, delta) {
    const positivo = delta >= 0;
    el.textContent = `${positivo ? "▲" : "▼"} ${Math.abs(delta).toFixed(1)}% vs período anterior`;
    el.className = "kpi-delta " + (positivo ? "is-up" : "is-down");
  }

  function renderKpis(dataset) {
    document.getElementById("kpi-faturamento").textContent = formatarMoeda(dataset.kpis.faturamento);
    document.getElementById("kpi-ticket").textContent = formatarMoeda(dataset.kpis.ticket);
    document.getElementById("kpi-clientes").textContent = dataset.kpis.clientesNovos;
    document.getElementById("kpi-conversao").textContent = dataset.kpis.conversao.toFixed(1) + "%";

    renderDeltaBadge(document.getElementById("kpi-faturamento-delta"), dataset.deltas.faturamento);
    renderDeltaBadge(document.getElementById("kpi-ticket-delta"), dataset.deltas.ticket);
    renderDeltaBadge(document.getElementById("kpi-clientes-delta"), dataset.deltas.clientesNovos);
    renderDeltaBadge(document.getElementById("kpi-conversao-delta"), dataset.deltas.conversao);
  }

  function destruirGraficos() {
    Object.values(charts).forEach((c) => c && c.destroy());
    charts = {};
  }

  function renderGraficos(dataset) {
    destruirGraficos();
    const root = document.getElementById('chart-data');
    root.replaceChildren();
    const sections = [
      ['Faturamento no período', dataset.labels, dataset.faturamentoSerie, formatarMoeda],
      ['Vendas por canal', dataset.canal.labels, dataset.canal.valores, formatarMoeda],
      ['Origem dos clientes', dataset.origem.labels, dataset.origem.valores, v => v + '%']
    ];
    sections.forEach(([title, labels, values, format]) => {
      const table = document.createElement('table');
      const caption = table.createCaption(); caption.textContent = title;
      const head = table.createTHead().insertRow();
      ['Categoria','Valor'].forEach(label => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = label; head.appendChild(th); });
      const body = table.createTBody();
      labels.forEach((label,i) => { const row = body.insertRow(); row.insertCell().textContent = label; row.insertCell().textContent = format(values[i]); });
      root.appendChild(table);
    });
    if (typeof Chart === 'undefined') {
      document.getElementById('chart-status').textContent = 'Os gráficos precisam de conexão para carregar. Você pode consultar os mesmos dados na tabela abaixo.';
      document.querySelector('.data-summary').open = true;
      document.querySelectorAll('.chart-card canvas').forEach(c => c.hidden = true);
      return;
    }
    Chart.defaults.animation = reducedMotion ? false : { duration: 350 };
    Chart.defaults.font.size = 14;
    Chart.defaults.color = document.documentElement?.dataset?.theme === 'dark' ? '#b6c6e0' : '#4b5c77';

    charts.linha = new Chart(document.getElementById("chart-linha"), {
      type: "line",
      data: {
        labels: dataset.labels,
        datasets: [{
          label: "Faturamento",
          data: dataset.faturamentoSerie,
          borderColor: CORES.secondary,
          backgroundColor: "rgba(37,99,235,0.12)",
          tension: 0.35,
          fill: true,
          pointBackgroundColor: CORES.secondary,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => formatarMoeda(v) } } },
      },
    });

    charts.barras = new Chart(document.getElementById("chart-barras"), {
      type: "bar",
      data: {
        labels: dataset.canal.labels,
        datasets: [{
          label: "Vendas por canal",
          data: dataset.canal.valores,
          backgroundColor: [CORES.primary, CORES.secondary, CORES.accent, CORES.verde],
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => formatarMoeda(v) } } },
      },
    });

    charts.rosca = new Chart(document.getElementById("chart-rosca"), {
      type: "doughnut",
      data: {
        labels: dataset.origem.labels,
        datasets: [{
          data: dataset.origem.valores,
          backgroundColor: [CORES.secondary, CORES.accent, CORES.verde, CORES.cinza],
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 14 } } } },
      },
    });
  }

  function aplicarPeriodo(periodo) {
    periodoAtual = String(periodo);
    const dataset = DATASETS[periodoAtual];
    renderKpis(dataset);
    renderGraficos(dataset);
    state.periodo = periodoAtual;
    DemoStorage.write(STORAGE_KEY, state);

    document.querySelectorAll(".period-group button").forEach((b) => {
      const ativo = b.getAttribute("data-periodo") === periodoAtual;
      b.classList.toggle("is-active", ativo);
      b.setAttribute("aria-pressed", String(ativo));
    });
  }

  document.querySelectorAll(".period-group button").forEach((b) => {
    b.addEventListener("click", () => aplicarPeriodo(b.getAttribute("data-periodo")));
  });

  /* ---------- Simulador "E se?" ---------- */
  const simTicket = document.getElementById("sim-ticket");
  const simConversao = document.getElementById("sim-conversao");
  const simLeads = document.getElementById("sim-leads");
  simTicket.value = state.ticket;
  simConversao.value = state.conversao;
  simLeads.value = state.leads;

  function atualizarSimulador() {
    const ticket = Number(simTicket.value);
    const conversao = Number(simConversao.value);
    const leads = Number(simLeads.value);

    document.getElementById("sim-ticket-valor").textContent = formatarMoeda(ticket);
    document.getElementById("sim-conversao-valor").textContent = conversao + "%";
    document.getElementById("sim-leads-valor").textContent = leads;

    const receita = leads * (conversao / 100) * ticket;
    document.getElementById("sim-resultado").textContent = formatarMoeda(receita);
    state.ticket = ticket; state.conversao = conversao; state.leads = leads;
    DemoStorage.write(STORAGE_KEY, state);
  }
  [simTicket, simConversao, simLeads].forEach((el) => el.addEventListener("input", atualizarSimulador));

  /* ---------- Restaurar demo ---------- */
  document.getElementById("btn-restaurar").addEventListener("click", () => {
    simTicket.value = 350;
    simConversao.value = 8;
    simLeads.value = 200;
    atualizarSimulador();
    aplicarPeriodo(30);
    mostrarToast("Demonstração restaurada.");
  });

  /* CTA de contato configurado centralmente em ../js/main.js. */

  const toast = document.getElementById("toast");
  function mostrarToast(mensagem) {
    toast.textContent = mensagem;
    toast.classList.add("is-visible");
    window.clearTimeout(mostrarToast._t);
    mostrarToast._t = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  atualizarSimulador();
  aplicarPeriodo(periodoAtual);
  window.addEventListener('kodex:theme', () => renderGraficos(DATASETS[periodoAtual]));
})();
