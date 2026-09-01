(function () {
  'use strict';

  function applyReviews(data) {
    var rating = Number(data && data.rating);
    var count = Number(data && data.reviews);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) return false;
    if (!Number.isInteger(count) || count < 0) return false;

    var localizedRating = rating.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });
    var localizedCount = count.toLocaleString('pt-BR');

    document.querySelectorAll('[data-google-rating]').forEach(function (element) {
      element.textContent = localizedRating;
    });
    document.querySelectorAll('[data-google-review-count]').forEach(function (element) {
      element.textContent = localizedCount;
    });

    var score = document.querySelector('.google-score');
    if (score) {
      var strong = score.querySelector('strong');
      var small = score.querySelector('small');
      if (strong) strong.textContent = localizedRating;
      if (small) small.textContent = localizedCount + (count === 1 ? ' avaliação' : ' avaliações');
    }
    return true;
  }

  function init() {
    if (!document.querySelector('[data-google-rating]')) return;

    var url = new URL('google-rating.json', window.location.origin + '/');
    url.searchParams.set('v', Date.now().toString());

    fetch(url.href, {
      cache: 'no-store',
      headers: {Accept: 'application/json'}
    })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (!applyReviews(data)) {
          console.error('[Dorus Google Reviews] Arquivo google-rating.json inválido.', data);
        }
      })
      .catch(function (error) {
        console.error('[Dorus Google Reviews] Não foi possível carregar google-rating.json.', error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();
