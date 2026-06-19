(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var thumbs = Array.prototype.slice.call(slider.querySelectorAll(".hero-thumb"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            thumbs.forEach(function (thumb, i) {
                thumb.classList.toggle("is-active", i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        thumbs.forEach(function (thumb) {
            thumb.addEventListener("click", function () {
                show(Number(thumb.getAttribute("data-hero-index")) || 0);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalized(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        forms.forEach(function (form) {
            var section = form.closest("section") || document;
            var list = section.querySelector("[data-card-list]") || document;
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var search = form.querySelector("[data-filter-search]");
            var year = form.querySelector("[data-filter-year]");
            var type = form.querySelector("[data-filter-type]");
            var category = form.querySelector("[data-filter-category]");
            var empty = section.querySelector(".no-result");

            function apply() {
                var q = normalized(search && search.value);
                var y = normalized(year && year.value);
                var t = normalized(type && type.value);
                var c = normalized(category && category.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalized(card.getAttribute("data-search"));
                    var cardYear = normalized(card.getAttribute("data-year"));
                    var cardType = normalized(card.getAttribute("data-type"));
                    var cardSearch = normalized(card.getAttribute("data-search"));
                    var matched = true;

                    if (q && text.indexOf(q) === -1) {
                        matched = false;
                    }
                    if (y && cardYear !== y) {
                        matched = false;
                    }
                    if (t && cardType !== t) {
                        matched = false;
                    }
                    if (c && cardSearch.indexOf(c) === -1) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, year, type, category].forEach(function (item) {
                if (item) {
                    item.addEventListener("input", apply);
                    item.addEventListener("change", apply);
                }
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play]");
            if (!video) {
                return;
            }
            var stream = video.getAttribute("data-stream");
            var hls = null;
            var prepared = false;

            function markError() {
                player.classList.add("has-error");
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            function prepare() {
                if (prepared) {
                    playVideo();
                    return;
                }
                if (!stream) {
                    markError();
                    return;
                }
                prepared = true;
                player.classList.add("is-playing");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            markError();
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    video.addEventListener("loadedmetadata", playVideo, { once: true });
                    playVideo();
                } else {
                    markError();
                }
            }

            if (button) {
                button.addEventListener("click", prepare);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    prepare();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
            video.addEventListener("error", markError);
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
