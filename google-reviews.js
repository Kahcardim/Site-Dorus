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

    var iframe = document.createElement('iframe');
    var timer;
    iframe.src = WEB_APP_URL + '?action=bridge';
    iframe.hidden = true;
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Atualização segura das avaliações do Google');
    document.body.appendChild(iframe);

    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener('message', receiveMessage);
      iframe.remove();
    }

    function receiveMessage(event) {
      if (event.source !== iframe.contentWindow) return;
      var message = event.data || {};
      if (message.source !== 'dorus-calendar-bridge') return;

      if (message.type === 'ready') {
        iframe.contentWindow.postMessage({
          source: 'dorus-site',
          requestId: 'dorus-reviews-' + Date.now(),
          type: 'reviews',
          payload: {}
        }, '*');
        return;
      }

      if (message.requestId && message.requestId.indexOf('dorus-reviews-') === 0) {
        if (message.ok) applyReviews(message.data);
        cleanup();
      }
    }

    window.addEventListener('message', receiveMessage);
    timer = window.setTimeout(cleanup, REQUEST_TIMEOUT);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
