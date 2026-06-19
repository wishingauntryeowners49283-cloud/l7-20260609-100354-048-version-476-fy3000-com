(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function startPlayer(player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".player-cover");
    var stream = player.getAttribute("data-stream");

    if (!video || !stream) {
      return;
    }

    if (player.getAttribute("data-ready") === "true") {
      video.play().catch(function () {});
      return;
    }

    player.setAttribute("data-ready", "true");
    video.controls = true;

    if (cover) {
      cover.classList.add("is-hidden");
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          hls.destroy();
          video.src = stream;
          video.play().catch(function () {});
        }
      });
      player._hls = hls;
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      video.addEventListener("loadedmetadata", function () {
        video.play().catch(function () {});
      }, { once: true });
      return;
    }

    video.src = stream;
    video.play().catch(function () {});
  }

  function initPlayer(player) {
    var cover = player.querySelector(".player-cover");
    var video = player.querySelector("video");

    if (cover) {
      cover.addEventListener("click", function () {
        startPlayer(player);
      });
    }

    player.addEventListener("click", function (event) {
      if (event.target === player) {
        startPlayer(player);
      }
    });

    if (video) {
      video.addEventListener("play", function () {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      });
    }
  }

  ready(function () {
    document.querySelectorAll(".movie-player").forEach(initPlayer);
  });
})();
