(function () {
    var body = document.body;
    var toggle = document.querySelector('.mobile-toggle');
    if (toggle) {
        toggle.addEventListener('click', function () {
            body.classList.toggle('menu-open');
        });
    }

    var stage = document.querySelector('.hero-stage');
    if (stage) {
        var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(stage.querySelectorAll('.hero-dot'));
        var prev = stage.querySelector('.hero-prev');
        var next = stage.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) return;
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function play() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) window.clearInterval(timer);
            play();
        }

        if (prev) prev.addEventListener('click', function () { show(index - 1); restart(); });
        if (next) next.addEventListener('click', function () { show(index + 1); restart(); });
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-slide'), 10) || 0);
                restart();
            });
        });
        show(0);
        if (slides.length > 1) play();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
        var root = panel.parentElement || document;
        var input = panel.querySelector('.movie-search');
        var year = panel.querySelector('.movie-year-filter');
        var type = panel.querySelector('.movie-type-filter');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));

        function apply() {
            var q = input ? input.value.trim().toLowerCase() : '';
            var y = year ? year.value : '';
            var t = type ? type.value : '';
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' ').toLowerCase();
                var ok = (!q || text.indexOf(q) !== -1) && (!y || card.getAttribute('data-year') === y) && (!t || card.getAttribute('data-type') === t);
                card.style.display = ok ? '' : 'none';
            });
        }

        if (input) input.addEventListener('input', apply);
        if (year) year.addEventListener('change', apply);
        if (type) type.addEventListener('change', apply);
    });
})();

function initPlayer(src) {
    var video = document.getElementById('movie-player');
    if (!video || !src) return;
    var cover = document.querySelector('.player-cover');
    var ready = false;
    var hls = null;

    function load() {
        if (ready) return;
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    }

    function start() {
        load();
        if (cover) cover.classList.add('is-hidden');
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {});
        }
    }

    if (cover) cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (cover) cover.classList.add('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
        if (hls) hls.destroy();
    });
}
