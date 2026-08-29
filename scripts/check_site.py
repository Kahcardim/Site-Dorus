from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
IGNORE_DIRS = {'.git'}
OLD_REPO_MARKER = 'dorus-menu-digital'
RESPONSIVE_CSS = 'layout.css'
SHARED_JS = 'site.js'
GLOBAL_MODULES = (
    'conversion-enhancements.css',
    'conversion-enhancements.js',
    'privacy.css',
    'privacy-consent.js',
    'accessibility-tools.js',
)

SERVICE_IMAGES = {
    'servicos/geladeiras/index.html': ('assets/servicos/servico-geladeira.webp', 'assets/servicos/mobile/servico-geladeira-mobile.webp'),
    'servicos/maquinas-de-lavar/index.html': ('assets/servicos/servico-lavadora.webp', 'assets/servicos/mobile/servico-lavadora-mobile.webp'),
    'servicos/fogoes/index.html': ('assets/servicos/servico-fogao.webp', 'assets/servicos/mobile/servico-fogao-mobile.webp'),
    'servicos/freezers/index.html': ('assets/servicos/servico-freezer.webp', 'assets/servicos/mobile/servico-freezer-mobile.webp'),
    'servicos/lava-loucas/index.html': ('assets/servicos/servico-lava-loucas.webp', 'assets/servicos/mobile/servico-lava-loucas-mobile.webp'),
    'servicos/lava-e-seca/index.html': ('assets/servicos/servico-lava-e-seca.webp', 'assets/servicos/mobile/servico-lava-e-seca-mobile.webp'),
    'servicos/fornos/index.html': ('assets/servicos/servico-forno.webp', 'assets/servicos/mobile/servico-forno-mobile.webp'),
    'servicos/micro-ondas/index.html': ('assets/servicos/servico-microondas.webp', 'assets/servicos/mobile/servico-microondas-mobile.webp'),
}

HOME_BANNERS = ('assets/banner-principal-dorus.webp', 'assets/banner-principal-dorus-mobile.webp')


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.has_h1 = False
        self.has_description = False
        self.has_canonical = False
        self.has_viewport = False
        self.html_lang = ''
        self.main_ids = set()
        self.skip_links = []
        self.images_without_alt = []
        self.blank_links_without_rel = []
        self._in_title = False
        self._title_text = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html':
            self.html_lang = attrs.get('lang', '').strip()
        if tag == 'title':
            self._in_title = True
        if tag == 'h1':
            self.has_h1 = True
        if tag == 'main' and attrs.get('id'):
            self.main_ids.add(attrs['id'])
        if tag == 'meta':
            name = attrs.get('name', '').lower()
            if name == 'description' and attrs.get('content', '').strip():
                self.has_description = True
            if name == 'viewport' and attrs.get('content', '').strip():
                self.has_viewport = True
        if tag == 'link' and attrs.get('rel', '').lower() == 'canonical' and attrs.get('href', '').strip():
            self.has_canonical = True
        if tag == 'a':
            href = attrs.get('href')
            if href:
                self.links.append(href)
                if 'skip-link' in attrs.get('class', '').split():
                    self.skip_links.append(href)
            if attrs.get('target') == '_blank':
                rel = set(attrs.get('rel', '').lower().split())
                if not {'noopener', 'noreferrer'}.issubset(rel):
                    self.blank_links_without_rel.append(href or '(sem href)')
        elif tag in {'link', 'script', 'img'}:
            key = {'link': 'href', 'script': 'src', 'img': 'src'}[tag]
            value = attrs.get(key)
            if value:
                self.links.append(value)
            if tag == 'img' and 'alt' not in attrs:
                self.images_without_alt.append(value or '(img sem src)')
        if tag == 'source':
            value = attrs.get('srcset')
            if value:
                self.links.append(value.split()[0])

    def handle_endtag(self, tag):
        if tag == 'title':
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self._title_text.append(data)


def internal_target(page: Path, raw: str):
    raw = raw.strip()
    if not raw or raw.startswith(('#', 'mailto:', 'tel:', 'javascript:', 'data:')):
        return None
    parsed = urlparse(raw)
    if parsed.scheme or parsed.netloc or raw.startswith('//'):
        return None
    path = unquote(parsed.path)
    if not path:
        return None
    if path.startswith('/'):
        if path.startswith('/Site-Dorus/'):
            target = ROOT / path[len('/Site-Dorus/'):]
        elif path == '/Site-Dorus':
            target = ROOT
        else:
            return None
    else:
        target = (page.parent / path).resolve()
    return target


def target_exists(target: Path):
    if target.exists():
        if target.is_dir():
            return (target / 'index.html').exists()
        return True
    return (target / 'index.html').exists()


def check_responsive_assets(errors):
    home = ROOT / 'index.html'
    home_source = home.read_text(encoding='utf-8')
    for asset in HOME_BANNERS:
        if not (ROOT / asset).exists():
            errors.append(f'index.html: banner ausente no repositório: {asset}')
        if asset not in home_source:
            errors.append(f'index.html: banner não está referenciado no HTML: {asset}')

    layout_css = (ROOT / 'layout.css').read_text(encoding='utf-8')
    if 'max-height:850px' not in layout_css:
        errors.append('layout.css: falta breakpoint por altura para notebooks/desktop baixo')
    if not re.search(r'hero-media\s+picture>img\s*\{[^}]*object-fit\s*:\s*contain', layout_css, re.S | re.I):
        errors.append('layout.css: banner da Home não garante object-fit: contain')

    for page_rel, assets in SERVICE_IMAGES.items():
        page = ROOT / page_rel
        if not page.exists():
            errors.append(f'{page_rel}: página de serviço ausente')
            continue
        source = page.read_text(encoding='utf-8')
        if '<picture' not in source or '<source' not in source:
            errors.append(f'{page_rel}: não usa <picture>/<source> para imagem responsiva')
        for asset in assets:
            if not (ROOT / asset).exists():
                errors.append(f'{page_rel}: asset responsivo ausente: {asset}')
            filename = Path(asset).name
            if filename not in source:
                errors.append(f'{page_rel}: não referencia o asset esperado: {filename}')


def check_global_modules(errors):
    site_js = ROOT / SHARED_JS
    if not site_js.exists():
        errors.append(f'{SHARED_JS}: arquivo global ausente')
        return
    source = site_js.read_text(encoding='utf-8')
    for module in GLOBAL_MODULES:
        if not (ROOT / module).exists():
            errors.append(f'{module}: módulo global ausente')
        if module not in source:
            errors.append(f'{SHARED_JS}: não carrega o módulo global {module}')


def check_accessibility_and_privacy(errors):
    accessibility_css = (ROOT / 'accessibility.css').read_text(encoding='utf-8')
    accessibility_js = (ROOT / 'accessibility-tools.js').read_text(encoding='utf-8')
    privacy_js = (ROOT / 'privacy-consent.js').read_text(encoding='utf-8')
    enrich = (ROOT / 'scripts/enrich_meta.py').read_text(encoding='utf-8')

    for marker in ('focus-visible', 'prefers-reduced-motion', 'a11y-high-contrast'):
        if marker not in accessibility_css:
            errors.append(f'accessibility.css: critério de acessibilidade ausente: {marker}')
    for marker in ('speechSynthesis', 'SpeechRecognition', 'aria-live'):
        if marker not in accessibility_js:
            errors.append(f'accessibility-tools.js: recurso de áudio/voz ausente: {marker}')
    for marker in ('SameSite=Lax', 'Secure', 'privacidade/'):
        if marker not in privacy_js:
            errors.append(f'privacy-consent.js: requisito de privacidade ausente: {marker}')
    if not (ROOT / 'privacidade/index.html').exists():
        errors.append('privacidade/index.html: política de privacidade ausente')
    if 'GENERAL_SHARE_IMAGE' not in enrich or 'assets/banner-principal-dorus.webp' not in enrich or 'og:image' not in enrich:
        errors.append('scripts/enrich_meta.py: compartilhamento não está padronizado com uma imagem representativa da D’orus')
    if 'SERVICE_SHARE_IMAGES' not in enrich:
        errors.append('scripts/enrich_meta.py: páginas de serviço não possuem imagens sociais específicas')


def main():
    errors = []
    pages = sorted(p for p in ROOT.rglob('*.html') if not any(part in IGNORE_DIRS for part in p.parts))

    for page in pages:
        rel = page.relative_to(ROOT)
        try:
            source = page.read_text(encoding='utf-8')
            parser = PageParser()
            parser.feed(source)
        except Exception as exc:
            errors.append(f'{rel}: HTML não pôde ser lido: {exc}')
            continue

        title = ''.join(parser._title_text).strip()
        if not title:
            errors.append(f'{rel}: falta <title>')
        if parser.html_lang.lower() != 'pt-br':
            errors.append(f'{rel}: lang deve ser pt-BR')
        if not parser.has_viewport:
            errors.append(f'{rel}: falta meta viewport')
        if page.name != '404.html' and not parser.has_description:
            errors.append(f'{rel}: falta meta description')
        if page.name != '404.html' and not parser.has_canonical:
            errors.append(f'{rel}: falta URL canônica')
        if not parser.has_h1:
            errors.append(f'{rel}: falta <h1>')
        if page.name != '404.html' and 'conteudo' not in parser.main_ids:
            errors.append(f'{rel}: <main> precisa usar id="conteudo"')
        if page.name != '404.html' and '#conteudo' not in parser.skip_links:
            errors.append(f'{rel}: falta skip-link para #conteudo')
        for image in parser.images_without_alt:
            errors.append(f'{rel}: imagem sem atributo alt: {image}')
        for link in parser.blank_links_without_rel:
            errors.append(f'{rel}: target="_blank" sem noopener+noreferrer: {link}')

        if OLD_REPO_MARKER in source:
            errors.append(f'{rel}: ainda depende do repositório antigo ({OLD_REPO_MARKER})')
        if RESPONSIVE_CSS not in source and 'site.css' not in source:
            errors.append(f'{rel}: não carrega a camada responsiva {RESPONSIVE_CSS}')
        if page.name != '404.html' and SHARED_JS not in source:
            errors.append(f'{rel}: não carrega o JavaScript compartilhado {SHARED_JS}')

        # Evita mixed content quando o domínio estiver sob HTTPS/SSL.
        insecure = [m.group(0) for m in re.finditer(r'http://(?!www\.w3\.org)', source, flags=re.I)]
        if insecure:
            errors.append(f'{rel}: contém referência HTTP insegura (mixed content)')

        for link in parser.links:
            target = internal_target(page, link)
            if target is not None and not target_exists(target):
                try:
                    display = target.relative_to(ROOT)
                except ValueError:
                    display = target
                errors.append(f'{rel}: referência interna quebrada: {link} -> {display}')

    check_responsive_assets(errors)
    check_global_modules(errors)
    check_accessibility_and_privacy(errors)

    if errors:
        print('Falhas encontradas:')
        for error in errors:
            print(f' - {error}')
        return 1

    print(
        f'OK: {len(pages)} páginas verificadas; UX responsivo, links, imagens, acessibilidade, '
        'privacidade, segurança HTTPS e módulos globais validados.'
    )
    return 0


if __name__ == '__main__':
    sys.exit(main())
