(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var dataNode = document.getElementById("movie-player-data");
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playLayer");
    if (!dataNode || !video || !button) {
      return;
    }

    var config = {};
    try {
      config = JSON.parse(dataNode.textContent || "{}");
    } catch (error) {
      config = {};
    }

    var loaded = false;
    var source = config.source || "";
    var poster = config.poster || "";
    var hls = null;

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function loadSource() {
      if (loaded || !source) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          backBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function startPlayback() {
      loadSource();
      button.classList.add("is-hidden");
      video.controls = true;
      var playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
