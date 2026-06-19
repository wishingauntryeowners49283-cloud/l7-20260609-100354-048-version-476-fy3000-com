document.addEventListener("DOMContentLoaded", function () {
    prepareImages();
    prepareMenu();
    prepareHero();
    prepareFilters();
    preparePlayer();
});

function prepareImages() {
    document.querySelectorAll("img").forEach(function (image) {
        image.addEventListener("error", function () {
            image.classList.add("is-missing");
        });
    });
}

function prepareMenu() {
    var button = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
        return;
    }
    button.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function prepareHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
        return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
            showSlide(index);
            start();
        });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
}

function prepareFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll("[data-card-grid]"));
    if (!grids.length) {
        return;
    }
    var search = document.querySelector("#site-search");
    var typeFilter = document.querySelector("#type-filter");
    var sortSelect = document.querySelector("#sort-select");

    function applyFilters() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var typeValue = typeFilter ? typeFilter.value : "";
        grids.forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || ""
                ].join(" ").toLowerCase();
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesType = !typeValue || (card.getAttribute("data-type") || "").indexOf(typeValue) !== -1;
                card.classList.toggle("is-filter-hidden", !(matchesKeyword && matchesType));
            });
        });
    }

    function applySort() {
        if (!sortSelect) {
            return;
        }
        var value = sortSelect.value;
        grids.forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            cards.sort(function (a, b) {
                if (value === "title") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                }
                if (value === "year") {
                    return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                }
                return Number(b.getAttribute("data-hot") || 0) - Number(a.getAttribute("data-hot") || 0);
            });
            cards.forEach(function (card) {
                grid.appendChild(card);
            });
        });
    }

    if (search) {
        search.addEventListener("input", applyFilters);
    }
    if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
    }
    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            applySort();
            applyFilters();
        });
        applySort();
    }
}

function preparePlayer() {
    var shell = document.querySelector(".player-shell[data-video]");
    if (!shell) {
        return;
    }
    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var url = shell.getAttribute("data-video");
    var ready = false;
    var hls = null;

    function bind() {
        if (ready || !url || !video) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            return;
        }
        if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            return;
        }
        video.src = url;
    }

    function play() {
        bind();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
            });
        }
    }

    if (cover) {
        cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        } else {
            video.pause();
        }
    });
    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });
}
