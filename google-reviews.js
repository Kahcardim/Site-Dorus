(function () {
  'use strict';

  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbySQLF-zmEA9Pjx3-or9ZYb84FQYXzphMmDLm464tWWKv7Zial1dZoTcz6qw8pwZPNh/exec';
  var REQUEST_TIMEOUT = 12000;

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
    var requestId = 'dorus-reviews-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    var timer;
    var finished = false;

    iframe.src = WEB_APP_URL + '?action=bridge&_=' + Date.now();
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Atualização segura das avaliações do Google');
    iframe.style.position = 'absolute';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    function cleanup() {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      window.removeEventListener('message', receiveMessage);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }

    function receiveMessage(event) {
      if (event.source !== iframe.contentWindow) return;

      var message = event.data || {};
      if (message.source !== 'dorus-calendar-bridge') return;

      if (message.type === 'ready') {
        iframe.contentWindow.postMessage({
          source: 'dorus-site',
          requestId: requestId,
          type: 'reviews',
          payload: {}
        }, '*');
        return;
      }

      if (message.requestId !== requestId) return;

      if (!message.ok) {
        console.error('[Dorus Google Reviews] ' + (message.error || 'Falha ao consultar avaliações.'));
        cleanup();
        return;
      }

      if (!applyReviews(message.data)) {
        console.error('[Dorus Google Reviews] Resposta inválida recebida do Apps Script.', message.data);
      }
      cleanup();
    }

    window.addEventListener('message', receiveMessage);
    document.body.appendChild(iframe);

    timer = window.setTimeout(function () {
      console.error('[Dorus Google Reviews] Tempo limite ao aguardar resposta do Apps Script.');
      cleanup();
    }, REQUEST_TIMEOUT);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
