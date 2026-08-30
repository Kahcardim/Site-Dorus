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

  function gtag() { window.dataLayer.push(arguments); }
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

  function dataUrl(file) {
    return new URL(file + '?v=' + Date.now(), window.location.origin + window.location.pathname);
  }

  function updateGoogleRating() {
    var heroPoints = document.querySelector('.hero-points');
    var ratingBlock = heroPoints ? heroPoints.querySelector('div') : null;
    var heroRating = ratingBlock ? ratingBlock.querySelector('strong') : null;
    var heroCount = ratingBlock ? ratingBlock.querySelector('span') : null;
    var score = document.querySelector('.google-score');
    var scoreRating = score ? score.querySelector('strong') : null;
    var scoreCount = score ? score.querySelector('small') : null;

    function render(data) {
      if (!data || typeof data.rating !== 'number' || typeof data.reviews !== 'number') return;
      var ratingText = data.rating.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1});
      if (heroRating) heroRating.textContent = ratingText + ' ★';
      if (heroCount) heroCount.textContent = data.reviews + (data.reviews === 1 ? ' avaliação no Google' : ' avaliações no Google');
      if (scoreRating) scoreRating.textContent = ratingText;
      if (scoreCount) scoreCount.textContent = data.reviews + (data.reviews === 1 ? ' avaliação' : ' avaliações');
      if (ratingBlock) ratingBlock.setAttribute('aria-label', ratingText + ' de 5 no Google, com ' + data.reviews + ' avaliações');
    }

    render({rating: 4.7, reviews: 14});
    fetch(dataUrl('google-rating.json'), {cache: 'no-store', headers: {'Accept': 'application/json'}})
      .then(function (response) { if (!response.ok) throw new Error('rating unavailable'); return response.json(); })
      .then(render)
      .catch(function () {});
  }

  function updateGoogleReviews() {
    var carousel = document.querySelector('.review-carousel');
    if (!carousel) return;

    function relevance(review) {
      var text = String(review.text || '').trim();
      var rating = Number(review.rating) || 0;
      var score = rating * 100;
      if (text.length >= 20) score += 60;
      else if (text.length > 0) score += 25;
      if (/geladeira|lavadora|máquina|fogão|freezer|lava-louças|conserto|atendimento|técnic|serviço|rápid|recomendo|qualidade/i.test(text)) score += 40;
      return score;
    }

    function render(data) {
      if (!data || !Array.isArray(data.reviews)) return;
      var reviews = data.reviews
        .filter(function (review) { return Number(review.rating) >= 4; })
        .sort(function (a, b) { return relevance(b) - relevance(a); })
        .slice(0, 6);

      if (!reviews.length) return;
      carousel.innerHTML = '';

      reviews.forEach(function (review) {
        var name = String(review.name || 'Cliente').trim();
        var source = String(review.source || 'Google').trim();
        var rating = Math.max(4, Math.min(5, Math.round(Number(review.rating) || 5)));
        var text = String(review.text || '').trim();

        var article = document.createElement('article');
        article.className = 'review-card';

        var top = document.createElement('div');
        top.className = 'review-top';

        var avatar = document.createElement('div');
        avatar.className = 'review-avatar';
        avatar.textContent = name.charAt(0).toUpperCase();

        var person = document.createElement('div');
        var title = document.createElement('h3');
        title.textContent = name;
        var small = document.createElement('small');
        small.textContent = source;
        person.appendChild(title);
        person.appendChild(small);

        var googleMark = document.createElement('span');
        googleMark.className = 'google-mark';
        googleMark.textContent = 'G';

        top.appendChild(avatar);
        top.appendChild(person);
        top.appendChild(googleMark);

        var stars = document.createElement('div');
        stars.className = 'stars';
        stars.setAttribute('aria-label', rating + ' estrelas');
        stars.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        var paragraph = document.createElement('p');
        if (text) {
          paragraph.textContent = '“' + text + '”';
        } else {
          paragraph.className = 'rating-only';
          paragraph.textContent = 'Avaliou a D’orus com ' + rating + ' estrelas no Google.';
        }

        article.appendChild(top);
        article.appendChild(stars);
        article.appendChild(paragraph);
        carousel.appendChild(article);
      });
    }

    fetch(dataUrl('google-reviews.json'), {cache: 'no-store', headers: {'Accept': 'application/json'}})
      .then(function (response) { if (!response.ok) throw new Error('reviews unavailable'); return response.json(); })
      .then(render)
      .catch(function () {
        /* Se falhar, os comentários originais do HTML permanecem visíveis. */
      });
  }

  window.addEventListener('dorus:consent', function (event) {
    var value = event && event.detail ? event.detail.value : null;
    window.gtag('consent', 'update', {
      analytics_storage: value === 'all' ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
    if (value === 'all') loadGoogleTag();
  });

  function init() {
    bindLeadTracking();
    updateGoogleRating();
    updateGoogleReviews();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();
