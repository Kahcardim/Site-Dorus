(function () {
  'use strict';

  var root = document.documentElement;
  var queries = {
    reducedMotion: '(prefers-reduced-motion: reduce)',
    moreContrast: '(prefers-contrast: more)',
    forcedColors: '(forced-colors: active)',
    reducedTransparency: '(prefers-reduced-transparency: reduce)',
    darkScheme: '(prefers-color-scheme: dark)',
    coarsePointer: '(pointer: coarse)'
  };

  function attributeName(name) {
    return 'data-a11y-' + name.replace(/[A-Z]/g, function (letter) {
      return '-' + letter.toLowerCase();
    });
  }

  function reflectPreference(name, mediaQuery) {
    root.setAttribute(attributeName(name), mediaQuery.matches ? 'true' : 'false');
  }

  Object.keys(queries).forEach(function (name) {
    var mediaQuery = window.matchMedia(queries[name]);
    var update = function () { reflectPreference(name, mediaQuery); };

    update();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(update);
    }
  });

  /* Remove vestígios da ferramenta antiga caso uma página seja restaurada do cache. */
  root.classList.remove('a11y-high-contrast', 'a11y-reduce-motion');
  root.setAttribute('data-a11y-native', 'ready');

  function removeLegacyWidget() {
    document.querySelectorAll('.a11y-tools,[data-a11y-launcher],[data-a11y-panel]').forEach(function (node) {
      node.remove();
    });
    document.body.classList.remove('a11y-panel-open', 'is-voice-listening');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeLegacyWidget, {once: true});
  } else {
    removeLegacyWidget();
  }
})();
