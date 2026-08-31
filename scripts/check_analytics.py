from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
ANALYTICS = (ROOT / 'analytics.js').read_text(encoding='utf-8')
JS_FILES = list(ROOT.glob('*.js'))

if 'updateGoogleRating' in ANALYTICS:
    raise SystemExit('ERRO: atualização de avaliações não deve ficar misturada com o GA4.')

required_tokens = [
    "G-480Q4RXYNC",
    "analytics_storage: consentGranted ? 'granted' : 'denied'",
    "IS_LOCAL_PREVIEW",
    "window.dorusAnalytics",
    "'generate_lead'",
    "'cta_click'",
    "'begin_schedule'",
    "'social_click'",
    "'select_related_service'",
    "cta_location",
    "page_type",
    "equipment",
]

missing = [token for token in required_tokens if token not in ''.join(
    path.read_text(encoding='utf-8') for path in JS_FILES
)]
if missing:
    raise SystemExit(f'ERRO: itens de analytics ausentes: {missing}')

legacy_events = [
    'clique_whatsapp',
    'clique_telefone',
    'clique_instagram',
    'clique_agendamento',
    'envio_agendamento_whatsapp',
    'agendamento_registrado_google',
    'clique_servico_relacionado',
]
legacy_hits = [
    f'{path.name}:{event}'
    for path in JS_FILES
    for event in legacy_events
    if event in path.read_text(encoding='utf-8')
]
if legacy_hits:
    raise SystemExit(f'ERRO: eventos legados ainda presentes: {legacy_hits}')

event_names = re.findall(r"(?:sendEvent|track)\('([a-z][a-z0-9_]*)'", ''.join(
    path.read_text(encoding='utf-8') for path in JS_FILES
))
invalid_names = [name for name in event_names if len(name) > 40]
if invalid_names:
    raise SystemExit(f'ERRO: eventos fora do limite de 40 caracteres: {invalid_names}')

for sensitive_key in ('name:', 'phone:', 'address:', 'problem:'):
    if re.search(rf'(?:trackLead|\.track)\([^;]+{re.escape(sensitive_key)}', ''.join(
        path.read_text(encoding='utf-8') for path in JS_FILES
    ), flags=re.DOTALL):
        raise SystemExit(f'ERRO: possível dado pessoal enviado ao GA4: {sensitive_key}')

if "ad_storage: 'denied'" not in ANALYTICS or "ad_user_data: 'denied'" not in ANALYTICS:
    raise SystemExit('ERRO: consentimento de publicidade não está negado por padrão.')

print('OK: GA4 centralizado, eventos legíveis, consentimento preservado e sem parâmetros pessoais.')
