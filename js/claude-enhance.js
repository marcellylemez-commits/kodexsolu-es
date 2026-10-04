/* Camada de interação adicional (Claude): favoritos, ordenação e microinterações da Vitrine. Não substitui experience.js. */
(function () {
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () {
    enhanceVitrine();
    enhanceHero();
  });

  function enhanceVitrine() {
    var grid = document.querySelector('.vitrine-grid');
    if (!grid) return;
    var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = matchMedia('(pointer: fine)').matches;
    var favKey = 'kodex-favoritos';
    var favs = [];
    try { favs = JSON.parse(localStorage.getItem(favKey)) || []; } catch (_) { favs = []; }
    function saveFavs() { try { localStorage.setItem(favKey, JSON.stringify(favs)); } catch (_) {} }
    function isFav(id) { return favs.indexOf(id) !== -1; }
    function toggleFav(id) { var i = favs.indexOf(id); if (i === -1) favs.push(id); else favs.splice(i, 1); saveFavs(); }

    document.querySelectorAll('.vitrine-card').forEach(function (card) {
      var id = card.dataset.model;
      var thumb = card.querySelector('.vitrine-thumb');
      if (thumb && id) {
        var star = document.createElement('button');
        star.type = 'button';
        star.className = 'fav-toggle';
        star.setAttribute('aria-pressed', String(isFav(id)));
        star.setAttribute('aria-label', 'Adicionar aos favoritos');
        star.textContent = '★';
        star.addEventListener('click', function (e) {
          e.preventDefault();
          toggleFav(id);
          star.setAttribute('aria-pressed', String(isFav(id)));
        });
        thumb.appendChild(star);
      }
      if (!reduced && fine) {
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty('--tiltX', (py * -5).toFixed(2) + 'deg');
          card.style.setProperty('--tiltY', (px * 5).toFixed(2) + 'deg');
        });
        card.addEventListener('mouseleave', function () {
          card.style.setProperty('--tiltX', '0deg');
          card.style.setProperty('--tiltY', '0deg');
        });
      }
    });

    var toolbar = document.querySelector('.catalog-controls');
    if (toolbar) {
      var label = document.createElement('label');
      label.className = 'catalog-sort';
      label.appendChild(document.createTextNode('Ordenar'));
      var select = document.createElement('select');
      select.setAttribute('aria-label', 'Ordenar modelos da vitrine');
      [['relevancia', 'Mais relevantes'], ['nome', 'Nome A-Z'], ['favoritos', 'Favoritos primeiro']].forEach(function (opt) {
        var o = document.createElement('option'); o.value = opt[0]; o.textContent = opt[1]; select.appendChild(o);
      });
      label.appendChild(select);
      toolbar.appendChild(label);
      select.addEventListener('change', function () { applySort(select.value); });
    }

    function applySort(mode) {
      var cards = Array.prototype.slice.call(document.querySelectorAll('.vitrine-card'));
      if (mode === 'nome') {
        cards.sort(function (a, b) {
          var an = a.querySelector('h3'), bn = b.querySelector('h3');
          return (an ? an.textContent : '').localeCompare(bn ? bn.textContent : '', 'pt-BR');
        });
      } else if (mode === 'favoritos') {
        cards.sort(function (a, b) {
          var af = isFav(a.dataset.model) ? 0 : 1;
          var bf = isFav(b.dataset.model) ? 0 : 1;
          return af - bf;
        });
      } else {
        cards.sort(function (a, b) { return (Number(a.dataset.order) || 0) - (Number(b.dataset.order) || 0); });
      }
      cards.forEach(function (card, i) { card.style.order = i; });
    }
    document.querySelectorAll('.vitrine-card').forEach(function (card, i) { card.dataset.order = i; });
  }

  function enhanceHero() {
    var hero = document.querySelector('.hero');
    if (!hero || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }
})();
