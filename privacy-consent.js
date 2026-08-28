(function () {
  'use strict';

  var COOKIE_NAME = 'dorus_consent';
  var MAX_AGE = 60 * 60 * 24 * 180;

  function siteRoot() {
    var script = document.querySelector('script[src*="site.js"]');
    return script && script.src ? new URL('.', script.src) : new URL('./', location.href);
  }

  function readConsent() {
    var match = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAME + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function saveConsent(value) {
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(value) + '; Path=/; Max-Age=' + MAX_AGE + '; SameSite=Lax' + secure;
    try { localStorage.setItem(COOKIE_NAME, value); } catch (e) {}
    document.documentElement.dataset.cookieConsent = value;
    window.dispatchEvent(new CustomEvent('dorus:consent', {detail: {value: value}}));
  }

  function createBanner() {
    if (document.querySelector('[data-cookie-banner]')) return;

    var privacyUrl = new URL('privacidade/', siteRoot()).href;
    var banner = document.createElement('section');
    banner.className = 'cookie-banner';
    banner.setAttribute('data-cookie-banner', '');
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Preferências de cookies');
    banner.innerHTML = [
      '<div class="cookie-copy">',
      '<strong>Privacidade e cookies</strong>',
      '<p>Usamos apenas recursos necessários para o funcionamento do site e para lembrar suas preferências. Você pode permitir recursos opcionais quando forem adicionados.</p>',
      '<a href="' + privacyUrl + '">Ver política de privacidade</a>',
      '</div>',
      '<div class="cookie-actions">',
      '<button type="button" class="cookie-essential" data-cookie-essential>Somente necessários</button>',
      '<button type="button" class="cookie-accept" data-cookie-accept>Aceitar todos</button>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    function close(value) {
      saveConsent(value);
      banner.remove();
    }

    banner.querySelector('[data-cookie-essential]').addEventListener('click', function () { close('essential'); });
    banner.querySelector('[data-cookie-accept]').addEventListener('click', function () { close('all'); });
  }

  function openSettings() {
    var old = document.querySelector('[data-cookie-banner]');
    if (old) old.remove();
    createBanner();
    setTimeout(function () {
      var first = document.querySelector('[data-cookie-banner] button');
      if (first) first.focus();
    }, 0);
  }

  function createFooterControls() {
    var footer = document.querySelector('.footer');
    if (!footer) return;

    var privacyUrl = new URL('privacidade/', siteRoot()).href;
    var lastGroup = footer.querySelector('.footer-links:last-of-type');
    if (lastGroup && !lastGroup.querySelector('a[href*="privacidade"]')) {
      var privacyLink = document.createElement('a');
      privacyLink.href = privacyUrl;
      privacyLink.textContent = 'Privacidade';
      lastGroup.appendChild(privacyLink);
    }

    var controls = footer.querySelector('.footer-bottom') || footer.querySelector('.footer-grid') || footer;
    if (controls.querySelector('[data-cookie-settings]')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'cookie-settings-link';
    button.setAttribute('data-cookie-settings', '');
    button.textContent = 'Configurar cookies';
    button.addEventListener('click', openSettings);
    controls.appendChild(button);
  }

  function scheduleSecondaryControls() {
    if ('requestIdleCallback' in window) requestIdleCallback(createFooterControls, {timeout: 1600});
    else setTimeout(createFooterControls, 500);
  }

  function init() {
    var consent = readConsent();
    if (!consent) {
      try { consent = localStorage.getItem(COOKIE_NAME); } catch (e) {}
    }
    if (consent) document.documentElement.dataset.cookieConsent = consent;
    else createBanner();
    scheduleSecondaryControls();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
