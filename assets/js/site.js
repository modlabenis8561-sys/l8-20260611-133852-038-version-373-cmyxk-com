(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll(".back-top").forEach(function (button) {
      button.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeSlide = (index + slides.length) % slides.length;

      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === activeSlide);
      });

      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === activeSlide);
      });
    }

    function startSlides() {
      if (slides.length <= 1) {
        return;
      }

      window.clearInterval(slideTimer);
      slideTimer = window.setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var target = Number(dot.getAttribute("data-slide-target"));
        showSlide(target);
        startSlides();
      });
    });

    startSlides();

    document.querySelectorAll(".movie-search-form").forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var chips = Array.prototype.slice.call(form.querySelectorAll(".filter-chip"));
      var activeFilter = "all";
      var scope = form.nextElementSibling || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card-item"));
      var empty = scope.querySelector(".empty-state");

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var groups = card.getAttribute("data-group") || "";
          var type = card.getAttribute("data-type") || "";
          var region = card.getAttribute("data-region") || "";
          var year = card.getAttribute("data-year") || "";
          var matchText = !keyword || text.indexOf(keyword) !== -1;
          var matchFilter = activeFilter === "all" || groups.indexOf(activeFilter) !== -1 || type === activeFilter || region === activeFilter || year === activeFilter;
          var show = matchText && matchFilter;

          card.classList.toggle("is-hidden", !show);

          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          applyFilter();
        });
      });
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var started = false;
      var hlsInstance = null;

      function setError() {
        player.classList.add("has-error");
        if (overlay) {
          overlay.innerHTML = "<strong>播放源暂时无法连接</strong><small>请稍后重试</small>";
        }
      }

      function attachSource() {
        if (!video || started) {
          return Promise.resolve();
        }

        var source = video.getAttribute("data-src");
        started = true;

        if (!source) {
          setError();
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setError();
            }
          });
          return Promise.resolve();
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          return Promise.resolve();
        }

        setError();
        return Promise.resolve();
      }

      function playVideo() {
        attachSource().then(function () {
          if (!video) {
            return;
          }

          var playPromise = video.play();

          if (playPromise && typeof playPromise.then === "function") {
            playPromise
              .then(function () {
                player.classList.add("is-playing");
              })
              .catch(function () {
                player.classList.remove("is-playing");
              });
          } else {
            player.classList.add("is-playing");
          }
        });
      }

      if (overlay) {
        overlay.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });

        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });

        video.addEventListener("pause", function () {
          player.classList.remove("is-playing");
        });

        video.addEventListener("error", function () {
          if (started) {
            setError();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hlsInstance && hlsInstance.destroy) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
