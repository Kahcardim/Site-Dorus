from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
code = (ROOT / 'integrations/google-apps-script/Code.gs').read_text(encoding='utf-8')
calendar = (ROOT / 'calendar-integration.js').read_text(encoding='utf-8')
site = (ROOT / 'site.js').read_text(encoding='utf-8')
form_html = (ROOT / 'agendamento/index.html').read_text(encoding='utf-8')

errors = []

# Backend: o POST legado não pode voltar a criar eventos diretamente.
do_post = re.search(r'function\s+doPost\s*\([^)]*\)\s*\{(.*?)\n\}', code, flags=re.S)
if not do_post:
    errors.append('Code.gs: função doPost ausente.')
else:
    body = do_post.group(1)
    if 'createAppointment(' in body:
        errors.append('Code.gs: doPost voltou a permitir criação direta de eventos.')
    if 'Envio direto desativado' not in body:
        errors.append('Code.gs: doPost precisa rejeitar explicitamente envio direto.')

for marker in (
    'issueBridgeSession',
    'validateBridgeSession',
    'appointmentFingerprint',
    'CacheService.getScriptCache()',
    'MAX_BOOKINGS_PER_SLOT = 2',
    'lock.waitLock(5000)',
):
    if marker not in code:
        errors.append(f'Code.gs: proteção obrigatória ausente: {marker}')

if 'https://kahcardim.github.io' in code:
    errors.append('Code.gs: origem antiga do GitHub não deve criar solicitações na agenda.')
for origin in ('https://assistenciadorus.com.br', 'https://www.assistenciadorus.com.br'):
    if origin not in code:
        errors.append(f'Code.gs: origem oficial ausente: {origin}')

for marker in (
    'max.setDate(max.getDate() + 60)',
    "weekday === 7",
    "phoneDigits.length < 10",
    "calendar.getEvents(slot.start, slot.end)",
):
    if marker not in code:
        errors.append(f'Code.gs: regra de backend ausente: {marker}')

# Frontend: as mesmas regras essenciais precisam ser bloqueadas antes da consulta.
for marker in (
    'maxScheduleDate.setDate(maxScheduleDate.getDate() + 60)',
    'selected.getDay() === 0',
    'dateInput.max = dateValue(maxScheduleDate)',
    'dateInput.min = dateValue(localTodayDate)',
):
    if marker not in site:
        errors.append(f'site.js: regra de data ausente: {marker}')

for marker in (
    'dateInput.checkValidity()',
    'result.duplicate',
    'result.conflict',
):
    if marker not in calendar:
        errors.append(f'calendar-integration.js: tratamento obrigatório ausente: {marker}')
if 'dataset.calendarMode' not in calendar:
    errors.append('calendar-integration.js: controle de modo da agenda ausente.')

# Formulário: campos essenciais e consentimento não podem perder o required.
if 'data-schedule-form' not in form_html:
    errors.append('agendamento/index.html: formulário principal da agenda ausente.')
for name in ('nome', 'telefone', 'bairro', 'endereco', 'equipamento', 'data', 'periodo', 'problema', 'consentimento'):
    pattern = rf'<(?:input|select|textarea)\b[^>]*name=["\']{re.escape(name)}["\'][^>]*\brequired\b'
    if not re.search(pattern, form_html, flags=re.I):
        errors.append(f'agendamento/index.html: campo obrigatório sem required: {name}')
if 'data-schedule-status' not in form_html or 'aria-live="polite"' not in form_html:
    errors.append('agendamento/index.html: feedback acessível do formulário ausente.')
if 'calendar-integration.js' not in form_html:
    errors.append('agendamento/index.html: integração da agenda não está carregada.')

if errors:
    print('Falhas de backend/agenda encontradas:')
    for error in errors:
        print('-', error)
    raise SystemExit(1)

print('OK: backend, formulário, limites, sessão do bridge, duplicidade e validações da agenda protegidos.')
