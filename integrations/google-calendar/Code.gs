const CALENDAR_ID =
  'bca85ae34b7e3894763d97f8b0b5044d895632d3cca7bf0f5806e98156c8a48f@group.calendar.google.com';

const TIMEZONE = 'America/Sao_Paulo';
const MAX_BOOKINGS_PER_SLOT = 2;
const BRIDGE_SESSION_TTL_SECONDS = 600;
const DUPLICATE_REQUEST_TTL_SECONDS = 600;
const REVIEWS_CACHE_TTL_SECONDS = 21600;
const ALLOWED_ORIGINS = [
  'https://assistenciadorus.com.br',
  'https://www.assistenciadorus.com.br'
];

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'status');
  const callback = String((e && e.parameter && e.parameter.callback) || '').trim();

  try {
    if (action === 'bridge') {
      return bridgePage();
    }

    if (action === 'availability') {
      return jsonResponse(getAvailabilityByDate(String(e.parameter.date || '')));
    }

    if (action === 'reviews') {
      const result = getGoogleReviewsSummary();
      if (callback) {
        return jsonpResponse(callback, { ok: true, data: result });
      }
      return jsonResponse({ ok: true, data: result });
    }

    return jsonResponse({
      ok: true,
      service: 'Dorus Agendamento',
      calendar: 'Agendamento'
    });
  } catch (error) {
    const failure = { ok: false, error: safeErrorMessage(error) };
    if (action === 'reviews' && callback) {
      return jsonpResponse(callback, failure);
    }
    return jsonResponse(failure);
  }
}

// O endpoint POST antigo não cria eventos diretamente.
// Criações continuam protegidas pela ponte HtmlService + google.script.run.
function doPost() {
  return jsonResponse({
    ok: false,
    error: 'Envio direto desativado. Use o formulário oficial da D’orus.'
  });
}

function bridgePage() {
  const origins = JSON.stringify(ALLOWED_ORIGINS);
  const bridgeSession = issueBridgeSession();
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Dorus Agenda Bridge</title></head>
<body>
<script>
(function () {
  const allowedOrigins = new Set(${origins});
  const bridgeSession = ${JSON.stringify(bridgeSession)};

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
    if (event.source !== window.parent) return;
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
        .getAvailabilityClient(message.payload || {}, bridgeSession);
      return;
    }

    if (message.type === 'create') {
      google.script.run
        .withSuccessHandler(success)
        .withFailureHandler(failure)
        .createAppointmentClient(message.payload || {}, bridgeSession);
      return;
    }

    if (message.type === 'reviews') {
      google.script.run
        .withSuccessHandler(success)
        .withFailureHandler(failure)
        .getGoogleReviewsSummaryClient(bridgeSession);
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

function getGoogleReviewsSummaryClient(bridgeSession) {
  validateBridgeSession(bridgeSession);
  return getGoogleReviewsSummary();
}

function getGoogleReviewsSummary() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('google-reviews-summary');
  if (cached) return JSON.parse(cached);

  const properties = PropertiesService.getScriptProperties();
  const apiKey = String(properties.getProperty('GOOGLE_PLACES_API_KEY') || '').trim();
  const placeId = String(properties.getProperty('GOOGLE_PLACE_ID') || '').trim();
  if (!apiKey || !placeId) throw new Error('Integração de avaliações ainda não configurada.');
  if (!/^[A-Za-z0-9_-]+$/.test(placeId)) throw new Error('Place ID inválido.');

  const response = UrlFetchApp.fetch(
    'https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId),
    {
      method: 'get',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'rating,userRatingCount'
      },
      muteHttpExceptions: true
    }
  );

  if (response.getResponseCode() !== 200) {
    let detail = '';
    try {
      const errorPayload = JSON.parse(response.getContentText());
      detail = String((errorPayload && errorPayload.error && errorPayload.error.message) || '');
    } catch (ignore) {}
    throw new Error(
      'Places API HTTP ' + response.getResponseCode() +
      (detail ? ': ' + detail : '')
    );
  }

  const place = JSON.parse(response.getContentText());
  const result = {
    rating: Number(place.rating),
    userRatingCount: Number(place.userRatingCount)
  };
  if (!Number.isFinite(result.rating) || result.rating < 1 || result.rating > 5 ||
      !Number.isInteger(result.userRatingCount) || result.userRatingCount < 0) {
    throw new Error('Resposta inválida da Places API.');
  }

  cache.put('google-reviews-summary', JSON.stringify(result), REVIEWS_CACHE_TTL_SECONDS);
  return result;
}

function jsonpResponse(callback, object) {
  if (!/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    throw new Error('Callback inválido.');
  }
  return ContentService
    .createTextOutput(callback + '(' + JSON.stringify(object) + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function issueBridgeSession() {
  const token = Utilities.getUuid() + Utilities.getUuid();
  CacheService.getScriptCache().put('bridge:' + token, 'valid', BRIDGE_SESSION_TTL_SECONDS);
  return token;
}

function validateBridgeSession(token) {
  const normalized = String(token || '').trim();
  if (!normalized || CacheService.getScriptCache().get('bridge:' + normalized) !== 'valid') {
    throw new Error('Sessão da agenda inválida ou expirada. Recarregue a página e tente novamente.');
  }
}

function getAvailabilityClient(payload, bridgeSession) {
  validateBridgeSession(bridgeSession);
  return getAvailabilityByDate(String((payload && payload.date) || ''));
}

function createAppointmentClient(data, bridgeSession) {
  validateBridgeSession(bridgeSession);
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

  const duplicateKey = appointmentFingerprint(data);
  const cache = CacheService.getScriptCache();
  if (cache.get(duplicateKey)) {
    return {
      ok: false,
      duplicate: true,
      error: 'Esta solicitação já foi recebida. Aguarde a confirmação pelo WhatsApp.'
    };
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    if (cache.get(duplicateKey)) {
      return {
        ok: false,
        duplicate: true,
        error: 'Esta solicitação já foi recebida. Aguarde a confirmação pelo WhatsApp.'
      };
    }

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
    cache.put(duplicateKey, event.getId() || 'created', DUPLICATE_REQUEST_TTL_SECONDS);

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

function appointmentFingerprint(data) {
  const phone = String(data.phone || '').replace(/\D/g, '').slice(-11);
  const raw = [phone, data.date, data.time, sanitize(data.equipment), sanitize(data.name)].join('|').toLowerCase();
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  const hex = digest.map(byte => ('0' + ((byte + 256) % 256).toString(16)).slice(-2)).join('');
  return 'appointment:' + hex;
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

  const phoneDigits = String(data.phone || '').replace(/\D/g, '');
  if (String(data.name).length > 100) throw new Error('Nome inválido.');
  if (phoneDigits.length < 10 || phoneDigits.length > 13) throw new Error('Telefone inválido.');
  if (String(data.neighborhood).length > 120) throw new Error('Bairro inválido.');
  if (String(data.address).length > 250) throw new Error('Endereço inválido.');
  if (String(data.equipment).length > 100) throw new Error('Equipamento inválido.');
  if (String(data.brand || '').length > 120) throw new Error('Marca/modelo inválido.');
  if (String(data.problem).length > 1500) throw new Error('Descrição muito longa.');
}

function sanitize(value) {
  return String(value || '').replace(/[<>]/g, '').trim();
}

function safeErrorMessage(error) {
  const message = String((error && error.message) || 'Não foi possível processar a solicitação.');
  return message.slice(0, 300);
}

function jsonResponse(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
