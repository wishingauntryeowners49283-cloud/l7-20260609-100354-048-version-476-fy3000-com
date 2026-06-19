(function () {
    function select(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupMenu() {
        var toggle = select("[data-menu-toggle]");
        var nav = select("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = select("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = selectAll(".hero-slide", root);
        var dots = selectAll("[data-hero-dot]", root);
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });

        start();
    }

    function setupFilters() {
        selectAll("[data-filter-form]").forEach(function (form) {
            var keyInput = select("[data-filter-key]", form);
            var typeSelect = select("[data-filter-type]", form);
            var yearSelect = select("[data-filter-year]", form);
            var section = form.parentElement;
            var cards = selectAll("[data-movie-card], .rank-row", section);
            var empty = select("[data-empty-state]", section);

            function run() {
                var key = normalize(keyInput && keyInput.value);
                var type = normalize(typeSelect && typeSelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var content = normalize([
                        card.dataset.title,
                        card.dataset.genre,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    var cardType = normalize(card.dataset.type || card.textContent);
                    var cardYear = normalize(card.dataset.year || card.textContent);
                    var matched = true;

                    if (key && content.indexOf(key) === -1) {
                        matched = false;
                    }
                    if (type && cardType.indexOf(type) === -1) {
                        matched = false;
                    }
                    if (year && cardYear.indexOf(year) === -1) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyInput, typeSelect, yearSelect].forEach(function (input) {
                if (input) {
                    input.addEventListener("input", run);
                    input.addEventListener("change", run);
                }
            });

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                run();
            });
        });
    }

    function movieResultCard(movie) {
        return [
            "<a class=\"movie-card\" href=\"" + movie.url + "\">",
            "<span class=\"poster-wrap\"><img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\"><span class=\"poster-shade\"></span><span class=\"meta-pill top-left\">" + escapeHtml(movie.year) + "</span><span class=\"meta-pill bottom-right\">" + escapeHtml(movie.duration) + "</span></span>",
            "<span class=\"movie-body\"><strong>" + escapeHtml(movie.title) + "</strong><span>" + escapeHtml(movie.oneLine) + "</span><small>" + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + " · " + escapeHtml(movie.genre) + "</small></span>",
            "</a>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var form = select("[data-search-page]");
        var input = select("[data-search-input]");
        var results = select("[data-search-results]");
        if (!form || !input || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = normalize(input.value);
            var source = window.SEARCH_MOVIES;
            var items = query ? source.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.tags,
                    movie.oneLine,
                    movie.category
                ].join(" ")).indexOf(query) !== -1;
            }) : source.slice(0, 60);
            results.innerHTML = items.slice(0, 120).map(movieResultCard).join("");
        }

        input.addEventListener("input", render);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });
        render();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("videoStart");
        var shell = document.getElementById("moviePlayer");
        if (!video || !button || !streamUrl) {
            return;
        }

        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (loaded) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
            video.controls = true;
            loaded = true;
        }

        function start() {
            load();
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            start();
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === shell) {
                    start();
                }
            });
        }

        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupSearchPage();
    });
})();
