(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-480Q4RXYNC';
  var CONSENT_COOKIE = 'dorus_consent';
  var IS_LOCAL_PREVIEW = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  window.dataLayer = window.dataLayer || [];

  function readConsent() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + CONSENT_COOKIE + '=([^;]*)'));
    if (match) return decodeURIComponent(match[1]);
    try { return localStorage.getItem(CONSENT_COOKIE); } catch (e) { return null; }
  }

  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var consentGranted = readConsent() === 'all' && !IS_LOCAL_PREVIEW;
  window.gtag('consent', 'default', {
    analytics_storage: consentGranted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function loadGoogleTag() {
    if (IS_LOCAL_PREVIEW) return;
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

  function pageType() {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return 'home';
    if (path === '/sobre') return 'about';
    if (path === '/servicos') return 'service_listing';
    if (path.indexOf('/servicos/') === 0) return 'service_detail';
    if (path === '/curiosidades') return 'guide_listing';
    if (path.indexOf('/curiosidades/') === 0) return 'guide_detail';
    if (path === '/agendamento') return 'schedule';
    if (path === '/fale-conosco') return 'contact';
    return 'other';
  }

  function pageEquipment() {
    var label = document.querySelector('.service-hero-copy .eyebrow');
    if (label) return label.textContent.trim().toLowerCase().slice(0, 80);
    return '';
  }

  function ctaLocation(link) {
    if (link.closest('.whatsapp-float')) return 'floating_whatsapp';
    if (link.closest('.page-closing-cta')) return 'page_closing';
    if (link.closest('.service-detail-cta-professional')) return 'service_detail_closing';
    if (link.closest('.service-cta-professional')) return 'service_listing_closing';
    if (link.closest('.service-hero-copy,.hero-copy')) return 'hero';
    if (link.closest('.footer')) return 'footer';
    if (link.closest('.header,.topbar')) return 'header';
    if (link.closest('.related-services')) return 'related_services';
    return 'content';
  }

  function sendEvent(name, params) {
    if (IS_LOCAL_PREVIEW || readConsent() !== 'all') return false;
    params = params || {};
    params.page_path = params.page_path || window.location.pathname;
    params.page_type = params.page_type || pageType();
    if (!params.equipment) params.equipment = pageEquipment();
    window.gtag('event', name, params);
    return true;
  }

  function trackLead(method, params) {
    params = params || {};
    params.method = method;
    params.lead_source = params.lead_source || ('website_' + method);
    return sendEvent('generate_lead', params);
  }

  window.dorusAnalytics = {
    track: sendEvent,
    trackLead: trackLead,
    pageType: pageType,
    isLocalPreview: IS_LOCAL_PREVIEW
  };

  function linkType(link) {
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (href.includes('wa.me/') || href.includes('whatsapp')) return 'whatsapp';
    if (href.startsWith('tel:')) return 'phone';
    if (href.includes('instagram.com')) return 'instagram';
    try {
      if (new URL(link.href, window.location.href).pathname.replace(/\/+$/, '') === '/agendamento') return 'schedule';
    } catch (e) {}
    return null;
  }

  function bindLeadTracking() {
    if (document.documentElement.dataset.dorusGa4Delegated === 'true') return;
    document.documentElement.dataset.dorusGa4Delegated = 'true';

    document.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target : null;
      var link = target ? target.closest('a[href]') : null;
      if (!link) return;
      var type = linkType(link);
      if (!type) return;

      var params = {
        cta_type: type,
        cta_location: ctaLocation(link),
        link_url: link.href.slice(0, 500),
        link_text: (link.textContent || link.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 100)
      };
      sendEvent('cta_click', params);

      if (type === 'whatsapp' || type === 'phone') {
        trackLead(type, params);
      } else if (type === 'schedule') {
        sendEvent('begin_schedule', params);
      } else if (type === 'instagram') {
        params.social_network = 'instagram';
        sendEvent('social_click', params);
      }
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once: true});
  } else {
    init();
  }
})();
