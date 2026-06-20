(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (menuButton && menu) {
            menuButton.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var target = form.getAttribute("data-search-url") || "search.html";
                var query = input ? input.value.trim() : "";
                if (query) {
                    window.location.href = target + "?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        });

        document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
            var current = 0;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        });

        var filterInput = document.querySelector("[data-filter-input]");
        var yearSelect = document.querySelector("[data-filter-select='year']");
        var typeSelect = document.querySelector("[data-filter-select='type']");
        var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

        function applyFilters() {
            var keyword = normalize(filterInput && filterInput.value);
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            filterCards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-filter"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = !year || cardYear === year;
                var matchedType = !type || cardType === type;
                card.classList.toggle("is-hidden", !(matchedKeyword && matchedYear && matchedType));
            });
        }

        [filterInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        var searchForm = document.querySelector("[data-search-page-form]");
        var searchInput = document.querySelector("[data-search-page-input]");
        var searchResults = document.querySelector("[data-search-results]");

        function movieCard(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");
            return [
                "<article class=\"movie-card\">",
                "<a class=\"movie-poster\" href=\"" + escapeHtml(item.url) + "\">",
                "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
                "<span class=\"poster-shade\"></span>",
                "<span class=\"play-mark\">▶</span>",
                "</a>",
                "<div class=\"movie-card-body\">",
                "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span></div>",
                "<h2><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h2>",
                "<p>" + escapeHtml(item.summary) + "</p>",
                "<div class=\"tag-row\">" + tags + "</div>",
                "</div>",
                "</article>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function runSearch(query) {
            if (!searchResults || !window.SearchIndex) {
                return;
            }
            var text = normalize(query);
            var matches = window.SearchIndex.filter(function (item) {
                var haystack = normalize([
                    item.title,
                    item.year,
                    item.region,
                    item.type,
                    item.genre,
                    item.category,
                    item.summary,
                    (item.tags || []).join(" ")
                ].join(" "));
                return !text || haystack.indexOf(text) !== -1;
            }).slice(0, 120);
            searchResults.innerHTML = matches.map(movieCard).join("");
        }

        if (searchInput && searchResults) {
            var params = new URLSearchParams(window.location.search);
            var currentQuery = params.get("q") || "";
            searchInput.value = currentQuery;
            runSearch(currentQuery);
            searchInput.addEventListener("input", function () {
                runSearch(searchInput.value);
            });
        }

        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                runSearch(searchInput ? searchInput.value : "");
            });
        }

        document.querySelectorAll("[data-player]").forEach(function (wrap) {
            var video = wrap.querySelector("video");
            var trigger = wrap.querySelector("[data-play-trigger]");
            var message = wrap.querySelector("[data-player-message]");
            var stream = wrap.getAttribute("data-stream");
            var hlsInstance = null;

            function setMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                wrap.classList.add("has-message");
                window.setTimeout(function () {
                    wrap.classList.remove("has-message");
                }, 2600);
            }

            function attachStream() {
                if (!video || !stream) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage("播放暂时不可用，请稍后重试");
                        }
                    });
                } else {
                    video.src = stream;
                }
            }

            function startPlay() {
                if (!video) {
                    return;
                }
                wrap.classList.add("is-playing");
                var playResult = video.play();
                if (playResult && playResult.catch) {
                    playResult.catch(function () {
                        wrap.classList.remove("is-playing");
                        setMessage("点击播放器继续观看");
                    });
                }
            }

            attachStream();

            if (trigger) {
                trigger.addEventListener("click", startPlay);
            }
            if (video) {
                video.addEventListener("play", function () {
                    wrap.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    if (!video.ended) {
                        wrap.classList.remove("is-playing");
                    }
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
