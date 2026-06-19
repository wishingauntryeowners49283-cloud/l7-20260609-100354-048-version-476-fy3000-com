function initMoviePlayer(config) {
  var video = document.getElementById('movie-player');
  var cover = document.querySelector('[data-player-cover]');
  if (!video || !config || !config.source) {
    return;
  }

  var source = config.source;
  var hlsInstance = null;

  if (config.poster) {
    video.setAttribute('poster', config.poster);
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (window.Hls && window.Hls.isSupported()) {
    hlsInstance = new window.Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
  } else {
    video.src = source;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add('is-hidden');
    }
  }

  function showCover() {
    if (cover && video.paused) {
      cover.classList.remove('is-hidden');
    }
  }

  function startPlayback() {
    hideCover();
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {
        showCover();
      });
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', hideCover);
  video.addEventListener('pause', showCover);
  video.addEventListener('ended', showCover);

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
