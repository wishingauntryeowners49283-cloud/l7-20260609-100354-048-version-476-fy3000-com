(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    qsa('form[role="search"]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          event.preventDefault();
          input.focus();
          return;
        }
        event.preventDefault();
        var action = form.getAttribute('action') || './search.html';
        window.location.href = action + '?q=' + encodeURIComponent(query);
      });
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    start();
  }

  function initFilters() {
    var scope = qs('[data-filter-scope]');
    var list = qs('[data-filter-list]');
    if (!scope || !list) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', scope);
    var year = qs('[data-filter-year]', scope);
    var type = qs('[data-filter-type]', scope);
    var cards = qsa('.movie-card', list);

    function apply() {
      var text = (keyword && keyword.value || '').trim().toLowerCase();
      var yearValue = year && year.value || '';
      var typeValue = type && type.value || '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var matchedText = !text || haystack.indexOf(text) !== -1;
        var matchedYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matchedType = !typeValue || card.getAttribute('data-type') === typeValue;
        card.style.display = matchedText && matchedYear && matchedType ? '' : 'none';
      });
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function renderSearch() {
    var results = qs('[data-search-results]');
    if (!results || !window.siteMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = qs('.page-search-form input[name="q"]');
    var count = qs('[data-search-count]');
    if (input) {
      input.value = query;
    }
    var normalized = query.toLowerCase();
    var items = window.siteMovies.filter(function (movie) {
      if (!normalized) {
        return true;
      }
      return [movie.title, movie.year, movie.type, movie.region, movie.genre, movie.tags].join(' ').toLowerCase().indexOf(normalized) !== -1;
    }).slice(0, 240);
    if (count) {
      count.textContent = query ? '搜索结果：' + items.length + ' 部相关影片' : '输入关键词后可按片名、题材、地区或年份检索影片';
    }
    results.innerHTML = items.map(function (movie) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + movie.link + '">',
        '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '    <span class="score-pill">★ ' + movie.rating + '</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <a class="card-title" href="' + movie.link + '">' + escapeHtml(movie.title) + '</a>',
        '    <p class="card-meta">' + movie.year + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.region) + '</p>',
        '    <p class="card-summary">' + escapeHtml(movie.oneLine) + '</p>',
        '    <div class="tag-row"><span>' + escapeHtml(movie.genre) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    renderSearch();
  });
})();
