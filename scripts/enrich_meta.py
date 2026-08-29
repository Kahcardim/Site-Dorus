from pathlib import Path
import html
import json
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://assistenciadorus.com.br/'
SITE_NAME = 'D’orus Assistência Técnica'
ORGANIZATION_ID = BASE_URL + '#organization'
GENERAL_SHARE_IMAGE = ('assets/banner-principal-dorus.webp', 'Eletrodomésticos de linha branca atendidos pela D’orus', 1693, 929)
SERVICE_SHARE_IMAGES = {
    '/servicos/geladeiras/': ('assets/servicos/servico-geladeira.webp', 'Geladeira atendida pela D’orus', 1254, 1254),
    '/servicos/maquinas-de-lavar/': ('assets/servicos/servico-lavadora.webp', 'Máquina de lavar atendida pela D’orus', 1254, 1254),
    '/servicos/fogoes/': ('assets/servicos/servico-fogao.webp', 'Fogão atendido pela D’orus', 1254, 1254),
    '/servicos/freezers/': ('assets/servicos/servico-freezer.webp', 'Freezer atendido pela D’orus', 1254, 1254),
    '/servicos/lava-loucas/': ('assets/servicos/servico-lava-loucas.webp', 'Lava-louças atendida pela D’orus', 1254, 1254),
    '/servicos/lava-e-seca/': ('assets/servicos/servico-lava-e-seca.webp', 'Lava e seca atendida pela D’orus', 1254, 1254),
    '/servicos/fornos/': ('assets/servicos/servico-forno.webp', 'Forno atendido pela D’orus', 1254, 1254),
    '/servicos/micro-ondas/': ('assets/servicos/servico-microondas.webp', 'Micro-ondas atendido pela D’orus', 1254, 1254),
    '/curiosidades/geladeira-nao-gela/': ('assets/servicos/servico-geladeira.webp', 'Geladeira atendida pela D’orus', 1254, 1254),
    '/curiosidades/geladeira-fazendo-barulho/': ('assets/servicos/servico-geladeira.webp', 'Geladeira atendida pela D’orus', 1254, 1254),
    '/curiosidades/maquina-nao-centrifuga/': ('assets/servicos/servico-lavadora.webp', 'Máquina de lavar atendida pela D’orus', 1254, 1254),
    '/curiosidades/freezer-nao-congela/': ('assets/servicos/servico-freezer.webp', 'Freezer atendido pela D’orus', 1254, 1254),
    '/curiosidades/fogao-nao-acende/': ('assets/servicos/servico-fogao.webp', 'Fogão atendido pela D’orus', 1254, 1254),
    '/curiosidades/micro-ondas-nao-aquece/': ('assets/servicos/servico-microondas.webp', 'Micro-ondas atendido pela D’orus', 1254, 1254),
}
LEGACY_TYPES = {'ApplianceRepair', 'HomeAndConstructionBusiness', 'LocalBusiness'}


def first(pattern, source):
    match = re.search(pattern, source, flags=re.I | re.S)
    return html.unescape(match.group(1).strip()) if match else None


def relative_asset(rel, asset):
    depth = len(Path(rel).parent.parts)
    return '../' * depth + asset


def normalize_schema_value(value):
    if isinstance(value, list):
        return [normalize_schema_value(item) for item in value]
    if not isinstance(value, dict):
        return value
    normalized = {k: normalize_schema_value(v) for k, v in value.items()}
    schema_type = normalized.get('@type')
    if isinstance(schema_type, str) and schema_type in LEGACY_TYPES:
        normalized['@type'] = 'Organization'
        schema_type = 'Organization'
    elif isinstance(schema_type, list):
        normalized['@type'] = ['Organization' if item in LEGACY_TYPES else item for item in schema_type]
        schema_type = normalized['@type']
    types = {schema_type} if isinstance(schema_type, str) else set(schema_type or [])
    if 'Organization' in types:
        normalized.setdefault('@id', ORGANIZATION_ID)
        normalized.pop('address', None)
        normalized.pop('aggregateRating', None)
    return normalized


def normalize_structured_data(source):
    pattern = re.compile(r'(<script\s+type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)', re.I | re.S)
    def replace(match):
        try:
            data = json.loads(match.group(2))
        except json.JSONDecodeError:
            return match.group(0)
        payload = json.dumps(normalize_schema_value(data), ensure_ascii=False, separators=(',', ':'))
        return match.group(1) + payload + match.group(3)
    return pattern.sub(replace, source)


def ensure_stylesheet(source, rel, filename):
    if re.search(rf'<link\s+[^>]*href=["\'][^"\']*{re.escape(filename)}', source, re.I):
        return source
    href = relative_asset(rel, filename)
    return re.sub(r'</head>', f'  <link rel="stylesheet" href="{href}">\n</head>', source, count=1, flags=re.I)


def ensure_icons(source, rel):
    source = re.sub(r'\s*<link\s+[^>]*rel=["\'][^"\']*(?:shortcut\s+)?icon[^"\']*["\'][^>]*>', '', source, flags=re.I)
    source = re.sub(r'\s*<link\s+[^>]*rel=["\']apple-touch-icon["\'][^>]*>', '', source, flags=re.I)
    source = re.sub(r'\s*<link\s+[^>]*rel=["\']manifest["\'][^>]*>', '', source, flags=re.I)
    block = '\n'.join([
        f'  <link rel="icon" type="image/png" sizes="48x48" href="{relative_asset(rel, "favicon-48x48.png")}">',
        f'  <link rel="icon" type="image/png" sizes="192x192" href="{relative_asset(rel, "favicon-192x192.png")}">',
        f'  <link rel="apple-touch-icon" sizes="192x192" href="{relative_asset(rel, "favicon-192x192.png")}">',
        f'  <link rel="manifest" href="{relative_asset(rel, "site.webmanifest")}">',
    ])
    return re.sub(r'</head>', block + '\n</head>', source, count=1, flags=re.I)


def set_meta(source, key, value, content):
    escaped = html.escape(content, quote=True)
    pattern = rf'<meta\s+[^>]*{key}=["\']{re.escape(value)}["\'][^>]*>'
    replacement = f'<meta {key}="{value}" content="{escaped}">'
    if re.search(pattern, source, re.I):
        return re.sub(pattern, replacement, source, count=1, flags=re.I)
    return re.sub(r'</head>', '  ' + replacement + '\n</head>', source, count=1, flags=re.I)


def ensure_alternate(source, canonical):
    source = re.sub(r'\s*<link\s+[^>]*rel=["\']alternate["\'][^>]*hreflang=["\'][^"\']+["\'][^>]*>', '', source, flags=re.I)
    block = f'  <link rel="alternate" hreflang="pt-BR" href="{canonical}">\n  <link rel="alternate" hreflang="x-default" href="{canonical}">\n'
    return re.sub(r'</head>', block + '</head>', source, count=1, flags=re.I)


def breadcrumb_name(slug):
    labels = {
        'sobre':'Sobre','servicos':'Serviços','geladeiras':'Geladeiras','maquinas-de-lavar':'Máquinas de lavar',
        'fogoes':'Fogões','freezers':'Freezers','lava-loucas':'Lava-louças','lava-e-seca':'Lava e seca','fornos':'Fornos',
        'micro-ondas':'Micro-ondas','curiosidades':'Guias','geladeira-nao-gela':'Geladeira não gela',
        'maquina-nao-centrifuga':'Máquina não centrifuga','geladeira-fazendo-barulho':'Geladeira fazendo barulho',
        'freezer-nao-congela':'Freezer não congela','fogao-nao-acende':'Fogão não acende','micro-ondas-nao-aquece':'Micro-ondas não aquece',
        'agendamento':'Agendamento','fale-conosco':'Fale conosco','privacidade':'Privacidade'
    }
    return labels.get(slug, slug.replace('-', ' ').title())


def ensure_breadcrumb(source, canonical):
    parts = [p for p in urlparse(canonical).path.split('/') if p]
    if not parts or '#breadcrumb' in source:
        return source
    items = [{'@type':'ListItem','position':1,'name':'Início','item':BASE_URL}]
    current = BASE_URL
    for position, part in enumerate(parts, 2):
        current += part + '/'
        items.append({'@type':'ListItem','position':position,'name':breadcrumb_name(part),'item':current})
    data = {'@context':'https://schema.org','@type':'BreadcrumbList','@id':canonical+'#breadcrumb','itemListElement':items}
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    return re.sub(r'</head>', f'  <script type="application/ld+json">{payload}</script>\n</head>', source, count=1, flags=re.I)


def preferred_share_image(canonical):
    return SERVICE_SHARE_IMAGES.get(urlparse(canonical).path or '/', GENERAL_SHARE_IMAGE)


def enrich(path):
    rel = path.relative_to(ROOT).as_posix()
    original = path.read_text(encoding='utf-8')
    source = original
    title = first(r'<title>(.*?)</title>', source)
    desc = first(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)', source)
    canonical = first(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', source)
    if not title or not desc or not canonical or '</head>' not in source.lower():
        return False
    source = normalize_structured_data(source)
    source = ensure_icons(source, rel)
    for css in ('ui-final.css', 'compact-pages.css', 'accessibility-contrast.css'):
        source = ensure_stylesheet(source, rel, css)
    source = ensure_alternate(source, canonical)
    source = ensure_breadcrumb(source, canonical)
    asset, alt, width, height = preferred_share_image(canonical)
    image_url = BASE_URL + asset
    for key, value, content in [
        ('name','robots','index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'),
        ('property','og:type','website'),('property','og:locale','pt_BR'),('property','og:site_name',SITE_NAME),
        ('property','og:title',title),('property','og:description',desc),('property','og:url',canonical),
        ('property','og:image',image_url),('property','og:image:alt',alt),('property','og:image:width',str(width)),('property','og:image:height',str(height)),
        ('name','twitter:card','summary_large_image'),('name','twitter:title',title),('name','twitter:description',desc),('name','twitter:image',image_url),('name','twitter:image:alt',alt)
    ]:
        source = set_meta(source, key, value, content)
    if source != original:
        path.write_text(source, encoding='utf-8')
        print('Enriquecido:', rel)
        return True
    return False


def main():
    changed = 0
    for page in sorted(ROOT.rglob('*.html')):
        if '.git' in page.parts or page.name == '404.html':
            continue
        changed += int(enrich(page))
    print(f'Metadados, Schema e identidade preparados em {changed} página(s).')

if __name__ == '__main__':
    main()
