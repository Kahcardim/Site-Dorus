const CALENDAR_ID =
  'bca85ae34b7e3894763d97f8b0b5044d895632d3cca7bf0f5806e98156c8a48f@group.calendar.google.com';

const TIMEZONE = 'America/Sao_Paulo';
const MAX_BOOKINGS_PER_SLOT = 2;
const ALLOWED_ORIGINS = [
  'https://assistenciadorus.com.br',
  'https://www.assistenciadorus.com.br',
  'https://kahcardim.github.io'
];

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'status');

    if (action === 'bridge') {
      return bridgePage();
    }

    if (action === 'availability') {
      return jsonResponse(getAvailabilityByDate(String(e.parameter.date || '')));
    }

    return jsonResponse({
      ok: true,
      service: 'Dorus Agendamento',
      calendar: 'Agendamento'
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.action !== 'create') {
      return jsonResponse({ ok: false, error: 'Ação inválida' });
    }
    return jsonResponse(createAppointment(data));
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message });
  }
}

function bridgePage() {
  const origins = JSON.stringify(ALLOWED_ORIGINS);
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Dorus Agenda Bridge</title></head>
<body>
<script>
(function () {
  const allowedOrigins = new Set(${origins});

  function reply(target, origin, requestId, ok, data, error) {
    target.postMessage({
      source: 'dorus-calendar-bridge',
      requestId: requestId,
      ok: ok,
      data: data || null,
      error: error || null
    }, origin);
  }

  window.addEventListener('message', function (event) {
    if (!allowedOrigins.has(event.origin)) return;
    const message = event.data || {};
    if (message.source !== 'dorus-site' || !message.requestId) return;

    const success = function (result) {
      reply(event.source, event.origin, message.requestId, true, result, null);
    };
    const failure = function (error) {
      reply(event.source, event.origin, message.requestId, false, null, error && error.message ? error.message : String(error || 'Erro na agenda'));
    };

    if (message.type === 'availability') {
      google.script.run
        .withSuccessHandler(success)
        .withFailureHandler(failure)
        .getAvailabilityClient(message.payload || {});
      return;
    }

    if (message.type === 'create') {
      google.script.run
        .withSuccessHandler(success)
        .withFailureHandler(failure)
        .createAppointmentClient(message.payload || {});
      return;
    }

    failure(new Error('Ação inválida'));
  });

  if (window.parent !== window) {
    window.parent.postMessage({ source: 'dorus-calendar-bridge', type: 'ready' }, '*');
  }
})();
</script>
</body>
</html>`;

  return HtmlService
    .createHtmlOutput(html)
    .setTitle('Dorus Agenda Bridge')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getAvailabilityClient(payload) {
  return getAvailabilityByDate(String((payload && payload.date) || ''));
}

function createAppointmentClient(data) {
  return createAppointment(data || {});
}

function getAvailabilityByDate(date) {
  validateDate(date);
  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendar) throw new Error('Agenda D’orus não encontrada.');

  const slots = generateSlots(date).filter(slot => {
    return calendar.getEvents(slot.start, slot.end).length < MAX_BOOKINGS_PER_SLOT;
  }).map(slot => ({ value: slot.value, label: slot.label }));

  return { ok: true, date: date, slots: slots };
}

function createAppointment(data) {
  validateRequired(data);
  validateDate(data.date);

  const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendar) throw new Error('Agenda D’orus não encontrada.');

  const slot = getSlot(data.date, data.time);
  if (!slot) throw new Error('Horário inválido.');

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const conflicts = calendar.getEvents(slot.start, slot.end);
    if (conflicts.length >= MAX_BOOKINGS_PER_SLOT) {
      return {
        ok: false,
        conflict: true,
        error: 'Esse horário já atingiu o limite de solicitações. Escolha outro horário.'
      };
    }

    const title = 'Visita D’orus — ' + sanitize(data.equipment) + ' — ' + sanitize(data.name);
    const description = [
      'Solicitação recebida pelo site D’orus',
      '',
      'Cliente: ' + sanitize(data.name),
      'WhatsApp: ' + sanitize(data.phone),
      'Equipamento: ' + sanitize(data.equipment),
      'Marca / modelo: ' + sanitize(data.brand || 'Não informado'),
      'Problema: ' + sanitize(data.problem),
      'Bairro: ' + sanitize(data.neighborhood),
      '',
      'Status: AGUARDANDO CONFIRMAÇÃO'
    ].join('\n');

    const location = sanitize(data.address) + ', ' + sanitize(data.neighborhood) + ', Guarulhos - SP';
    const event = calendar.createEvent(title, slot.start, slot.end, {
      description: description,
      location: location
    });
    event.setTransparency(CalendarApp.EventTransparency.OPAQUE);

    return {
      ok: true,
      eventId: event.getId(),
      date: data.date,
      time: data.time,
      message: 'Solicitação registrada na agenda D’orus.'
    };
  } finally {
    lock.releaseLock();
  }
}

function generateSlots(date) {
  const times = [
    ['08:00', '10:00'],
    ['10:00', '12:00'],
    ['13:00', '15:00'],
    ['15:00', '17:00']
  ];

  return times.map(pair => ({
    value: pair[0],
    label: pair[0] + ' às ' + pair[1],
    start: parseLocalDateTime(date, pair[0]),
    end: parseLocalDateTime(date, pair[1])
  }));
}

function getSlot(date, time) {
  return generateSlots(date).find(slot => slot.value === time) || null;
}

function parseLocalDateTime(date, time) {
  return Utilities.parseDate(date + ' ' + time, TIMEZONE, 'yyyy-MM-dd HH:mm');
}

function validateDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    throw new Error('Data inválida.');
  }

  const selected = Utilities.parseDate(date + ' 12:00', TIMEZONE, 'yyyy-MM-dd HH:mm');
  const todayText = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
  const today = Utilities.parseDate(todayText + ' 00:00', TIMEZONE, 'yyyy-MM-dd HH:mm');
  if (selected < today) throw new Error('Não é possível agendar uma data passada.');

  const max = new Date(today.getTime());
  max.setDate(max.getDate() + 60);
  if (selected > max) throw new Error('O agendamento pode ser feito com até 60 dias de antecedência.');

  const weekday = Number(Utilities.formatDate(selected, TIMEZONE, 'u'));
  if (weekday === 7) throw new Error('Não há atendimento aos domingos.');
}

function validateRequired(data) {
  const required = ['name', 'phone', 'neighborhood', 'address', 'equipment', 'problem', 'date', 'time'];
  required.forEach(field => {
    if (!String(data[field] || '').trim()) throw new Error('Campo obrigatório ausente: ' + field);
  });

  if (String(data.name).length > 100) throw new Error('Nome inválido.');
  if (String(data.phone).length > 30) throw new Error('Telefone inválido.');
  if (String(data.problem).length > 1500) throw new Error('Descrição muito longa.');
}

function sanitize(value) {
  return String(value || '').replace(/[<>]/g, '').trim();
}

function jsonResponse(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
