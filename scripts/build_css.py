from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = (
    'styles.css',
    'accessibility.css',
    'layout.css',
    'usability.css',
    'conversion-enhancements.css',
    'privacy.css',
    'ui-final.css',
    'compact-pages.css',
    'accessibility-contrast.css',
)
OUTPUT = ROOT / 'site.css'


def main():
    sections = []
    for filename in SOURCES:
        path = ROOT / filename
        if not path.is_file():
            raise SystemExit(f'CSS obrigatório ausente: {filename}')
        sections.append(f'/* {filename} */\n{path.read_text(encoding="utf-8").strip()}')
    OUTPUT.write_text('\n'.join(sections) + '\n', encoding='utf-8')
    print(f'CSS consolidado: {OUTPUT.name} ({OUTPUT.stat().st_size} bytes).')


if __name__ == '__main__':
    main()
