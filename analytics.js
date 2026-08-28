(function () {
  'use strict';

  var MEASUREMENT_ID = 'G-480Q4RXYNC';
  var CONSENT_COOKIE = 'dorus_consent';
  var analyticsEnabled = false;
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

  if (typeof window.gtag !== 'function') window.gtag = gtag;

  function isEventObject(item) {
    return item && Object.prototype.toString.call(item) === '[object Object]' && typeof item.event === 'string' && item.event;
  }

  function sendCustomEvent(item) {
    if (!analyticsEnabled || readConsent() !== 'all') return;
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

  function setConsent(value) {
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  }

  function enableAnalytics() {
    if (analyticsEnabled) {
      setConsent('granted');
      return;
    }

    analyticsEnabled = true;
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: true
    });

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEASUREMENT_ID);
    script.setAttribute('data-dorus-ga4', MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  function disableAnalytics() {
    if (analyticsEnabled) setConsent('denied');
  }

  window.addEventListener('dorus:consent', function (event) {
    var value = event && event.detail ? event.detail.value : null;
    if (value === 'all') enableAnalytics();
    else disableAnalytics();
  });

  if (readConsent() === 'all') enableAnalytics();
})();
