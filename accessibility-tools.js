(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var STORAGE_KEY = 'dorus_accessibility_preferences';
  var speechRecognition = null;
  var isListening = false;
  var currentUtterance = null;

  function loadPreferences() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function savePreferences(prefs) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {}
  }

  var prefs = Object.assign({fontScale: 100, highContrast: false, reduceMotion: false}, loadPreferences());

  function applyPreferences() {
    root.style.setProperty('--user-font-scale', String(prefs.fontScale / 100));
    root.classList.toggle('a11y-high-contrast', !!prefs.highContrast);
    root.classList.toggle('a11y-reduce-motion', !!prefs.reduceMotion);
  }

  function announce(message) {
    var status = document.querySelector('[data-a11y-status]');
    if (status) status.textContent = message;
  }

  function setFontScale(value) {
    prefs.fontScale = Math.max(90, Math.min(130, value));
    applyPreferences();
    savePreferences(prefs);
    announce('Tamanho do texto em ' + prefs.fontScale + ' por cento.');
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      currentUtterance = null;
      announce('Leitura em voz alta interrompida.');
    }
  }

  function speakMainContent() {
    if (!('speechSynthesis' in window)) {
      announce('Leitura em voz alta não é suportada neste navegador.');
      return;
    }

    stopSpeech();
    var main = document.querySelector('main');
    if (!main) return;

    var text = Array.from(main.querySelectorAll('h1,h2,h3,p,summary,li'))
      .filter(function (el) {
        var style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })
      .map(function (el) { return el.textContent.trim(); })
      .filter(Boolean)
      .join('. ')
      .replace(/\s+/g, ' ')
      .slice(0, 12000);

    currentUtterance = new SpeechSynthesisUtterance(text);
    currentUtterance.lang = 'pt-BR';
    currentUtterance.rate = 1;
    currentUtterance.pitch = 1;
    currentUtterance.onstart = function () { announce('Leitura em voz alta iniciada.'); };
    currentUtterance.onend = function () { announce('Leitura em voz alta concluída.'); currentUtterance = null; };
    currentUtterance.onerror = function () { announce('Não foi possível continuar a leitura em voz alta.'); currentUtterance = null; };
    window.speechSynthesis.speak(currentUtterance);
  }

  function navigateTo(path) {
    var script = document.querySelector('script[src*="site.js"]');
    var rootUrl = script && script.src ? new URL('.', script.src) : new URL('./', location.href);
    location.href = new URL(path, rootUrl).href;
  }

  function handleVoiceCommand(raw) {
    var command = String(raw || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!command) return;
    announce('Comando reconhecido: ' + raw + '.');

    if (command.includes('inicio') || command.includes('pagina inicial')) return navigateTo('');
    if (command.includes('sobre')) return navigateTo('sobre/');
    if (command.includes('servico')) return navigateTo('servicos/');
    if (command.includes('curiosidade')) return navigateTo('curiosidades/');
    if (command.includes('agendamento') || command.includes('agendar')) return navigateTo('agendamento/');
    if (command.includes('fale conosco') || command.includes('contato')) return navigateTo('fale-conosco/');
    if (command.includes('privacidade') || command.includes('cookie')) return navigateTo('privacidade/');
    if (command.includes('aumentar') && command.includes('texto')) return setFontScale(prefs.fontScale + 10);
    if ((command.includes('diminuir') || command.includes('reduzir')) && command.includes('texto')) return setFontScale(prefs.fontScale - 10);
    if (command.includes('contraste')) {
      prefs.highContrast = !prefs.highContrast;
      applyPreferences();
      savePreferences(prefs);
      return announce('Alto contraste ' + (prefs.highContrast ? 'ativado.' : 'desativado.'));
    }
    if (command.includes('ler pagina') || command.includes('leia a pagina') || command.includes('ler conteudo')) return speakMainContent();
    if (command.includes('parar leitura') || command.includes('pare a leitura')) return stopSpeech();

    announce('Comando não reconhecido. Tente dizer início, serviços, agendamento, contato, aumentar texto ou ler página.');
  }

  function stopListening() {
    if (speechRecognition && isListening) {
      try { speechRecognition.stop(); } catch (e) {}
    }
  }

  function startListening() {
    var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      announce('Navegação por voz não é suportada neste navegador. Use leitura em voz alta ou navegação pelo teclado.');
      return;
    }

    stopSpeech();
    speechRecognition = new Recognition();
    speechRecognition.lang = 'pt-BR';
    speechRecognition.interimResults = false;
    speechRecognition.continuous = false;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.onstart = function () {
      isListening = true;
      body.classList.add('is-voice-listening');
      announce('Microfone ativo. Diga um comando.');
    };
    speechRecognition.onresult = function (event) {
      var transcript = event.results && event.results[0] && event.results[0][0] ? event.results[0][0].transcript : '';
      handleVoiceCommand(transcript);
    };
    speechRecognition.onerror = function (event) {
      var messages = {
        'not-allowed': 'Permissão de microfone negada.',
        'no-speech': 'Nenhum comando foi ouvido.',
        'audio-capture': 'Não foi possível acessar o microfone.'
      };
      announce(messages[event.error] || 'Não foi possível usar a navegação por voz.');
    };
    speechRecognition.onend = function () {
      isListening = false;
      body.classList.remove('is-voice-listening');
    };

    try { speechRecognition.start(); } catch (e) { announce('A navegação por voz já está ativa.'); }
  }

  function createTools() {
    if (document.querySelector('[data-a11y-launcher]')) return;

    var wrapper = document.createElement('div');
    wrapper.className = 'a11y-tools';
    wrapper.innerHTML = [
      '<button type="button" class="a11y-launcher" data-a11y-launcher aria-expanded="false" aria-controls="a11y-panel" aria-label="Abrir ferramentas de acessibilidade">',
      '<span aria-hidden="true">♿</span><span>Acessibilidade</span>',
      '</button>',
      '<div class="a11y-backdrop" data-a11y-backdrop hidden aria-hidden="true"></div>',
      '<section class="a11y-panel" id="a11y-panel" data-a11y-panel hidden role="dialog" aria-modal="true" aria-labelledby="a11y-title">',
      '<div class="a11y-panel-head"><strong id="a11y-title">Acessibilidade</strong><button type="button" data-a11y-close aria-label="Fechar ferramentas de acessibilidade">×</button></div>',
      '<p class="a11y-help">Ajuste o site do jeito que for mais confortável para você.</p>',
      '<div class="a11y-group" role="group" aria-label="Tamanho do texto">',
      '<button type="button" data-a11y-font-down aria-label="Diminuir texto">A−</button>',
      '<span data-a11y-font-value aria-live="polite">100%</span>',
      '<button type="button" data-a11y-font-up aria-label="Aumentar texto">A+</button>',
      '</div>',
      '<button type="button" class="a11y-action" data-a11y-contrast>Alto contraste</button>',
      '<button type="button" class="a11y-action" data-a11y-motion>Reduzir animações</button>',
      '<button type="button" class="a11y-action" data-a11y-read>Ler página em voz alta</button>',
      '<button type="button" class="a11y-action" data-a11y-stop>Parar leitura</button>',
      '<button type="button" class="a11y-action a11y-voice" data-a11y-voice>Navegação por voz</button>',
      '<p class="a11y-voice-help">Você pode dizer “serviços”, “agendamento”, “aumentar texto” ou “ler página”.</p>',
      '<button type="button" class="a11y-reset" data-a11y-reset>Restaurar padrão</button>',
      '<p class="sr-only" data-a11y-status aria-live="polite"></p>',
      '</section>'
    ].join('');

    document.body.appendChild(wrapper);

    var launcher = wrapper.querySelector('[data-a11y-launcher]');
    var panel = wrapper.querySelector('[data-a11y-panel]');
    var backdrop = wrapper.querySelector('[data-a11y-backdrop]');
    var fontValue = wrapper.querySelector('[data-a11y-font-value]');

    function syncUi() {
      fontValue.textContent = prefs.fontScale + '%';
      wrapper.querySelector('[data-a11y-contrast]').setAttribute('aria-pressed', String(!!prefs.highContrast));
      wrapper.querySelector('[data-a11y-motion]').setAttribute('aria-pressed', String(!!prefs.reduceMotion));
    }

    function openPanel() {
      panel.hidden = false;
      backdrop.hidden = false;
      launcher.setAttribute('aria-expanded', 'true');
      body.classList.add('a11y-panel-open');
      syncUi();
      wrapper.querySelector('[data-a11y-close]').focus();
    }

    function closePanel() {
      panel.hidden = true;
      backdrop.hidden = true;
      launcher.setAttribute('aria-expanded', 'false');
      body.classList.remove('a11y-panel-open');
      stopListening();
      launcher.focus();
    }

    function trapFocus(event) {
      if (event.key !== 'Tab' || panel.hidden) return;
      var focusable = Array.from(panel.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    launcher.addEventListener('click', function () { panel.hidden ? openPanel() : closePanel(); });
    backdrop.addEventListener('click', closePanel);
    wrapper.querySelector('[data-a11y-close]').addEventListener('click', closePanel);
    wrapper.querySelector('[data-a11y-font-down]').addEventListener('click', function () { setFontScale(prefs.fontScale - 10); syncUi(); });
    wrapper.querySelector('[data-a11y-font-up]').addEventListener('click', function () { setFontScale(prefs.fontScale + 10); syncUi(); });
    wrapper.querySelector('[data-a11y-contrast]').addEventListener('click', function () {
      prefs.highContrast = !prefs.highContrast;
      applyPreferences(); savePreferences(prefs); syncUi();
      announce('Alto contraste ' + (prefs.highContrast ? 'ativado.' : 'desativado.'));
    });
    wrapper.querySelector('[data-a11y-motion]').addEventListener('click', function () {
      prefs.reduceMotion = !prefs.reduceMotion;
      applyPreferences(); savePreferences(prefs); syncUi();
      announce('Redução de animações ' + (prefs.reduceMotion ? 'ativada.' : 'desativada.'));
    });
    wrapper.querySelector('[data-a11y-read]').addEventListener('click', speakMainContent);
    wrapper.querySelector('[data-a11y-stop]').addEventListener('click', stopSpeech);
    wrapper.querySelector('[data-a11y-voice]').addEventListener('click', function () { isListening ? stopListening() : startListening(); });
    wrapper.querySelector('[data-a11y-reset]').addEventListener('click', function () {
      prefs = {fontScale: 100, highContrast: false, reduceMotion: false};
      applyPreferences(); savePreferences(prefs); syncUi(); stopSpeech(); stopListening();
      announce('Preferências de acessibilidade restauradas.');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        event.preventDefault();
        closePanel();
        return;
      }
      trapFocus(event);
    });

    syncUi();
  }

  applyPreferences();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createTools);
  else createTools();
})();
