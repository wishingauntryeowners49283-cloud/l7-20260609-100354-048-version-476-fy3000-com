(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    const prev = carousel.querySelector('[data-hero-prev]');
    const next = carousel.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    show(0);
    start();
  }

  const queryParams = new URLSearchParams(window.location.search);
  const query = queryParams.get('q');

  document.querySelectorAll('[data-filter-root]').forEach(function (panel) {
    const section = panel.closest('section') || document;
    const input = panel.querySelector('[data-filter-input]');
    const buttons = Array.from(panel.querySelectorAll('[data-year-filter]'));
    const cards = Array.from(section.querySelectorAll('[data-card]'));
    const empty = section.querySelector('[data-empty-state]');
    let year = 'all';

    if (input && query) {
      input.value = query;
    }

    const filter = function () {
      const value = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || '',
          card.dataset.genre || '',
          card.dataset.tags || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const matchText = !value || text.includes(value);
        const matchYear = year === 'all' || card.dataset.year === year;
        const showCard = matchText && matchYear;
        card.hidden = !showCard;
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    };

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        year = button.dataset.yearFilter || 'all';
        buttons.forEach(function (btn) {
          btn.classList.toggle('active', btn === button);
        });
        filter();
      });
    });

    if (input) {
      input.addEventListener('input', filter);
    }

    filter();
  });

  const loadVideo = function (video, url, errorBox) {
    if (video.dataset.ready === '1') {
      return Promise.resolve();
    }

    return new Promise(function (resolve, reject) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.dataset.ready = '1';
        resolve();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        video.dataset.ready = '1';

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (errorBox) {
              errorBox.hidden = false;
            }
            reject(new Error('video load error'));
          }
        });
        return;
      }

      video.src = url;
      video.dataset.ready = '1';
      resolve();
    });
  };

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('[data-video]');
    const button = player.querySelector('[data-play-button]');
    const errorBox = player.querySelector('[data-player-error]');
    const url = player.dataset.playUrl;

    const play = function () {
      if (!video || !url) {
        return;
      }
      loadVideo(video, url, errorBox).then(function () {
        if (button) {
          button.classList.add('is-hidden');
        }
        video.play().catch(function () {
          if (errorBox) {
            errorBox.hidden = false;
          }
        });
      }).catch(function () {
        if (errorBox) {
          errorBox.hidden = false;
        }
      });
    };

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });

  document.querySelectorAll('[data-start-player]').forEach(function (button) {
    button.addEventListener('click', function () {
      const player = document.querySelector('[data-player]');
      const playButton = player ? player.querySelector('[data-play-button]') : null;
      if (playButton) {
        playButton.click();
      }
      const target = document.getElementById('player');
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    });
  });
})();
