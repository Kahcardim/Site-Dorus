from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://assistenciadorus.com.br'
HOME = BASE + '/'
LEGACY_TYPES = {'ApplianceRepair', 'HomeAndConstructionBusiness', 'LocalBusiness'}
PRIVATE_MARKERS = ('Alameda Yayá', 'Alameda Yaya', '07060-000')
errors = []
canonicals = set()


def walk(value):
    yield value
    if isinstance(value, dict):
        for item in value.values():
            yield from walk(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk(item)


def types_of(node):
    value = node.get('@type')
    if isinstance(value, str): return {value}
    if isinstance(value, list): return set(value)
    return set()

for page in sorted(ROOT.rglob('*.html')):
    if '.git' in page.parts or page.name == '404.html': continue
    rel = page.relative_to(ROOT).as_posix()
    source = page.read_text(encoding='utf-8')
    title = re.findall(r'<title>(.*?)</title>', source, re.I | re.S)
    desc = re.findall(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)', source, re.I)
    canonical = re.findall(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', source, re.I)
    h1 = re.findall(r'<h1\b', source, re.I)
    og_image = re.findall(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)', source, re.I)
    if len(title) != 1 or not title[0].strip(): errors.append(f'{rel}: precisa ter exatamente um title.')
    if len(desc) != 1 or len(desc[0].strip()) < 50: errors.append(f'{rel}: description ausente ou curta.')
    if len(canonical) != 1 or not canonical[0].startswith(BASE + '/'):
        errors.append(f'{rel}: canonical ausente ou inválido.'); canonical_url = None
    else:
        canonical_url = canonical[0]; canonicals.add(canonical_url)
    if len(h1) != 1: errors.append(f'{rel}: precisa ter exatamente um H1.')
    if not og_image or 'dorus-logo-3d.webp' in og_image[0]: errors.append(f'{rel}: og:image precisa ser representativa.')
    for marker in PRIVATE_MARKERS:
        if marker.lower() in source.lower(): errors.append(f'{rel}: expõe endereço residencial ({marker}).')
    blocks = []
    for block in re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', source, re.I | re.S):
        try: blocks.append(json.loads(block))
        except json.JSONDecodeError as exc: errors.append(f'{rel}: JSON-LD inválido ({exc}).')
    nodes = [n for b in blocks for n in walk(b) if isinstance(n, dict)]
    for node in nodes:
        if LEGACY_TYPES & types_of(node): errors.append(f'{rel}: contém tipo legado/inadequado {LEGACY_TYPES & types_of(node)}.')
        if 'Organization' in types_of(node):
            if 'address' in node: errors.append(f'{rel}: Organization não deve publicar residência como address.')
            if 'aggregateRating' in node: errors.append(f'{rel}: Organization não deve publicar avaliação autoatribuída.')
    all_types = set().union(*(types_of(n) for n in nodes)) if nodes else set()
    if canonical_url == HOME:
        if 'Organization' not in all_types: errors.append(f'{rel}: Home precisa de Organization.')
        if 'WebSite' not in all_types: errors.append(f'{rel}: Home precisa de WebSite.')
    if canonical_url and '/servicos/' in canonical_url and canonical_url != BASE + '/servicos/':
        services = [n for n in nodes if 'Service' in types_of(n)]
        if not services: errors.append(f'{rel}: página de serviço sem Service.')
        for service in services:
            provider = service.get('provider')
            if not isinstance(provider, dict) or 'Organization' not in types_of(provider): errors.append(f'{rel}: Service precisa de provider Organization.')
    if canonical_url and '/curiosidades/' in canonical_url and canonical_url != BASE + '/curiosidades/':
        if 'Article' not in all_types: errors.append(f'{rel}: guia individual precisa de Article.')

sitemap = ROOT / 'sitemap.xml'
if not sitemap.exists(): errors.append('sitemap.xml ausente.')
else:
    tree = ET.parse(sitemap); ns={'sm':'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls={el.text.strip() for el in tree.findall('.//sm:loc', ns) if el.text}
    for url in sorted(canonicals - urls): errors.append(f'sitemap.xml não contém canonical: {url}')
robots = ROOT / 'robots.txt'
if not robots.exists() or 'Sitemap: https://assistenciadorus.com.br/sitemap.xml' not in robots.read_text(encoding='utf-8'):
    errors.append('robots.txt não aponta para o sitemap oficial.')
if errors:
    print('Falhas de SEO encontradas:')
    for error in errors: print('-', error)
    raise SystemExit(1)
print(f'OK: {len(canonicals)} páginas indexáveis; sitemap, Schema, privacidade local e imagens sociais consistentes.')
