from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
code = (ROOT / 'integrations/google-calendar/Code.gs').read_text(encoding='utf-8')
calendar = (ROOT / 'calendar-integration.js').read_text(encoding='utf-8')
rating_sync = (ROOT / 'scripts/sync_google_rating.py').read_text(encoding='utf-8')
site = (ROOT / 'site.js').read_text(encoding='utf-8')
form_html = (ROOT / 'agendamento/index.html').read_text(encoding='utf-8')
errors = []

do_post = re.search(r'function\s+doPost\s*\([^)]*\)\s*\{(.*?)\n\}', code, flags=re.S)
if not do_post:
    errors.append('Code.gs: função doPost ausente.')
else:
    body = do_post.group(1)
    if 'createAppointment(' in body: errors.append('Code.gs: doPost voltou a permitir criação direta de eventos.')
    if 'Envio direto desativado' not in body: errors.append('Code.gs: doPost precisa rejeitar explicitamente envio direto.')

for marker in ('issueBridgeSession','validateBridgeSession','appointmentFingerprint','CacheService.getScriptCache()','MAX_BOOKINGS_PER_PERIOD = 5','lock.waitLock(5000)'):
    if marker not in code: errors.append(f'Code.gs: proteção obrigatória ausente: {marker}')
if 'https://kahcardim.github.io' in code: errors.append('Code.gs: origem antiga do GitHub não deve criar solicitações na agenda.')
for origin in ('https://assistenciadorus.com.br','https://www.assistenciadorus.com.br'):
    if origin not in code: errors.append(f'Code.gs: origem oficial ausente: {origin}')
for marker in ('max.setDate(max.getDate() + 60)',"weekday === 7","phoneDigits.length < 10","calendar.getEvents(periods.manha.start, periods.manha.end)","calendar.getEvents(periods.tarde.start, periods.tarde.end)","data.period === 'manha'","data.period === 'tarde'","Dia inteiro - 8h às 18h"):
    if marker not in code: errors.append(f'Code.gs: regra de backend ausente: {marker}')
for marker in ('maxScheduleDate.setDate(maxScheduleDate.getDate() + 60)','selected.getDay() === 0','dateInput.max = dateValue(maxScheduleDate)','dateInput.min = dateValue(localTodayDate)'):
    if marker not in site: errors.append(f'site.js: regra de data ausente: {marker}')
for marker in ("Manhã - 8h às 13h", "Tarde - 13h às 18h", "Dia inteiro - 8h às 18h", "'integral': ['080000', '180000']"):
    if marker not in site: errors.append(f'site.js: período comercial obrigatório ausente: {marker}')
for marker in ('dateInput.checkValidity()','result.duplicate','result.conflict'):
    if marker not in calendar: errors.append(f'calendar-integration.js: tratamento obrigatório ausente: {marker}')
if 'dataset.calendarMode' not in calendar: errors.append('calendar-integration.js: controle de modo da agenda ausente.')
for marker in ("'?action=availability&date='", "credentials: 'omit'", "periodSelect.dataset.calendarMode = 'live-fallback'", 'result.periods', 'setPeriodOptions'):
    if marker not in calendar: errors.append(f'calendar-integration.js: fallback público de horários ausente: {marker}')
if 'iframe.hidden = true' in calendar: errors.append('calendar-integration.js: a ponte não pode usar hidden, pois precisa inicializar em segundo plano.')
for marker in ("iframe.className = 'calendar-bridge-frame'", "iframe.setAttribute('credentialless', '')", "iframe.setAttribute('aria-hidden', 'true')"):
    if marker not in calendar: errors.append(f'calendar-integration.js: configuração segura da ponte ausente: {marker}')
listener_pos = calendar.find("window.addEventListener('message'")
append_pos = calendar.find('document.body.appendChild(iframe)')
if listener_pos < 0 or append_pos < 0 or append_pos < listener_pos:
    errors.append('calendar-integration.js: a ponte deve ser carregada somente após registrar o listener de mensagens.')
if 'data-schedule-form' not in form_html: errors.append('agendamento/index.html: formulário principal ausente.')
for name in ('nome','telefone','bairro','endereco','equipamento','data','periodo','problema','consentimento'):
    pattern = rf'<(?:input|select|textarea)\b[^>]*name=["\']{re.escape(name)}["\'][^>]*\brequired\b'
    if not re.search(pattern, form_html, flags=re.I): errors.append(f'agendamento/index.html: campo obrigatório sem required: {name}')
if 'data-schedule-status' not in form_html or 'aria-live="polite"' not in form_html: errors.append('agendamento/index.html: feedback acessível ausente.')
if 'calendar-integration.js' not in form_html: errors.append('agendamento/index.html: integração da agenda não carregada.')
expected_place_id = 'ChIJZyk7iQ31zpQR0C-R3wgVywg'
if expected_place_id not in rating_sync: errors.append('sync_google_rating.py: Place ID esperado da D’orus ausente.')
if 'place_id != EXPECTED_PLACE_ID' not in rating_sync: errors.append('sync_google_rating.py: ficha Google não é validada antes da sincronização.')
if errors:
    print('Falhas de backend/agenda encontradas:')
    for error in errors: print('-', error)
    raise SystemExit(1)
print('OK: backend, formulário, limites, sessão, duplicidade e validações da agenda protegidos.')
