"""Verifica rotas, assets e acessibilidade básica das páginas principais, sem rede."""
import json
import posixpath
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids, self.duplicates = [], set(), []
        self.h1 = 0
        self.lang = None
        self.labels = []
        self.controls = []
        self.label_depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'html':
            self.lang = a.get('lang')
        if tag == 'h1':
            self.h1 += 1
        if a.get('id'):
            if a['id'] in self.ids:
                self.duplicates.append(a['id'])
            self.ids.add(a['id'])
        if tag in ('a', 'link', 'script', 'img'):
            url = a.get('src') if tag in ('script', 'img') else a.get('href')
            if url:
                self.links.append(url)
        if tag == 'label':
            self.label_depth += 1
            if a.get('for'):
                self.labels.append(a['for'])
        if tag in ('input', 'select', 'textarea') and a.get('type') not in ('hidden', 'submit', 'button'):
            self.controls.append((a, self.label_depth > 0))

    def handle_endtag(self, tag):
        if tag == 'label':
            self.label_depth = max(0, self.label_depth - 1)


def resolve(url, current):
    parts = urlsplit(url)
    if parts.scheme or parts.netloc or not parts.path:
        return True
    path = unquote(parts.path)
    route = posixpath.normpath(path.lstrip('/') if path.startswith('/') else str(current.parent.as_posix()) + '/' + path)
    if route in REDIRECTS:
        return True
    file = ROOT / route
    return file.is_file() or (file / 'index.html').is_file() or file.with_suffix('.html').is_file()


REDIRECTS = {line.split()[0].lstrip('/') for line in (ROOT / '_redirects').read_text().splitlines() if line.strip() and not line.startswith('#')}


def audit():
    catalog = json.loads((ROOT / 'assets/v4/services.json').read_text(encoding='utf-8'))
    paths = {Path('index.html'), Path('guias/index.html')}
    paths.update(Path(p) for p in ('clima/index.html', 'clima/itajai/index.html', 'clima/blumenau/index.html', 'clima/santa-catarina/index.html'))
    paths.update(Path('conteudo') / name for name in ('sobre.html', 'contato.html', 'politica-privacidade.html', 'termos-de-uso.html'))
    errors = []
    routes = set()
    for service in catalog:
        route = service['href']
        if route in routes:
            errors.append('Rota duplicada no catálogo: ' + route)
        routes.add(route)
        path = Path(route.lstrip('/'))
        path = path / 'index.html' if route.endswith('/') else path.with_suffix('.html')
        paths.add(path)
    for path in sorted(paths):
        if not (ROOT / path).is_file():
            errors.append(f'{path}: página ausente')
            continue
        page = Page()
        page.feed((ROOT / path).read_text(encoding='utf-8'))
        if page.lang != 'pt-BR':
            errors.append(f'{path}: idioma ausente/incorreto')
        if page.h1 != 1:
            errors.append(f'{path}: quantidade de h1 = {page.h1}')
        for duplicate in page.duplicates:
            errors.append(f'{path}: ID duplicado {duplicate}')
        for target in page.labels:
            if target not in page.ids:
                errors.append(f'{path}: label aponta para ID ausente {target}')
        for a, wrapped in page.controls:
            if not (wrapped or a.get('aria-label') or a.get('aria-labelledby') or a.get('id') in page.labels):
                errors.append(f'{path}: campo sem label {a.get("id", "sem ID")}')
        for url in page.links:
            if not resolve(url, path):
                errors.append(f'{path}: link ou asset ausente {url}')
    print(f'{len(paths)} páginas principais / {len(catalog)} itens no catálogo')
    for error in errors:
        print(error)
    print(f'{len(errors)} problema(s) encontrado(s).')
    return errors


if __name__ == '__main__':
    raise SystemExit(bool(audit()))
