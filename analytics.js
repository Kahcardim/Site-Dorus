(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-480Q4RXYNC';
  var CONSENT_COOKIE = 'dorus_consent';
  var dataLayer = window.dataLayer = window.dataLayer || [];
  var nativePush = dataLayer.push.bind(dataLayer);

  function readConsent() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + CONSENT_COOKIE + '=([^;]*)'));
    if (match) return decodeURIComponent(match[1]);
    try { return localStorage.getItem(CONSENT_COOKIE); } catch (e) { return null; }
  }

  function gtag() {
    nativePush(arguments);
  }

  window.gtag = window.gtag || gtag;

  /* Google tag (gtag.js) — equivalente ao snippet oficial do GA4. */
  var googleTag = document.createElement('script');
  googleTag.async = true;
  googleTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
  googleTag.setAttribute('data-dorus-ga4', MEASUREMENT_ID);
  document.head.appendChild(googleTag);

  var consentGranted = readConsent() === 'all';

  window.gtag('consent', 'default', {
    analytics_storage: consentGranted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  function isEventObject(item) {
    return item && Object.prototype.toString.call(item) === '[object Object]' && typeof item.event === 'string' && item.event;
  }

  function sendCustomEvent(item) {
    if (readConsent() !== 'all') return;
    var params = {};
    Object.keys(item).forEach(function (key) {
      if (key !== 'event') params[key] = item[key];
    });
    window.gtag('event', item.event, params);
  }

  dataLayer.push = function () {
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (item) {
      nativePush(item);
      if (isEventObject(item)) sendCustomEvent(item);
    });
    return dataLayer.length;
  };

  window.addEventListener('dorus:consent', function (event) {
    var value = event && event.detail ? event.detail.value : null;
    window.gtag('consent', 'update', {
      analytics_storage: value === 'all' ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  });
})();
