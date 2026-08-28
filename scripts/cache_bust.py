from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

# Arquivos estáticos que podem manter versões antigas no navegador/CDN.
ASSET_RE = re.compile(
    r'(?P<path>(?:https://kahcardim\.github\.io/Site-Dorus/)?'
    r'(?:(?:\.\./)+|\./|/Site-Dorus/)?'
    r'(?:assets/[^"\'\s<>]+\.(?:webp|svg)|'
    r'[^"\'\s<>/]+\.(?:css|js|svg)))'
    r'(?:\?v=[^"\'\s<>]+)?'
)


def main():
    if len(sys.argv) != 2 or not sys.argv[1].strip():
        raise SystemExit('Uso: python scripts/cache_bust.py <versao>')

    version = re.sub(r'[^A-Za-z0-9._-]', '', sys.argv[1].strip())
    if not version:
        raise SystemExit('Versao invalida')

    changed = 0
    for page in ROOT.rglob('*.html'):
        if '.git' in page.parts:
            continue
        source = page.read_text(encoding='utf-8')

        def repl(match):
            path = match.group('path')
            # Não altera URLs de terceiros. A única URL absoluta permitida aqui
            # é a do próprio GitHub Pages da D'orus.
            if path.startswith('http') and not path.startswith('https://assistenciadorus.com.br/'):
                return match.group(0)
            return f'{path}?v={version}'

        updated = ASSET_RE.sub(repl, source)
        if updated != source:
            page.write_text(updated, encoding='utf-8')
            changed += 1

    # O site.js usa esta mesma versão para módulos carregados dinamicamente e
    # para a logo 3D. Como a alteração ocorre só no artefato do Pages, o fonte
    # continua legível e cada deploy recebe uma versão única.
    site_js = ROOT / 'site.js'
    if site_js.exists():
        source = site_js.read_text(encoding='utf-8')
        updated = re.sub(
            r"var assetVersion = '[^']*';",
            f"var assetVersion = '{version}';",
            source,
            count=1,
        )
        if updated == source:
            raise SystemExit('site.js: declaração assetVersion não encontrada')
        site_js.write_text(updated, encoding='utf-8')

    print(f'Cache bust aplicado em {changed} páginas com versão {version}.')


if __name__ == '__main__':
    main()
