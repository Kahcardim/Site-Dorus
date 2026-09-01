(function () {
  'use strict';

  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbySQLF-zmEA9Pjx3-or9ZYb84FQYXzphMmDLm464tWWKv7Zial1dZoTcz6qw8pwZPNh/exec';
  var BRIDGE_URL = WEB_APP_URL + '?action=bridge';
  var AVAILABILITY_URL = WEB_APP_URL + '?action=availability&date=';
  var REQUEST_TIMEOUT = 10000;

  function init() {
    var form = document.querySelector('[data-schedule-form]');
    if (!form) return;

    var dateInput = form.querySelector('input[name="data"]');
    var periodSelect = form.querySelector('select[name="periodo"]');
    var status = form.querySelector('[data-schedule-status]');
    var actionLink = form.querySelector('[data-calendar-link]');
    var submitButton = form.querySelector('button[type="submit"]');
    if (!dateInput || !periodSelect || !status || !submitButton) return;

    var bridgeReady = false;
    var pending = new Map();
    var iframe = document.createElement('iframe');
    iframe.src = BRIDGE_URL;
    iframe.className = 'calendar-bridge-frame';
    iframe.style.position = 'absolute';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.left = '-10000px';
    iframe.style.top = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.tabIndex = -1;
    // Impede que sessões Google do visitante alterem a rota pública do Apps
    // Script quando há várias contas conectadas no mesmo navegador.
    iframe.setAttribute('credentialless', '');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Integração segura com a agenda D’orus');

    function setStatus(message, isError) {
      status.hidden = false;
      status.textContent = message;
      status.classList.toggle('is-error', Boolean(isError));
    }

    function resetStatus() {
      status.hidden = true;
      status.textContent = '';
      status.classList.remove('is-error');
    }

    function bridgeRequest(type, payload) {
      return new Promise(function (resolve, reject) {
        if (!bridgeReady || !iframe.contentWindow) {
          reject(new Error('Agenda online indisponível.'));
          return;
        }

        var requestId = 'dorus-' + Date.now() + '-' + Math.random().toString(36).slice(2);
        var timer = window.setTimeout(function () {
          pending.delete(requestId);
          reject(new Error('A agenda demorou para responder.'));
        }, REQUEST_TIMEOUT);

        pending.set(requestId, {
          resolve: resolve,
          reject: reject,
          timer: timer
        });

        iframe.contentWindow.postMessage({
          source: 'dorus-site',
          requestId: requestId,
          type: type,
          payload: payload || {}
        }, '*');
      });
    }

    window.addEventListener('message', function (event) {
      if (event.source !== iframe.contentWindow) return;
      var message = event.data || {};
      if (message.source !== 'dorus-calendar-bridge') return;

      if (message.type === 'ready') {
        bridgeReady = true;
        periodSelect.dataset.calendarMode = 'slots';
        var label = periodSelect.closest('label');
        if (label && label.firstChild && label.firstChild.nodeType === Node.TEXT_NODE) {
          label.firstChild.nodeValue = 'Período disponível';
        }
        submitButton.textContent = 'Solicitar atendimento e continuar no WhatsApp';
        if (dateInput.value) loadAvailability();
        return;
      }

      if (!message.requestId || !pending.has(message.requestId)) return;
      var request = pending.get(message.requestId);
      pending.delete(message.requestId);
      window.clearTimeout(request.timer);

      if (message.ok) request.resolve(message.data);
      else request.reject(new Error(message.error || 'Não foi possível consultar a agenda.'));
    });

    // Registra o listener antes de carregar a ponte para não perder a
    // mensagem "ready" em conexões rápidas.
    document.body.appendChild(iframe);

    function setLoadingOptions() {
      periodSelect.disabled = true;
      periodSelect.innerHTML = '<option value="">Consultando agenda...</option>';
    }

    function setPeriodOptions(periods) {
      periodSelect.innerHTML = '<option value="">Selecione um período</option>';
      (periods || []).forEach(function (period) {
        var option = document.createElement('option');
        option.value = period.value;
        option.textContent = period.label;
        periodSelect.appendChild(option);
      });
      periodSelect.disabled = false;

      if (!periods || periods.length === 0) {
        periodSelect.innerHTML = '<option value="">Nenhum período disponível nesta data</option>';
        periodSelect.disabled = true;
      }
    }

    function restoreFallbackOptions() {
      periodSelect.dataset.calendarMode = 'fallback';
      periodSelect.disabled = false;
      periodSelect.innerHTML = [
        '<option value="">Selecione</option>',
        '<option value="manha">Manhã - 8h às 13h</option>',
        '<option value="tarde">Tarde - 13h às 18h</option>',
        '<option value="integral">Dia inteiro - 8h às 18h</option>'
      ].join('');
      var label = periodSelect.closest('label');
      if (label && label.firstChild && label.firstChild.nodeType === Node.TEXT_NODE) {
        label.firstChild.nodeValue = 'Período';
      }
      submitButton.textContent = 'Enviar solicitação pelo WhatsApp';
    }

    async function loadAvailability() {
      resetStatus();
      if (!dateInput.value) return;
      if (!dateInput.checkValidity()) {
        periodSelect.innerHTML = '<option value="">Escolha uma data válida</option>';
        periodSelect.disabled = true;
        setStatus(dateInput.validationMessage || 'Escolha uma data válida para consultar a agenda.', true);
        return;
      }
      setLoadingOptions();

      try {
        var result;
        if (bridgeReady) {
          result = await bridgeRequest('availability', { date: dateInput.value });
        } else {
          // A leitura pública usa uma requisição sem cookies. Assim, visitantes
          // com várias contas Google conectadas não caem no erro de multi-login
          // conhecido do Apps Script; a criação continua protegida pela ponte.
          var response = await fetch(AVAILABILITY_URL + encodeURIComponent(dateInput.value), {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            cache: 'no-store',
            referrerPolicy: 'no-referrer'
          });
          if (!response.ok) throw new Error('Agenda indisponível.');
          result = await response.json();
          periodSelect.dataset.calendarMode = 'live-fallback';
          var liveLabel = periodSelect.closest('label');
          if (liveLabel && liveLabel.firstChild && liveLabel.firstChild.nodeType === Node.TEXT_NODE) {
            liveLabel.firstChild.nodeValue = 'Período disponível';
          }
        }
        if (!result || !result.ok) throw new Error(result && result.error ? result.error : 'Agenda indisponível.');
        setPeriodOptions(result.periods || []);
        if (!result.periods || result.periods.length === 0) {
          setStatus('Os períodos desta data já atingiram o limite de 5 clientes. Escolha outro dia.', true);
        }
      } catch (error) {
        restoreFallbackOptions();
        setStatus('A consulta automática da agenda está temporariamente indisponível. Você ainda pode solicitar pelo WhatsApp.', true);
      }
    }

    dateInput.addEventListener('change', loadAvailability);

    function fieldValue(data, name) {
      return String(data.get(name) || '').trim();
    }

    function displayDate(value) {
      var parts = value.split('-');
      return parts.length === 3 ? parts[2] + '/' + parts[1] + '/' + parts[0] : value;
    }

    function whatsappMessage(data, periodLabel, registered) {
      return [
        'Olá, vim pelo site da D’orus e gostaria de solicitar uma visita técnica.',
        '',
        '*Nome:* ' + fieldValue(data, 'nome'),
        '*Meu WhatsApp:* ' + fieldValue(data, 'telefone'),
        '*Bairro:* ' + fieldValue(data, 'bairro'),
        '*Endereço:* ' + fieldValue(data, 'endereco'),
        '*Equipamento:* ' + fieldValue(data, 'equipamento'),
        '*Marca/modelo:* ' + (fieldValue(data, 'marca') || 'Não informado'),
        '*Problema:* ' + fieldValue(data, 'problema'),
        '*Data preferida:* ' + displayDate(fieldValue(data, 'data')),
        '*Período solicitado:* ' + periodLabel,
        '*Horário exato:* a confirmar pela equipe dentro do período escolhido,',
        '',
        registered ? 'A solicitação já foi registrada na agenda da D’orus e aguarda confirmação.' : 'Se possível, confirme a disponibilidade desse horário.'
      ].join('\n');
    }

    function showWhatsappLink(url) {
      if (!actionLink) return;
      actionLink.href = url;
      actionLink.textContent = 'Continuar no WhatsApp';
      actionLink.hidden = false;
    }

    form.addEventListener('submit', async function (event) {
      if (!bridgeReady || periodSelect.dataset.calendarMode !== 'slots') return;

      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var selectedOption = periodSelect.options[periodSelect.selectedIndex];
      var periodLabel = selectedOption ? selectedOption.textContent : fieldValue(data, 'periodo');
      submitButton.disabled = true;
      setStatus('Registrando sua solicitação na agenda da D’orus...', false);

      var payload = {
        name: fieldValue(data, 'nome'),
        phone: fieldValue(data, 'telefone'),
        neighborhood: fieldValue(data, 'bairro'),
        address: fieldValue(data, 'endereco'),
        equipment: fieldValue(data, 'equipamento'),
        brand: fieldValue(data, 'marca'),
        problem: fieldValue(data, 'problema'),
        date: fieldValue(data, 'data'),
        period: fieldValue(data, 'periodo')
      };

      try {
        var result = await bridgeRequest('create', payload);
        if (!result || !result.ok) {
          if (result && result.conflict) {
            setStatus('Esse horário acabou de ser ocupado. Atualizei os horários disponíveis para você.', true);
            await loadAvailability();
            return;
          }
          if (result && result.duplicate) {
            var duplicateUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(whatsappMessage(data, periodLabel, true));
            setStatus('Essa solicitação já foi registrada. Continue pelo WhatsApp para confirmar o atendimento.', false);
            showWhatsappLink(duplicateUrl);
            return;
          }
          throw new Error(result && result.error ? result.error : 'Não foi possível registrar a solicitação.');
        }

        var message = whatsappMessage(data, periodLabel, true);
        var whatsappUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(message);
        setStatus('Solicitação registrada na agenda. Agora confirme o atendimento pelo WhatsApp.', false);
        showWhatsappLink(whatsappUrl);

        if (window.dorusAnalytics) {
          window.dorusAnalytics.trackLead('schedule_google', {
            equipment: fieldValue(data, 'equipamento'),
            schedule_period: fieldValue(data, 'periodo'),
            schedule_status: 'registered',
            cta_location: 'schedule_form'
          });
        }

        var popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!popup) showWhatsappLink(whatsappUrl);
      } catch (error) {
        setStatus('Não consegui registrar automaticamente na agenda. Você ainda pode continuar pelo WhatsApp.', true);
        var fallbackUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(whatsappMessage(data, periodLabel, false));
        showWhatsappLink(fallbackUrl);
      } finally {
        submitButton.disabled = false;
      }
    }, true);

    window.setTimeout(function () {
      if (!bridgeReady) restoreFallbackOptions();
    }, REQUEST_TIMEOUT + 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
