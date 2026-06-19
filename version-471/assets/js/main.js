(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function imagePath(coverIndex) {
        return "./" + coverIndex + ".jpg";
    }

    function movieHref(id) {
        return "movie/" + id + ".html";
    }

    function bindMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", panel.classList.contains("is-open"));
        });
    }

    function bindImageFallbacks() {
        var images = document.querySelectorAll(".poster-shell img");

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                var shell = image.closest(".poster-shell");
                if (shell) {
                    shell.classList.add("is-missing");
                }
            });
        });
    }

    function bindHeroSlider() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }

        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var previous = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
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
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        start();
    }

    function bindPageFilter() {
        var input = document.querySelector("[data-page-filter]");
        if (!input) {
            return;
        }

        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre")
                ].join(" ").toLowerCase();

                card.style.display = !query || text.indexOf(query) !== -1 ? "" : "none";
            });
        });
    }

    function renderSearchCard(movie) {
        var tags = [];
        (movie.genres || []).slice(0, 2).forEach(function (tag) {
            tags.push(tag);
        });
        (movie.tags || []).slice(0, 2).forEach(function (tag) {
            tags.push(tag);
        });

        return [
            '<article class="movie-card card group">',
            '    <a class="movie-card__media poster-shell" href="' + movieHref(movie.id) + '">',
            '        <img class="poster-img video-card-thumb" src="' + imagePath(movie.coverIndex) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-fallback">' + escapeHtml(movie.title) + '</span>',
            '        <span class="card-overlay"></span>',
            '        <span class="movie-card__play">▶</span>',
            '        <span class="movie-card__heat">热度 ' + escapeHtml(movie.heat) + '</span>',
            '    </a>',
            '    <div class="movie-card__body">',
            '        <div class="movie-card__meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</div>',
            '        <h3><a href="' + movieHref(movie.id) + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine || movie.summary || '') + '</p>',
            '        <div class="tag-list">' + tags.slice(0, 4).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function bindSearchPage() {
        var data = window.MOVIE_DATA;
        var results = document.getElementById("search-results");

        if (!data || !results) {
            return;
        }

        var keywordInput = document.getElementById("search-input");
        var regionFilter = document.getElementById("region-filter");
        var typeFilter = document.getElementById("type-filter");
        var yearFilter = document.getElementById("year-filter");
        var count = document.getElementById("search-count");

        function matches(movie, keyword, region, type, year) {
            var searchable = [
                movie.title,
                movie.region,
                movie.type,
                movie.typeGroup,
                movie.year,
                movie.genreRaw,
                movie.mainCategory,
                (movie.genres || []).join(" "),
                (movie.tags || []).join(" "),
                movie.oneLine,
                movie.summary
            ].join(" ").toLowerCase();

            if (keyword && searchable.indexOf(keyword) === -1) {
                return false;
            }

            if (region && movie.mainCategory !== region) {
                return false;
            }

            if (type && movie.typeGroup !== type) {
                return false;
            }

            if (year && String(movie.year) !== year) {
                return false;
            }

            return true;
        }

        function update() {
            var keyword = (keywordInput && keywordInput.value || "").trim().toLowerCase();
            var region = regionFilter && regionFilter.value || "";
            var type = typeFilter && typeFilter.value || "";
            var year = yearFilter && yearFilter.value || "";

            var matched = data.filter(function (movie) {
                return matches(movie, keyword, region, type, year);
            });

            count.textContent = "匹配到 " + matched.length + " 部影片";
            results.innerHTML = matched.slice(0, 120).map(renderSearchCard).join("\n");
            bindImageFallbacks();
        }

        [keywordInput, regionFilter, typeFilter, yearFilter].forEach(function (control) {
            if (control) {
                control.addEventListener("input", update);
                control.addEventListener("change", update);
            }
        });

        update();
    }

    function bindPlayers() {
        var players = document.querySelectorAll(".movie-player");

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-start");
            var status = player.querySelector("[data-player-status]");
            var hlsSource = player.getAttribute("data-hls");
            var mp4Source = player.getAttribute("data-mp4");
            var poster = player.getAttribute("data-poster");
            var hlsInstance = null;
            var hasStarted = false;

            if (!video || !button) {
                return;
            }

            if (poster) {
                video.setAttribute("poster", poster);
            }

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function attachSource() {
                if (hasStarted) {
                    return;
                }

                hasStarted = true;
                video.controls = true;

                if (window.Hls && window.Hls.isSupported() && hlsSource) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 60
                    });

                    hlsInstance.loadSource(hlsSource);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("HLS 播放源已加载");
                        video.play().catch(function () {
                            setStatus("点击视频继续播放");
                        });
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal) {
                            setStatus("HLS 加载失败，已切换 MP4 后备源");
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                            video.src = mp4Source;
                            video.play().catch(function () {
                                setStatus("点击视频继续播放");
                            });
                        }
                    });
                    return;
                }

                if (hlsSource && video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = hlsSource;
                    setStatus("使用浏览器原生 HLS 播放");
                    video.play().catch(function () {
                        setStatus("点击视频继续播放");
                    });
                    return;
                }

                video.src = mp4Source;
                setStatus("使用 MP4 后备源播放");
                video.play().catch(function () {
                    setStatus("点击视频继续播放");
                });
            }

            button.addEventListener("click", function () {
                player.classList.add("is-playing");
                attachSource();
            });

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });

            video.addEventListener("pause", function () {
                if (!video.ended) {
                    setStatus("已暂停");
                }
            });
        });
    }

    ready(function () {
        bindMobileMenu();
        bindImageFallbacks();
        bindHeroSlider();
        bindPageFilter();
        bindSearchPage();
        bindPlayers();
    });
})();
