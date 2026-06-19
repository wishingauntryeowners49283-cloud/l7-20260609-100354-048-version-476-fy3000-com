/* Static movie website interactions: navigation, hero slider, filters, search and HLS player. */
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav-list]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

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
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupLocalFilters() {
    var scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    var searchInput = scope.querySelector('[data-list-search]');
    var yearSelect = scope.querySelector('[data-year-filter]');
    var typeSelect = scope.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var count = scope.querySelector('[data-filter-count]');

    function apply() {
      var query = normalize(searchInput && searchInput.value);
      var year = normalize(yearSelect && yearSelect.value);
      var type = normalize(typeSelect && typeSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchType = !type || normalize(card.getAttribute('data-type')).indexOf(type) !== -1;
        var show = matchQuery && matchYear && matchType;
        card.classList.toggle('hidden-by-filter', !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    [searchInput, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupSearchPage() {
    var resultContainer = document.querySelector('[data-search-results]');
    var searchForm = document.querySelector('[data-search-form]');
    var searchInput = document.querySelector('[data-search-input]');
    var count = document.querySelector('[data-search-count]');

    if (!resultContainer || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function resultTemplate(item) {
      return [
        '<article class="search-result">',
        '  <a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
        '  <div>',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.genre) + '</p>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '  </div>',
        '  <a class="primary-button" href="' + item.url + '">进入详情</a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function runSearch(query) {
      var q = normalize(query);
      var results = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          item.tags,
          item.oneLine
        ].join(' '));
        return !q || haystack.indexOf(q) !== -1;
      });

      if (count) {
        count.textContent = '找到 ' + results.length + ' 部影片';
      }

      resultContainer.innerHTML = results.slice(0, 120).map(resultTemplate).join('') || '<p class="search-count">没有找到匹配影片，请更换关键词。</p>';
    }

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = searchInput ? searchInput.value : '';
        var url = new URL(window.location.href);
        url.searchParams.set('q', query);
        window.history.replaceState({}, '', url.toString());
        runSearch(query);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        runSearch(searchInput.value);
      });
    }

    runSearch(initialQuery);
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-video-src]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-player-start]');
      var message = shell.parentElement ? shell.parentElement.querySelector('[data-player-message]') : null;
      var source = shell.getAttribute('data-video-src');
      var initialized = false;

      function attach() {
        if (!video || !source || initialized) {
          return;
        }
        initialized = true;

        if (/\.m3u8(\?|$)/i.test(source) && window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function play() {
        attach();
        if (!video) {
          return;
        }
        var playPromise = video.play();
        shell.classList.add('is-playing');
        if (message) {
          message.textContent = '正在载入播放源，如网络较慢请稍候。';
        }
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            if (message) {
              message.textContent = '浏览器阻止自动播放，请再次点击播放按钮或使用视频控件播放。';
            }
            shell.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('is-playing');
        });
      }
    });
  }

  ready(function () {
    setupNavigation();
    setupHeroSlider();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
