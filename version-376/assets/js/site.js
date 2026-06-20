document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (toggle && mobileNav) {
        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            if (dotIndex === activeIndex) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5600);
    }

    var searchInput = document.querySelector("[data-library-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

    if (searchInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function filterCards() {
            var key = normalize(searchInput.value);

            cards.forEach(function (card) {
                var source = normalize(card.getAttribute("data-search") || card.textContent);
                card.hidden = key ? source.indexOf(key) === -1 : false;
            });
        }

        searchInput.addEventListener("input", filterCards);
        filterCards();
    }
});
