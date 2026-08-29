from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://assistenciadorus.com.br'

errors = []
canonicals = set()

for page in sorted(ROOT.rglob('*.html')):
    if '.git' in page.parts or page.name == '404.html':
        continue
    rel = page.relative_to(ROOT).as_posix()
    source = page.read_text(encoding='utf-8')

    title = re.findall(r'<title>(.*?)</title>', source, flags=re.I | re.S)
    desc = re.findall(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)', source, flags=re.I)
    canonical = re.findall(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', source, flags=re.I)
    h1 = re.findall(r'<h1\b', source, flags=re.I)

    if len(title) != 1 or not title[0].strip():
        errors.append(f'{rel}: precisa ter exatamente um <title>.')
    if len(desc) != 1 or len(desc[0].strip()) < 50:
        errors.append(f'{rel}: meta description ausente ou curta demais.')
    if len(canonical) != 1 or not canonical[0].startswith(BASE + '/'):
        errors.append(f'{rel}: canonical ausente ou fora do dominio oficial.')
    else:
        canonicals.add(canonical[0])
    if len(h1) != 1:
        errors.append(f'{rel}: precisa ter exatamente um H1; encontrados {len(h1)}.')
    if '/Site-Dorus/' in source:
        errors.append(f'{rel}: ainda contem caminho legado /Site-Dorus/.')
    if re.search(r'<meta\s+name=["\']robots["\'][^>]*content=["\'][^"\']*noindex', source, flags=re.I):
        errors.append(f'{rel}: pagina publica marcada como noindex.')

    if '"@type":"ApplianceRepair"' in source or '"@type": "ApplianceRepair"' in source:
        errors.append(f'{rel}: usa o tipo JSON-LD invalido ApplianceRepair.')

    for block in re.findall(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', source, flags=re.I | re.S):
        try:
            json.loads(block)
        except json.JSONDecodeError as exc:
            errors.append(f'{rel}: JSON-LD invalido ({exc}).')

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

print(f'OK: {len(canonicals)} paginas indexaveis validadas, sitemap, robots e JSON-LD consistentes.')
