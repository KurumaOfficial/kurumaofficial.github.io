from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
SITE_DATA_PATH = ROOT / 'src' / 'data' / 'site-data.js'
SITEMAP_PATH = ROOT / 'sitemap.xml'
HTML_ATTR_RE = re.compile(r'''(?:href|src)=['\"]([^'\"]+)['\"]''', re.IGNORECASE)
EXTERNAL_RE = re.compile(r'^(?:https?:)?//', re.IGNORECASE)
IGNORED_LOCAL_PREFIXES = ('#', 'data:', 'mailto:', 'tel:', 'javascript:')
PUBLIC_LOCALES = ('ru', 'en', 'ua')


def extract_default_site_data() -> dict:
    text = SITE_DATA_PATH.read_text(encoding='utf-8')
    needle = 'export const DEFAULT_SITE_DATA ='
    start = text.find(needle)
    if start < 0:
        raise RuntimeError('DEFAULT_SITE_DATA export was not found.')

    chunk = text[start + len(needle):]
    brace_start = chunk.find('{')
    if brace_start < 0:
        raise RuntimeError('DEFAULT_SITE_DATA object start was not found.')

    chunk = chunk[brace_start:]
    depth = 0
    in_string = False
    escaped = False
    end_index = None

    for index, char in enumerate(chunk):
        if in_string:
            if escaped:
                escaped = False
            elif char == '\\':
                escaped = True
            elif char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
            continue

        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
            if depth == 0:
                end_index = index + 1
                break

    if end_index is None:
        raise RuntimeError('DEFAULT_SITE_DATA object end was not found.')

    return json.loads(chunk[:end_index])


def iter_public_html_files() -> Iterable[Path]:
    for path in ROOT.glob('**/*.html'):
        if any(part in {'tools'} for part in path.parts):
            continue
        yield path


def validate_unique_ids(group_name: str, items: Iterable[dict], errors: list[str]) -> None:
    seen: set[str] = set()
    for item in items:
        item_id = str(item.get('id', '')).strip()
        if not item_id:
            errors.append(f'{group_name}: missing id in {item!r}')
            continue
        if item_id in seen:
            errors.append(f'{group_name}: duplicate id {item_id!r}')
        seen.add(item_id)


def validate_site_data(site_data: dict, errors: list[str]) -> None:
    validate_unique_ids('products', site_data.get('products', []), errors)
    validate_unique_ids('team', site_data.get('team', []), errors)

    support_page = site_data.get('supportPage', {})
    validate_unique_ids('support buttons', support_page.get('buttons', []), errors)
    validate_unique_ids('supporters', support_page.get('supporters', []), errors)

    redirect_products = [
        product for product in site_data.get('products', [])
        if product.get('autoRouteRedirect') and str(product.get('detailUrl', '')).strip()
    ]
    if len(redirect_products) > 1:
        errors.append('products: more than one product has autoRouteRedirect=true with a route')

    for product in site_data.get('products', []):
        product_id = str(product.get('id', '')).strip() or '<unknown>'
        detail_url = str(product.get('detailUrl', '')).strip()
        download_url = str(product.get('downloadUrl', '')).strip()

        if detail_url:
            route = detail_url.replace('./', '').strip('/')
            for locale in PUBLIC_LOCALES:
                detail_index = ROOT / locale / route / 'index.html'
                if not detail_index.exists():
                    errors.append(f'products: missing detail route for {product_id!r}: {detail_index.relative_to(ROOT)}')

        if download_url and not EXTERNAL_RE.match(download_url):
            asset_path = ROOT / download_url.replace('./', '').replace('/', '\\')
            if not asset_path.exists():
                errors.append(f'products: missing download asset for {product_id!r}: {download_url}')


def validate_html_references(errors: list[str]) -> None:
    for html_path in iter_public_html_files():
        text = html_path.read_text(encoding='utf-8')
        for raw_value in HTML_ATTR_RE.findall(text):
            value = raw_value.strip()
            if not value or value.startswith(IGNORED_LOCAL_PREFIXES):
                continue
            if EXTERNAL_RE.match(value) or value.startswith('/'):
                continue

            target_value = value.split('?', 1)[0].split('#', 1)[0]
            if not target_value:
                continue

            resolved = (html_path.parent / target_value).resolve()
            if resolved.is_dir():
                if not (resolved / 'index.html').exists():
                    errors.append(f'html: missing index for {html_path.relative_to(ROOT)} -> {value}')
                continue

            if not resolved.exists():
                errors.append(f'html: missing local reference {html_path.relative_to(ROOT)} -> {value}')


def validate_sitemap(site_data: dict, errors: list[str]) -> None:
    if not SITEMAP_PATH.exists():
        errors.append('sitemap: sitemap.xml is missing')
        return

    xml_root = ElementTree.fromstring(SITEMAP_PATH.read_text(encoding='utf-8'))
    namespace = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    locs = {
        (loc.text or '').strip()
        for loc in xml_root.findall('sm:url/sm:loc', namespace)
        if (loc.text or '').strip()
    }

    expected = {
        f'https://www.aleph.icu/{locale}/'
        for locale in PUBLIC_LOCALES
    }
    expected |= {
        f'https://www.aleph.icu/{locale}/donate/'
        for locale in PUBLIC_LOCALES
    }

    for product in site_data.get('products', []):
        route = str(product.get('detailUrl', '')).replace('./', '').strip('/')
        if not route:
            continue
        expected |= {
            f'https://www.aleph.icu/{locale}/{route}/'
            for locale in PUBLIC_LOCALES
        }
        expected |= {
            f'https://www.aleph.icu/{locale}/{route}/donate/'
            for locale in PUBLIC_LOCALES
        }

    missing = sorted(expected - locs)
    for loc in missing:
        errors.append(f'sitemap: missing route {loc}')


def main() -> int:
    errors: list[str] = []
    site_data = extract_default_site_data()
    validate_site_data(site_data, errors)
    validate_html_references(errors)
    validate_sitemap(site_data, errors)

    if errors:
        for error in errors:
            print(error)
        return 1

    print('Static site validation passed.')
    return 0


if __name__ == '__main__':
    sys.exit(main())