document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-broken');
    });
  });

  const carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const section = scope.closest('.content-section') || document;
    const input = section.querySelector('[data-filter-input]');
    const category = section.querySelector('[data-filter-category]');
    const type = section.querySelector('[data-filter-type]');
    const year = section.querySelector('[data-filter-year]');
    const cards = Array.from(scope.children);

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const selectedCategory = category ? category.value : '';
      const selectedType = type ? type.value : '';
      const selectedYear = year ? year.value : '';

      cards.forEach(function (card) {
        const text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();

        const cardYear = card.getAttribute('data-year') || '';
        const yearNumber = Number((cardYear.match(/\d{4}/) || ['0'])[0]);
        const filterYearNumber = Number(selectedYear || '0');
        const matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        const matchCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
        const matchType = !selectedType || card.getAttribute('data-type') === selectedType;
        const matchYear = !selectedYear || yearNumber >= filterYearNumber;

        card.classList.toggle('hidden-by-filter', !(matchKeyword && matchCategory && matchType && matchYear));
      });
    }

    [input, category, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });
});
