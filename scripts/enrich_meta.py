from pathlib import Path
import html
import re

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = 'https://assistenciadorus.com.br/'
SHARE_IMAGE = BASE_URL + 'assets/dorus-logo-3d.webp'


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


def relative_asset(rel: str, asset: str) -> str:
    depth = len(Path(rel).parent.parts)
    return '../' * depth + asset


def ensure_brand_icons(source: str, rel: str) -> str:
    # Remove referências antigas para evitar que navegadores ou crawlers
    # escolham a antiga logo WebP como favicon.
    source = re.sub(
        r'\s*<link\s+[^>]*rel=["\'][^"\']*(?:shortcut\s+)?icon[^"\']*["\'][^>]*>',
        '',
        source,
        flags=re.I,
    )
    source = re.sub(
        r'\s*<link\s+[^>]*rel=["\']apple-touch-icon["\'][^>]*>',
        '',
        source,
        flags=re.I,
    )
    source = re.sub(
        r'\s*<link\s+[^>]*rel=["\']manifest["\'][^>]*>',
        '',
        source,
        flags=re.I,
    )
    source = re.sub(
        r'\s*<meta\s+[^>]*name=["\']msapplication-TileColor["\'][^>]*>',
        '',
        source,
        flags=re.I,
    )
    source = re.sub(
        r'\s*<meta\s+[^>]*name=["\']msapplication-TileImage["\'][^>]*>',
        '',
        source,
        flags=re.I,
    )

    favicon_48 = relative_asset(rel, 'favicon-48x48.png')
    favicon_192 = relative_asset(rel, 'favicon-192x192.png')
    apple = relative_asset(rel, 'apple-touch-icon.png')
    manifest = relative_asset(rel, 'site.webmanifest')

    block = '\n'.join([
        f'  <link rel="icon" type="image/png" sizes="48x48" href="{favicon_48}">',
        f'  <link rel="icon" type="image/png" sizes="192x192" href="{favicon_192}">',
        f'  <link rel="apple-touch-icon" sizes="180x180" href="{apple}">',
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


def enrich(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix()
    original = path.read_text(encoding='utf-8')
    source = original

    title = first(r'<title>(.*?)</title>', source)
    description = first(r"<meta\s+name=['\"]description['\"]\s+content=['\"]([^'\"]+)", source)
    canonical = first(r"<link\s+rel=['\"]canonical['\"]\s+href=['\"]([^'\"]+)", source)

    if not title or not description or not canonical or '</head>' not in source.lower():
        return False

    source = ensure_brand_icons(source, rel)
    source = ensure_final_ui(source, rel)
    source = ensure_compact_pages(source, rel)

    source = set_meta(source, 'property', 'og:image', SHARE_IMAGE)
    source = set_meta(source, 'name', 'twitter:image', SHARE_IMAGE)

    additions: list[str] = []
    add_meta(additions, 'property', 'og:type', 'website', source)
    add_meta(additions, 'property', 'og:locale', 'pt_BR', source)
    add_meta(additions, 'property', 'og:site_name', 'D’orus Assistência Técnica', source)
    add_meta(additions, 'property', 'og:title', title, source)
    add_meta(additions, 'property', 'og:description', description, source)
    add_meta(additions, 'property', 'og:url', canonical, source)
    add_meta(additions, 'property', 'og:image', SHARE_IMAGE, source)
    add_meta(additions, 'property', 'og:image:alt', 'Logo da D’orus Assistência Técnica', source)
    add_meta(additions, 'name', 'twitter:card', 'summary_large_image', source)
    add_meta(additions, 'name', 'twitter:title', title, source)
    add_meta(additions, 'name', 'twitter:description', description, source)
    add_meta(additions, 'name', 'twitter:image', SHARE_IMAGE, source)
    add_meta(additions, 'name', 'twitter:image:alt', 'Logo da D’orus Assistência Técnica', source)

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
        if '.git' in page.parts:
            continue
        changed += int(enrich(page))
    print(f'Metadados sociais, identidade e UI final preparados em {changed} página(s).')


if __name__ == '__main__':
    main()
