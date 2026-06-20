document.addEventListener('DOMContentLoaded', function () {
  const input = document.getElementById('global-search-input');
  const button = document.getElementById('global-search-button');
  const results = document.getElementById('global-search-results');

  function cardTemplate(movie) {
    const tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + tag + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a href="' + movie.link + '" class="poster-link" title="' + movie.title + '在线观看">',
      '    <figure class="poster-frame">',
      '      <img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
      '      <figcaption class="poster-fallback">' + movie.title + '</figcaption>',
      '      <span class="score-badge">' + movie.rating + '</span>',
      '      <span class="play-chip">播放</span>',
      '    </figure>',
      '    <div class="movie-card-body">',
      '      <h3>' + movie.title + '</h3>',
      '      <p>' + movie.description + '</p>',
      '      <div class="meta-row">',
      '        <span>' + movie.year + '</span>',
      '        <span>' + movie.region + '</span>',
      '        <span>' + movie.type + '</span>',
      '      </div>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function runSearch() {
    const keyword = input.value.trim().toLowerCase();

    if (!keyword) {
      results.innerHTML = '<div class="search-empty">请输入关键词开始搜索。</div>';
      return;
    }

    const matched = MOVIE_SEARCH_INDEX.filter(function (movie) {
      return [
        movie.title,
        movie.description,
        movie.summary,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category,
        movie.tags.join(' ')
      ].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 80);

    if (!matched.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配影片，请尝试更换关键词。</div>';
      return;
    }

    results.innerHTML = matched.map(cardTemplate).join('');
    results.querySelectorAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('is-broken');
      });
    });
  }

  if (button && input && results) {
    button.addEventListener('click', runSearch);
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        runSearch();
      }
    });
    results.innerHTML = '<div class="search-empty">输入片名、地区、年份、类型或剧情关键词开始搜索。</div>';
  }
});
