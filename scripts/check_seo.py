from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://assistenciadorus.com.br'
HOME = BASE + '/'
LOCAL_TYPES = {'LocalBusiness', 'HomeAndConstructionBusiness'}

errors = []
canonicals = set()


def walk_schema(value):
    yield value
    if isinstance(value, dict):
        for item in value.values():
            yield from walk_schema(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_schema(item)


for page in sorted(ROOT.rglob('*.html')):
    if '.git' in page.parts or page.name == '404.html':
        continue
    rel = page.relative_to(ROOT).as_posix()
    source = page.read_text(encoding='utf-8')

    title = re.findall(r'<title>(.*?)</title>', source, flags=re.I | re.S)
    desc = re.findall(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)', source, flags=re.I)
    canonical = re.findall(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', source, flags=re.I)
    h1 = re.findall(r'<h1\b', source, flags=re.I)
    og_image = re.findall(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)', source, flags=re.I)

    if len(title) != 1 or not title[0].strip():
        errors.append(f'{rel}: precisa ter exatamente um <title>.')
    if len(desc) != 1 or len(desc[0].strip()) < 50:
        errors.append(f'{rel}: meta description ausente ou curta demais.')
    if len(canonical) != 1 or not canonical[0].startswith(BASE + '/'):
        errors.append(f'{rel}: canonical ausente ou fora do dominio oficial.')
        canonical_url = None
    else:
        canonical_url = canonical[0]
        canonicals.add(canonical_url)
    if len(h1) != 1:
        errors.append(f'{rel}: precisa ter exatamente um H1; encontrados {len(h1)}.')
    if '/Site-Dorus/' in source:
        errors.append(f'{rel}: ainda contem caminho legado /Site-Dorus/.')
    if re.search(r'<meta\s+name=["\']robots["\'][^>]*content=["\'][^"\']*noindex', source, flags=re.I):
        errors.append(f'{rel}: pagina publica marcada como noindex.')
    if not og_image or 'dorus-logo-3d.webp' in og_image[0]:
        errors.append(f'{rel}: og:image ausente ou usando logo generica em vez de imagem representativa.')

    parsed_blocks = []
    for block in re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', source, flags=re.I | re.S):
        try:
            parsed_blocks.append(json.loads(block))
        except json.JSONDecodeError as exc:
            errors.append(f'{rel}: JSON-LD invalido ({exc}).')

    flat_nodes = [node for block in parsed_blocks for node in walk_schema(block) if isinstance(node, dict)]

    for node in flat_nodes:
        schema_type = node.get('@type')
        types = {schema_type} if isinstance(schema_type, str) else set(schema_type or []) if isinstance(schema_type, list) else set()
        if 'ApplianceRepair' in types:
            errors.append(f'{rel}: usa o tipo JSON-LD invalido ApplianceRepair.')
        if LOCAL_TYPES & types and 'aggregateRating' in node:
            errors.append(f'{rel}: LocalBusiness nao deve publicar aggregateRating autoatribuido.')

    if canonical_url == HOME:
        types = []
        for node in flat_nodes:
            node_type = node.get('@type')
            if isinstance(node_type, str):
                types.append(node_type)
            elif isinstance(node_type, list):
                types.extend(node_type)
        if 'HomeAndConstructionBusiness' not in types:
            errors.append(f'{rel}: Home precisa publicar HomeAndConstructionBusiness valido.')
        if 'WebSite' not in types:
            errors.append(f'{rel}: Home precisa publicar WebSite para identidade do site.')

    if canonical_url and '/servicos/' in canonical_url and canonical_url != BASE + '/servicos/':
        services = [node for node in flat_nodes if node.get('@type') == 'Service']
        if not services:
            errors.append(f'{rel}: pagina de servico sem schema Service.')
        for service in services:
            provider = service.get('provider')
            if not isinstance(provider, dict):
                errors.append(f'{rel}: schema Service sem provider valido.')
                continue
            provider_type = provider.get('@type')
            provider_types = {provider_type} if isinstance(provider_type, str) else set(provider_type or []) if isinstance(provider_type, list) else set()
            if 'HomeAndConstructionBusiness' not in provider_types:
                errors.append(f'{rel}: provider do Service precisa ser HomeAndConstructionBusiness.')

sitemap = ROOT / 'sitemap.xml'
if not sitemap.exists():
    errors.append('sitemap.xml ausente.')
else:
    tree = ET.parse(sitemap)
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    urls = {el.text.strip() for el in tree.findall('.//sm:loc', ns) if el.text}
    missing = sorted(canonicals - urls)
    for url in missing:
        errors.append(f'sitemap.xml nao contem canonical: {url}')

robots = ROOT / 'robots.txt'
if not robots.exists():
    errors.append('robots.txt ausente.')
else:
    text = robots.read_text(encoding='utf-8')
    if 'Sitemap: https://assistenciadorus.com.br/sitemap.xml' not in text:
        errors.append('robots.txt nao aponta para o sitemap oficial.')

if errors:
    print('Falhas de SEO encontradas:')
    for error in errors:
        print('-', error)
    raise SystemExit(1)

print(f'OK: {len(canonicals)} paginas indexaveis validadas, sitemap, robots, imagens sociais e JSON-LD consistentes.')
