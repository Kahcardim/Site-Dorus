(function () {
  'use strict';

  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbySQLF-zmEA9Pjx3-or9ZYb84FQYXzphMmDLm464tWWKv7Zial1dZoTcz6qw8pwZPNh/exec';
  var REQUEST_TIMEOUT = 10000;

  function applyReviews(data) {
    var rating = Number(data && data.rating);
    var count = Number(data && data.userRatingCount);
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
    return true;
  }

  function init() {
    if (!document.querySelector('[data-google-rating]')) return;

    var callbackName = '__dorusGoogleReviews' + Date.now() + Math.random().toString(36).slice(2);
    var script = document.createElement('script');
    var timer;
    var finished = false;

    function cleanup() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = function (data) {
      applyReviews(data);
      cleanup();
    };

    script.src = WEB_APP_URL + '?action=reviews&callback=' + encodeURIComponent(callbackName) + '&_=' + Date.now();
    script.async = true;
    script.onerror = cleanup;
    document.head.appendChild(script);

    timer = window.setTimeout(cleanup, REQUEST_TIMEOUT);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
