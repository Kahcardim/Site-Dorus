(function () {
  'use strict';

  var WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbySQLF-zmEA9Pjx3-or9ZYb84FQYXzphMmDLm464tWWKv7Zial1dZoTcz6qw8pwZPNh/exec';
  var BRIDGE_URL = WEB_APP_URL + '?action=bridge';
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
    iframe.hidden = true;
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('title', 'Integração segura com a agenda D’orus');
    document.body.appendChild(iframe);

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
          label.firstChild.nodeValue = 'Horário disponível';
        }
        submitButton.textContent = 'Solicitar horário e continuar no WhatsApp';
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

    function setLoadingOptions() {
      periodSelect.disabled = true;
      periodSelect.innerHTML = '<option value="">Consultando agenda...</option>';
    }

    function setSlotOptions(slots) {
      periodSelect.innerHTML = '<option value="">Selecione um horário</option>';
      (slots || []).forEach(function (slot) {
        var option = document.createElement('option');
        option.value = slot.value;
        option.textContent = slot.label;
        periodSelect.appendChild(option);
      });
      periodSelect.disabled = false;

      if (!slots || slots.length === 0) {
        periodSelect.innerHTML = '<option value="">Nenhum horário disponível nesta data</option>';
        periodSelect.disabled = true;
      }
    }

    function restoreFallbackOptions() {
      periodSelect.dataset.calendarMode = 'fallback';
      periodSelect.disabled = false;
      periodSelect.innerHTML = [
        '<option value="">Selecione</option>',
        '<option value="manha">Manhã — 8h às 12h</option>',
        '<option value="tarde">Tarde — 13h às 17h</option>',
        '<option value="comercial">Horário comercial — 8h às 17h</option>'
      ].join('');
      var label = periodSelect.closest('label');
      if (label && label.firstChild && label.firstChild.nodeType === Node.TEXT_NODE) {
        label.firstChild.nodeValue = 'Período';
      }
      submitButton.textContent = 'Enviar solicitação pelo WhatsApp';
    }

    async function loadAvailability() {
      resetStatus();
      if (!bridgeReady || !dateInput.value) return;
      if (!dateInput.checkValidity()) {
        periodSelect.innerHTML = '<option value="">Escolha uma data válida</option>';
        periodSelect.disabled = true;
        setStatus(dateInput.validationMessage || 'Escolha uma data válida para consultar a agenda.', true);
        return;
      }
      setLoadingOptions();

      try {
        var result = await bridgeRequest('availability', { date: dateInput.value });
        if (!result || !result.ok) throw new Error(result && result.error ? result.error : 'Agenda indisponível.');
        setSlotOptions(result.slots || []);
        if (!result.slots || result.slots.length === 0) {
          setStatus('Não há horários livres nesta data. Escolha outro dia.', true);
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

    function whatsappMessage(data, slotLabel, registered) {
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
        '*Horário:* ' + slotLabel,
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
      var slotLabel = selectedOption ? selectedOption.textContent : fieldValue(data, 'periodo');
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
        time: fieldValue(data, 'periodo')
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
            var duplicateUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(whatsappMessage(data, slotLabel, true));
            setStatus('Essa solicitação já foi registrada. Continue pelo WhatsApp para confirmar o atendimento.', false);
            showWhatsappLink(duplicateUrl);
            return;
          }
          throw new Error(result && result.error ? result.error : 'Não foi possível registrar a solicitação.');
        }

        var message = whatsappMessage(data, slotLabel, true);
        var whatsappUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(message);
        setStatus('Solicitação registrada na agenda. Agora confirme o atendimento pelo WhatsApp.', false);
        showWhatsappLink(whatsappUrl);

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'agendamento_registrado_google',
          equipamento: fieldValue(data, 'equipamento'),
          horario: fieldValue(data, 'periodo')
        });

        var popup = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (!popup) showWhatsappLink(whatsappUrl);
      } catch (error) {
        setStatus('Não consegui registrar automaticamente na agenda. Você ainda pode continuar pelo WhatsApp.', true);
        var fallbackUrl = 'https://wa.me/5511913573932?text=' + encodeURIComponent(whatsappMessage(data, slotLabel, false));
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
