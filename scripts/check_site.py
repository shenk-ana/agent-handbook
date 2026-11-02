#!/usr/bin/env python3
"""Validate local assets, links, and fragment targets in the static HTML site."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1] / 'docs'

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.duplicates = []
        self.refs = []
        self.copy_targets = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            if a['id'] in self.ids:
                self.duplicates.append(a['id'])
            self.ids.add(a['id'])
        for name in ('href', 'src'):
            if a.get(name):
                self.refs.append(a[name])
        if a.get('data-copy'):
            self.copy_targets.append(a['data-copy'])

pages = {}
errors = []
for file in sorted(ROOT.rglob('*.html')):
    page = Page()
    page.feed(file.read_text(encoding='utf-8'))
    pages[file.resolve()] = page
    errors.extend(f'{file.relative_to(ROOT)}: duplicate id {x}' for x in page.duplicates)
for file, page in pages.items():
    label = file.relative_to(ROOT)
    for target in page.copy_targets:
        if target not in page.ids:
            errors.append(f'{label}: missing copy target {target}')
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            if url.scheme in ('file', 'javascript'):
                errors.append(f'{label}: unsupported link {ref}')
            continue
        if url.path.startswith('/'):
            errors.append(f'{label}: use a relative project-site link: {ref}')
            continue
        target = (file.parent / unquote(url.path)).resolve() if url.path else file
        if not target.is_relative_to(ROOT.resolve()):
            errors.append(f'{label}: link leaves published site: {ref}')
            continue
        if target.is_dir():
            target /= 'index.html'
        if not target.exists():
            errors.append(f'{label}: missing file {ref}')
        elif url.fragment and target.suffix == '.html':
            if target not in pages or unquote(url.fragment) not in pages[target].ids:
                errors.append(f'{label}: missing fragment {ref}')
if errors:
    print('\n'.join(errors), file=sys.stderr)
    sys.exit(1)
print(f'OK: {len(pages)} HTML pages; local links, assets, fragments and copy targets valid.')
