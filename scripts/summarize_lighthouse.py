from __future__ import annotations

import json
import os
from pathlib import Path

FILES = {
    'Mobile': Path('lighthouse-mobile.json'),
    'Desktop': Path('lighthouse-desktop.json'),
}


def pct(value):
    return round((value or 0) * 100)


def metric(audits, key):
    item = audits.get(key, {})
    return item.get('displayValue', '—')


def read_report(path: Path):
    data = json.loads(path.read_text(encoding='utf-8'))
    categories = data.get('categories', {})
    audits = data.get('audits', {})
    return {
        'performance': pct(categories.get('performance', {}).get('score')),
        'accessibility': pct(categories.get('accessibility', {}).get('score')),
        'best_practices': pct(categories.get('best-practices', {}).get('score')),
        'seo': pct(categories.get('seo', {}).get('score')),
        'lcp': metric(audits, 'largest-contentful-paint'),
        'cls': metric(audits, 'cumulative-layout-shift'),
        'tbt': metric(audits, 'total-blocking-time'),
        'fcp': metric(audits, 'first-contentful-paint'),
        'speed_index': metric(audits, 'speed-index'),
    }


def main():
    results = {name: read_report(path) for name, path in FILES.items() if path.exists()}
    if not results:
        raise SystemExit('Nenhum relatório Lighthouse foi encontrado.')

    lines = [
        '# Lighthouse — Site D’orus',
        '',
        '| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT | FCP | Speed Index |',
        '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    ]

    for name, result in results.items():
        lines.append(
            f"| {name} | {result['performance']} | {result['accessibility']} | "
            f"{result['best_practices']} | {result['seo']} | {result['lcp']} | "
            f"{result['cls']} | {result['tbt']} | {result['fcp']} | {result['speed_index']} |"
        )

    lines += [
        '',
        '> Lighthouse mede dados de laboratório. LCP e CLS ajudam a antecipar Core Web Vitals; TBT é usado como sinal de responsividade em laboratório. INP real deve ser acompanhado depois com dados de usuários.',
    ]

    text = '\n'.join(lines) + '\n'
    print(text)

    summary = os.getenv('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as handle:
            handle.write(text)


if __name__ == '__main__':
    main()
