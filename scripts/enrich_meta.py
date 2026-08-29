from pathlib import Path
import html
import json
import re
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://assistenciadorus.com.br/'
GENERAL_SHARE_IMAGE = ('assets/banner-principal-dorus.webp', 'Linha branca atendida pela D’orus Assistência Técnica', 1693, 929)
SERVICE_SHARE_IMAGES = {
    '/servicos/geladeiras/': ('assets/servicos/servico-geladeira.webp', 'Geladeira atendida pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/maquinas-de-lavar/': ('assets/servicos/servico-lavadora.webp', 'Máquina de lavar atendida pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/fogoes/': ('assets/servicos/servico-fogao.webp', 'Fogão atendido pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/freezers/': ('assets/servicos/servico-freezer.webp', 'Freezer atendido pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/lava-loucas/': ('assets/servicos/servico-lava-loucas.webp', 'Lava-louças atendida pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/lava-e-seca/': ('assets/servicos/servico-lava-e-seca.webp', 'Lava e seca atendida pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/fornos/': ('assets/servicos/servico-forno.webp', 'Forno atendido pela D’orus Assistência Técnica', 1254, 1254),
    '/servicos/micro-ondas/': ('assets/servicos/servico-microondas.webp', 'Micro-ondas atendido pela D’orus Assistência Técnica', 1254, 1254),
}
SITE_NAME = 'D’orus Assistência Técnica'


def first(pattern: str, source: str) -> str | None:
    match = re.search(pattern, source, flags=re.I | re.S)
    return html.unescape(match.group(1).strip()) if match else None


def has_meta(source: str, key: str, value: str) -> bool:
    pattern = rf"<meta\s+[^>]*{key}=['\"]{re.escape(value)}['\"][^>]*>"
    return bool(re.search(pattern, source, flags=re.I))


def add_meta(lines: list[str], key: str, value: str, content: str, source: str) -> None:
    if has_meta(source, key, value):
        return
    escaped = html.escape(content, quote=True)
    lines.append(f'  <meta {key}="{value}" content="{escaped}">')


def set_meta(source: str, key: str, value: str, content: str) -> str:
    escaped = html.escape(content, quote=True)
    pattern = rf"<meta\s+[^>]*{key}=['\"]{re.escape(value)}['\"][^>]*>"
    replacement = f'<meta {key}="{value}" content="{escaped}">'
    if re.search(pattern, source, flags=re.I):
        return re.sub(pattern, replacement, source, count=1, flags=re.I)
    return source


def normalize_structured_data(source: str, canonical: str) -> str:
    """Normaliza JSON-LD legado antes de publicar.

    ApplianceRepair não é um tipo Schema.org. Para uma assistência técnica
    residencial, HomeAndConstructionBusiness é um subtipo válido de
    LocalBusiness e mantém a semântica correta para o Google.

    A nota agregada da própria empresa continua visível no HTML, mas não é
    enviada como AggregateRating porque avaliações autoatribuídas de
    LocalBusiness/Organization não são elegíveis a estrelas orgânicas.
    """
    source = re.sub(
        r'("@type"\s*:\s*)"ApplianceRepair"',
        r'\1"HomeAndConstructionBusiness"',
        source,
        flags=re.I,
    )

    if canonical == BASE_URL:
        source = re.sub(
            r',\s*"aggregateRating"\s*:\s*\{[^{}]*\}',
            '',
            source,
            flags=re.I,
        )
    return source


def preferred_share_image(canonical: str) -> tuple[str, str, int, int]:
    path = urlparse(canonical).path or '/'
    asset, alt, width, height = SERVICE_SHARE_IMAGES.get(path, GENERAL_SHARE_IMAGE)
    return BASE_URL + asset, alt, width, height


def relative_asset(rel: str, asset: str) -> str:
    depth = len(Path(rel).parent.parts)
    return '../' * depth + asset


def ensure_brand_icons(source: str, rel: str) -> str:
    source = re.sub(r'\s*<link\s+[^>]*rel=["\'][^"\']*(?:shortcut\s+)?icon[^"\']*["\'][^>]*>', '', source, flags=re.I)
    source = re.sub(r'\s*<link\s+[^>]*rel=["\']apple-touch-icon["\'][^>]*>', '', source, flags=re.I)
    source = re.sub(r'\s*<link\s+[^>]*rel=["\']manifest["\'][^>]*>', '', source, flags=re.I)
    source = re.sub(r'\s*<meta\s+[^>]*name=["\']msapplication-TileColor["\'][^>]*>', '', source, flags=re.I)
    source = re.sub(r'\s*<meta\s+[^>]*name=["\']msapplication-TileImage["\'][^>]*>', '', source, flags=re.I)

    favicon_48 = relative_asset(rel, 'favicon-48x48.png')
    favicon_192 = relative_asset(rel, 'favicon-192x192.png')
    manifest = relative_asset(rel, 'site.webmanifest')

    block = '\n'.join([
        f'  <link rel="icon" type="image/png" sizes="48x48" href="{favicon_48}">',
        f'  <link rel="icon" type="image/png" sizes="192x192" href="{favicon_192}">',
        f'  <link rel="apple-touch-icon" sizes="192x192" href="{favicon_192}">',
        f'  <link rel="manifest" href="{manifest}">',
        '  <meta name="msapplication-TileColor" content="#0d3b8e">',
        f'  <meta name="msapplication-TileImage" content="{favicon_192}">',
    ])
    return re.sub(r'</head>', block + '\n</head>', source, count=1, flags=re.I)


def ensure_final_ui(source: str, rel: str) -> str:
    if re.search(r'<link\s+[^>]*href=["\'][^"\']*ui-final\.css', source, flags=re.I):
        return source
    href = relative_asset(rel, 'ui-final.css')
    link = f'<link rel="stylesheet" href="{href}">'
    accessibility = re.search(r'<link\s+[^>]*href=["\'][^"\']*accessibility\.css[^"\']*["\'][^>]*>', source, flags=re.I)
    if accessibility:
        return source[:accessibility.end()] + '\n  ' + link + source[accessibility.end():]
    return re.sub(r'</head>', '  ' + link + '\n</head>', source, count=1, flags=re.I)


def ensure_compact_pages(source: str, rel: str) -> str:
    if re.search(r'<link\s+[^>]*href=["\'][^"\']*compact-pages\.css', source, flags=re.I):
        return source
    href = relative_asset(rel, 'compact-pages.css')
    link = f'<link rel="stylesheet" href="{href}">'
    final_ui = re.search(r'<link\s+[^>]*href=["\'][^"\']*ui-final\.css[^"\']*["\'][^>]*>', source, flags=re.I)
    if final_ui:
        return source[:final_ui.end()] + '\n  ' + link + source[final_ui.end():]
    return re.sub(r'</head>', '  ' + link + '\n</head>', source, count=1, flags=re.I)


def ensure_language_links(source: str, canonical: str) -> str:
    source = re.sub(r'\s*<link\s+[^>]*rel=["\']alternate["\'][^>]*hreflang=["\'][^"\']+["\'][^>]*>', '', source, flags=re.I)
    block = '\n'.join([
        f'  <link rel="alternate" hreflang="pt-BR" href="{canonical}">',
        f'  <link rel="alternate" hreflang="x-default" href="{canonical}">',
    ])
    return re.sub(r'</head>', block + '\n</head>', source, count=1, flags=re.I)


def breadcrumb_name(slug: str) -> str:
    labels = {
        'sobre': 'Sobre',
        'servicos': 'Serviços',
        'geladeiras': 'Geladeiras',
        'maquinas-de-lavar': 'Máquinas de lavar',
        'fogoes': 'Fogões',
        'freezers': 'Freezers',
        'lava-loucas': 'Lava-louças',
        'lava-e-seca': 'Lava e seca',
        'fornos': 'Fornos',
        'micro-ondas': 'Micro-ondas',
        'curiosidades': 'Curiosidades',
        'agendamento': 'Agendamento',
        'fale-conosco': 'Fale conosco',
        'privacidade': 'Privacidade',
    }
    return labels.get(slug, slug.replace('-', ' ').title())


def ensure_jsonld(source: str, marker_id: str, data: dict) -> str:
    if f'"@id":"{marker_id}"' in source or f'"@id": "{marker_id}"' in source:
        return source
    payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    block = f'  <script type="application/ld+json">{payload}</script>\n'
    return re.sub(r'</head>', block + '</head>', source, count=1, flags=re.I)


def ensure_structured_navigation(source: str, canonical: str) -> str:
    parsed = urlparse(canonical)
    parts = [p for p in parsed.path.split('/') if p]

    website_id = BASE_URL + '#website'
    if canonical == BASE_URL:
        website = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': website_id,
            'url': BASE_URL,
            'name': SITE_NAME,
            'alternateName': ['D’orus', 'Dorus Assistência Técnica'],
            'inLanguage': 'pt-BR',
        }
        source = ensure_jsonld(source, website_id, website)

    if not parts:
        return source

    items = [{'@type': 'ListItem', 'position': 1, 'name': 'Início', 'item': BASE_URL}]
    cumulative = BASE_URL
    for position, part in enumerate(parts, start=2):
        cumulative += part + '/'
        items.append({
            '@type': 'ListItem',
            'position': position,
            'name': breadcrumb_name(part),
            'item': cumulative,
        })

    breadcrumb_id = canonical + '#breadcrumb'
    breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': breadcrumb_id,
        'itemListElement': items,
    }
    return ensure_jsonld(source, breadcrumb_id, breadcrumb)


def enrich(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    original = path.read_text(encoding='utf-8')
    source = original

    title = first(r'<title>(.*?)</title>', source)
    description = first(r"<meta\s+name=['\"]description['\"]\s+content=['\"]([^'\"]+)", source)
    canonical = first(r"<link\s+rel=['\"]canonical['\"]\s+href=['\"]([^'\"]+)", source)

    if not title or not description or not canonical or '</head>' not in source.lower():
        return False

    source = normalize_structured_data(source, canonical)
    source = ensure_brand_icons(source, rel)
    source = ensure_final_ui(source, rel)
    source = ensure_compact_pages(source, rel)
    source = ensure_language_links(source, canonical)
    source = ensure_structured_navigation(source, canonical)

    share_image, share_alt, share_width, share_height = preferred_share_image(canonical)
    source = set_meta(source, 'name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1')
    source = set_meta(source, 'property', 'og:image', share_image)
    source = set_meta(source, 'property', 'og:image:alt', share_alt)
    source = set_meta(source, 'name', 'twitter:image', share_image)
    source = set_meta(source, 'name', 'twitter:image:alt', share_alt)

    additions: list[str] = []
    add_meta(additions, 'property', 'og:type', 'website', source)
    add_meta(additions, 'property', 'og:locale', 'pt_BR', source)
    add_meta(additions, 'property', 'og:site_name', SITE_NAME, source)
    add_meta(additions, 'property', 'og:title', title, source)
    add_meta(additions, 'property', 'og:description', description, source)
    add_meta(additions, 'property', 'og:url', canonical, source)
    add_meta(additions, 'property', 'og:image', share_image, source)
    add_meta(additions, 'property', 'og:image:alt', share_alt, source)
    add_meta(additions, 'property', 'og:image:width', str(share_width), source)
    add_meta(additions, 'property', 'og:image:height', str(share_height), source)
    add_meta(additions, 'name', 'twitter:card', 'summary_large_image', source)
    add_meta(additions, 'name', 'twitter:title', title, source)
    add_meta(additions, 'name', 'twitter:description', description, source)
    add_meta(additions, 'name', 'twitter:image', share_image, source)
    add_meta(additions, 'name', 'twitter:image:alt', share_alt, source)

    if additions:
        insertion = '\n'.join(additions) + '\n'
        source = re.sub(r'</head>', insertion + '</head>', source, count=1, flags=re.I)

    if source == original:
        return False

    path.write_text(source, encoding='utf-8')
    print(f'Enriquecido: {rel}')
    return True


def main() -> None:
    changed = 0
    for page in sorted(ROOT.rglob('*.html')):
        if '.git' in page.parts or page.name == '404.html':
            continue
        changed += int(enrich(page))
    print(f'Metadados sociais, identidade e SEO técnico preparados em {changed} página(s).')


if __name__ == '__main__':
    main()
