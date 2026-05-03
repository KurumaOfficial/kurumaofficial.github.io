from __future__ import annotations

import json
import os
import re
import sys
from html import unescape
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
ROUTE_MODULE_KEYS = ('player', 'world', 'utils', 'other', 'interface', 'themes')
DETAIL_VERSION_RE = re.compile(r'<[^>]+\bid=["\']heroProductVersion["\'][^>]*>(.*?)</[^>]+>', re.IGNORECASE | re.DOTALL)
INSTALL_HREF_RE = re.compile(r'<a[^>]+\bid=["\']installBtn["\'][^>]+\bhref=["\']([^"\']+)["\']', re.IGNORECASE)
SOURCE_HREF_RE = re.compile(r'<a[^>]+\bid=["\']sourceBtn["\'][^>]+\bhref=["\']([^"\']+)["\']', re.IGNORECASE)


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
            relative_download = download_url.replace('./', '').lstrip('/')
            asset_path = ROOT.joinpath(*relative_download.split('/')) if relative_download else ROOT
            if not asset_path.exists():
                errors.append(f'products: missing download asset for {product_id!r}: {download_url}')


def build_expected_detail_href(detail_index: Path, raw_target: str) -> str:
    target = str(raw_target or '').strip()
    if not target:
        return ''
    if EXTERNAL_RE.match(target) or target.startswith('#'):
        return target

    relative_target = target.replace('./', '').replace('\\', '/').lstrip('/')
    absolute_target = ROOT / relative_target.replace('/', os.sep)
    return os.path.relpath(absolute_target, start=detail_index.parent).replace('\\', '/')


def extract_tag_text(pattern: re.Pattern[str], text: str) -> str:
    match = pattern.search(text)
    if not match:
        return ''
    normalized = re.sub(r'\s+', ' ', unescape(match.group(1) or '')).strip()
    return normalized


def extract_href(pattern: re.Pattern[str], text: str) -> str:
    match = pattern.search(text)
    return (match.group(1) or '').strip() if match else ''


def count_route_module_items(route_modules: dict | None) -> int:
    modules = route_modules or {}
    return sum(
        len(items) for key in ROUTE_MODULE_KEYS
        for items in [modules.get(key) if isinstance(modules.get(key), list) else []]
    )


def validate_detail_route_pages(site_data: dict, errors: list[str]) -> None:
    for product in site_data.get('products', []):
        product_id = str(product.get('id', '')).strip() or '<unknown>'
        detail_url = str(product.get('detailUrl', '')).strip()
        if not detail_url:
            continue

        route = detail_url.replace('./', '').strip('/')
        route_modules_count = count_route_module_items(product.get('routeModules'))
        expected_install_href = str(product.get('downloadUrl', '')).strip()
        expected_source_href = str(product.get('sourceUrl', '')).strip()
        expected_version = str(product.get('version', '')).strip()

        for locale in PUBLIC_LOCALES:
            detail_index = ROOT / locale / route / 'index.html'
            if not detail_index.exists():
                continue

            text = detail_index.read_text(encoding='utf-8')
            has_route_ui = 'id="gwTabs"' in text or "id='gwTabs'" in text or 'id="modGrid"' in text or "id='modGrid'" in text
            if has_route_ui and route_modules_count == 0:
                errors.append(f'products: detail route UI expects routeModules for {product_id!r} but none are defined')

            if expected_version:
                html_version = extract_tag_text(DETAIL_VERSION_RE, text)
                if html_version and html_version != expected_version:
                    errors.append(
                        f'products: stale hero version on {detail_index.relative_to(ROOT)} '
                        f'(html={html_version!r}, data={expected_version!r})'
                    )

            if expected_install_href:
                html_install_href = extract_href(INSTALL_HREF_RE, text)
                expected_href = build_expected_detail_href(detail_index, expected_install_href)
                if html_install_href and expected_href and html_install_href != expected_href:
                    errors.append(
                        f'products: stale install href on {detail_index.relative_to(ROOT)} '
                        f'(html={html_install_href!r}, data={expected_href!r})'
                    )

            if expected_source_href:
                html_source_href = extract_href(SOURCE_HREF_RE, text)
                expected_href = build_expected_detail_href(detail_index, expected_source_href)
                if html_source_href and expected_href and html_source_href != expected_href:
                    errors.append(
                        f'products: stale source href on {detail_index.relative_to(ROOT)} '
                        f'(html={html_source_href!r}, data={expected_href!r})'
                    )


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
        for locale in PUBLIC_LOCALES:
            detail_index = ROOT / locale / route.replace('/', os.sep) / 'index.html'
            if detail_index.exists():
                expected.add(f'https://www.aleph.icu/{locale}/{route}/')

    missing = sorted(expected - locs)
    for loc in missing:
        errors.append(f'sitemap: missing route {loc}')

    # Detect entries that point to nothing on disk so we never advertise 404s.
    for loc in sorted(locs):
        relative = loc.replace('https://www.aleph.icu/', '').strip('/')
        if not relative:
            continue
        candidate_index = ROOT.joinpath(*relative.split('/')) / 'index.html'
        if not candidate_index.exists():
            errors.append(f'sitemap: route does not resolve to a static page: {loc}')


def main() -> int:
    errors: list[str] = []
    site_data = extract_default_site_data()
    validate_site_data(site_data, errors)
    validate_detail_route_pages(site_data, errors)
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
