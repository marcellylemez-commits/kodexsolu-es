/* Tema único (escuro) — sem alternância para o usuário. */
(function () {
  const theme = 'dark';
  function apply() {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll('iframe[data-live-preview]').forEach(frame => frame.contentWindow?.postMessage({type:'kodex-theme',theme}, '*'));
  }
  window.KodexTheme = {apply, current: () => theme, toggle: () => {}};
  apply();
})();
