from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
errors = []
private_markers = ('Alameda Yayá', 'Alameda Yaya', '07060-000')
legacy_markers = ('ApplianceRepair',)

for page in ROOT.rglob('*.html'):
    if '.git' in page.parts: continue
    source = page.read_text(encoding='utf-8')
    rel = page.relative_to(ROOT)
    for marker in private_markers:
        if marker.lower() in source.lower(): errors.append(f'{rel}: endereço residencial encontrado: {marker}')
    for marker in legacy_markers:
        if marker in source: errors.append(f'{rel}: tipo Schema legado encontrado: {marker}')

for path in (ROOT/'index.html', ROOT/'servicos/index.html', ROOT/'servicos/fogoes/index.html'):
    source = path.read_text(encoding='utf-8').lower()
    if 'conversão para gás natural' in source or 'conversao para gas natural' in source:
        errors.append(f'{path.relative_to(ROOT)}: conversão de gás voltou ao conteúdo.')
    if 'instalação e conversão' in source or 'instalacao e conversao' in source:
        errors.append(f'{path.relative_to(ROOT)}: serviço comercial não aprovado voltou ao conteúdo.')

contrast = (ROOT/'accessibility-contrast.css').read_text(encoding='utf-8')
for marker in ('a11y-high-contrast .mobile-nav div', 'a11y-high-contrast .mobile-nav a', 'visibility:visible!important'):
    if marker not in contrast: errors.append(f'accessibility-contrast.css: proteção ausente: {marker}')

required_guides = ('geladeira-nao-gela','maquina-nao-centrifuga','geladeira-fazendo-barulho','freezer-nao-congela','fogao-nao-acende','micro-ondas-nao-aquece')
for guide in required_guides:
    if not (ROOT/'curiosidades'/guide/'index.html').exists(): errors.append(f'Guia ausente: {guide}')

if errors:
    print('Falhas de consistência:')
    for error in errors: print('-', error)
    raise SystemExit(1)
print('OK: marca, área de serviço, conteúdo aprovado, guias e contraste estão consistentes.')
