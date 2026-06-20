(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var root = document.querySelector('[data-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prev = root.querySelector('[data-hero-prev]');
    var next = root.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

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
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });
    show(0);
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
    panels.forEach(function (panel) {
      var area = panel.parentElement || document;
      var cards = Array.prototype.slice.call(area.querySelectorAll('.js-movie-card'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));
      }
      var keyword = panel.querySelector('[data-filter-keyword]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var empty = area.querySelector('[data-empty-result]');

      function apply() {
        var words = keyword ? keyword.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var ok = true;
          if (words && haystack.indexOf(words) === -1) {
            ok = false;
          }
          if (typeValue && (card.getAttribute('data-type') || '') !== typeValue) {
            ok = false;
          }
          if (yearValue && (card.getAttribute('data-year') || '') !== yearValue) {
            ok = false;
          }
          card.classList.toggle('is-filtered-out', !ok);
          if (ok) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', shown === 0);
        }
      }

      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  window.initMoviePlayer = function (id, streamUrl) {
    ready(function () {
      var root = document.getElementById(id);
      if (!root) {
        return;
      }
      var video = root.querySelector('video');
      var start = root.querySelector('.player-start');
      var attached = false;
      var hlsInstance = null;

      function attach() {
        if (!video || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        attach();
        if (start) {
          start.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            if (start) {
              start.classList.remove('is-hidden');
            }
          });
        }
      }

      if (start) {
        start.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('play', function () {
          if (start) {
            start.classList.add('is-hidden');
          }
        });
        video.addEventListener('ended', function () {
          if (start) {
            start.classList.remove('is-hidden');
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  };

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
  });
})();
