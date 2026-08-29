(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-480Q4RXYNC';
  var CONSENT_COOKIE = 'dorus_consent';
  window.dataLayer = window.dataLayer || [];

  function readConsent() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + CONSENT_COOKIE + '=([^;]*)'));
    if (match) return decodeURIComponent(match[1]);
    try { return localStorage.getItem(CONSENT_COOKIE); } catch (e) { return null; }
  }

  function gtag() {
    window.dataLayer.push(arguments);
  }

  window.gtag = window.gtag || gtag;

  var consentGranted = readConsent() === 'all';

  window.gtag('consent', 'default', {
    analytics_storage: consentGranted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function loadGoogleTag() {
    if (document.querySelector('script[data-dorus-ga4]')) return;
    var googleTag = document.createElement('script');
    googleTag.async = true;
    googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    googleTag.setAttribute('data-dorus-ga4', MEASUREMENT_ID);
    document.head.appendChild(googleTag);
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID);
  }

  if (consentGranted) loadGoogleTag();

  function sendLeadEvent(name, params) {
    if (readConsent() !== 'all') return;
    params = params || {};
    params.page_path = params.page_path || window.location.pathname;
    window.gtag('event', name, params);
  }

  function eventNameForLink(link) {
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href.includes('wa.me/') || href.includes('whatsapp')) return 'clique_whatsapp';
    if (href.startsWith('tel:')) return 'clique_telefone';
    if (href.includes('instagram.com')) return 'clique_instagram';
    if (href.includes('/agendamento') || href === 'agendamento/' || href === '../agendamento/' || href === './agendamento/') return 'clique_agendamento';
    return null;
  }

  function bindLeadTracking() {
    document.querySelectorAll('a[href]').forEach(function (link) {
      if (link.dataset.ga4LeadBound === 'true') return;
      var eventName = eventNameForLink(link);
      if (!eventName) return;

      link.dataset.ga4LeadBound = 'true';
      link.addEventListener('click', function () {
        sendLeadEvent(eventName, {
          link_url: link.href,
          link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().slice(0, 100)
        });
      });
    });

    var scheduleForm = document.querySelector('[data-schedule-form]');
    if (scheduleForm && scheduleForm.dataset.ga4LeadBound !== 'true') {
      scheduleForm.dataset.ga4LeadBound = 'true';
      scheduleForm.addEventListener('submit', function () {
        if (!scheduleForm.checkValidity()) return;
        var equipment = scheduleForm.querySelector('[name="equipamento"]');
        var period = scheduleForm.querySelector('[name="periodo"]');
        sendLeadEvent('envio_agendamento_whatsapp', {
          equipamento: equipment ? equipment.value : '',
          periodo: period ? period.value : ''
        });
      });
    }
  }

  function updateGoogleRating() {
    var heroPoints = document.querySelector('.hero-points');
    if (!heroPoints) return;

    var ratingBlock = heroPoints.querySelector('div');
    if (!ratingBlock) return;

    var ratingValue = ratingBlock.querySelector('strong');
    var reviewCount = ratingBlock.querySelector('span');
    if (!ratingValue || !reviewCount) return;

    function render(data) {
      if (!data || typeof data.rating !== 'number' || typeof data.reviews !== 'number') return;
      ratingValue.textContent = data.rating.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' ★';
      reviewCount.textContent = data.reviews + (data.reviews === 1 ? ' avaliação no Google' : ' avaliações no Google');
      ratingBlock.setAttribute('aria-label', data.rating.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1}) + ' de 5 no Google, com ' + data.reviews + ' avaliações');
    }

    render({rating: 4.7, reviews: 14});

    fetch(new URL('google-rating.json?v=' + Date.now(), window.location.origin + window.location.pathname), {
      cache: 'no-store',
      headers: {'Accept': 'application/json'}
    })
      .then(function (response) {
        if (!response.ok) throw new Error('rating unavailable');
        return response.json();
      })
      .then(render)
      .catch(function () {
        /* Mantém o último valor confiável sem afetar o layout. */
      });
  }

  window.addEventListener('dorus:consent', function (event) {
    var value = event && event.detail ? event.detail.value : null;
    window.gtag('consent', 'update', {
      analytics_storage: value === 'all' ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (value === 'all') loadGoogleTag();
  });

  function init() {
    bindLeadTracking();
    updateGoogleRating();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();
