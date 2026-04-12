/**
 * @fileoverview Locale detection, routing and path resolution.
 * Works with the directory-based locale scheme:  /ru/  /en/  /ua/
 * @module i18n/config
 */

import { normalizeBareWebUrl } from '../core/dom.js';

/** @type {string} */
export const DEFAULT_LOCALE = 'ru';

/** Ordered list of supported locales — used for the switcher. */
export const LOCALE_ORDER = /** @type {const} */ (['ru', 'en', 'ua']);

/** Route prefix for each locale. */
export const LOCALE_ROUTE_MAP = Object.freeze({
    ru: '/ru/',
    en: '/en/',
    ua: '/ua/',
});

/** Display metadata per locale. */
export const LOCALE_META = Object.freeze({
    ru: { code: 'ru', label: 'Русский',    shortLabel: 'RU' },
    en: { code: 'en', label: 'English',    shortLabel: 'EN' },
    ua: { code: 'uk', label: 'Українська', shortLabel: 'UA' },
});

/** Flag SVGs rendered inside the locale switcher. */
export const FLAG_SVG = Object.freeze({
    ru: '<svg viewBox="0 0 18 12" aria-hidden="true" focusable="false"><rect width="18" height="12" rx="2" fill="#fff"/><rect y="4" width="18" height="4" fill="#2563eb"/><rect y="8" width="18" height="4" fill="#dc2626"/></svg>',
    en: '<svg viewBox="0 0 18 12" aria-hidden="true" focusable="false"><rect width="18" height="12" rx="2" fill="#0f3d8a"/><path d="M0 1.2 1.2 0 18 10.8 16.8 12zM16.8 0 18 1.2 1.2 12 0 10.8z" fill="#fff"/><path d="M0 2 2 0 18 10 16 12zM16 0 18 2 2 12 0 10z" fill="#ef4444"/><rect x="7" width="4" height="12" fill="#fff"/><rect y="4" width="18" height="4" fill="#fff"/><rect x="7.6" width="2.8" height="12" fill="#ef4444"/><rect y="4.6" width="18" height="2.8" fill="#ef4444"/></svg>',
    ua: '<svg viewBox="0 0 18 12" aria-hidden="true" focusable="false"><rect width="18" height="12" rx="2" fill="#2563eb"/><rect y="6" width="18" height="6" fill="#facc15"/></svg>',
});

// ── Helpers ─────────────────────────────────────────────────

/**
 * Normalize a pathname and expose route metadata.
 * Supports locale routes nested under an optional site base path.
 * @param {string} [pathname]
 */
function getPathInfo(pathname = window.location.pathname) {
    const raw = String(pathname || '/')
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/');

    let normalized = raw.startsWith('/') ? raw : `/${raw}`;
    normalized = normalized.replace(/\/index\.html?$/i, '/');

    if (!/\.[a-z0-9]+$/i.test(normalized) && !normalized.endsWith('/')) {
        normalized += '/';
    }

    const segments = normalized.split('/').filter(Boolean);
    const localeIndex = segments.findIndex((segment) => /^(?:ru|en|ua|uk)$/i.test(segment));

    return {
        normalized,
        segments,
        localeIndex,
        hasTrailingSlash: normalized.endsWith('/'),
    };
}

/**
 * Return the base path that sits before the locale segment.
 * Examples: `/ru/...` -> `/`, `/site/ru/...` -> `/site/`.
 * @param {string} [pathname]
 * @returns {string}
 */
export function getSiteBasePath(pathname = window.location.pathname) {
    const { segments, localeIndex } = getPathInfo(pathname);
    if (localeIndex <= 0) return '/';
    return `/${segments.slice(0, localeIndex).join('/')}/`;
}

/**
 * Build the equivalent route path for a locale while preserving the current suffix.
 * @param {string} locale
 * @param {string} [pathname]
 * @returns {string}
 */
export function buildLocalizedRoutePath(locale, pathname = window.location.pathname) {
    const { segments, localeIndex, hasTrailingSlash } = getPathInfo(pathname);
    const prefixSegments = localeIndex >= 0 ? segments.slice(0, localeIndex) : [];
    const suffixSegments = localeIndex >= 0 ? segments.slice(localeIndex + 1) : segments;
    const localizedSegments = [...prefixSegments, normalizeLocale(locale), ...suffixSegments];

    if (!localizedSegments.length) {
        return '/';
    }

    return `/${localizedSegments.join('/')}${hasTrailingSlash ? '/' : ''}`;
}

/**
 * Resolve the locale-neutral home URL for the site root/base path.
 * @param {string} [origin]
 * @param {string} [pathname]
 * @returns {string}
 */
export function getSiteRootHref(origin = window.location.origin, pathname = window.location.pathname) {
    return new URL(getSiteBasePath(pathname), origin).toString();
}

/**
 * Map any locale-like string to a supported locale key.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeLocale(raw) {
    const val = String(raw || '').trim().toLowerCase();
    if (val === 'uk') return 'ua';
    return LOCALE_META[val] ? val : DEFAULT_LOCALE;
}

/**
 * Detect locale from the current URL pathname.
 * Falls back to the page-embedded `__ALEPH_LOCALE__` var, then to default.
 * @param {string} [pathname]
 * @returns {string}
 */
export function detectLocaleFromPath(pathname = window.location.pathname) {
    const { segments, localeIndex } = getPathInfo(pathname);
    if (localeIndex >= 0) {
        return normalizeLocale(segments[localeIndex]);
    }
    return normalizeLocale(/** @type {any} */ (window).__ALEPH_LOCALE__);
}

/**
 * Get the route prefix for a locale.
 * @param {string} locale
 * @returns {string}
 */
export function getLocalePath(locale) {
    return LOCALE_ROUTE_MAP[normalizeLocale(locale)] ?? LOCALE_ROUTE_MAP[DEFAULT_LOCALE];
}

/**
 * Compute an asset-prefix relative to the current path depth.
 * Inside `/ru/` ⇒ `../`  |  at root ⇒ `./`
 * @param {string} [pathname]
 * @returns {string}
 */
export function getRouteAssetPrefix(pathname = window.location.pathname) {
    const { segments, localeIndex } = getPathInfo(pathname);
    if (localeIndex < 0) return './';
    const depthAfterLocale = Math.max(0, segments.length - localeIndex - 1);
    return '../'.repeat(depthAfterLocale + 1);
}

/**
 * Resolve a relative path (e.g. `./assets/files/x.jar`) from the current route.
 * Absolute URLs and fragment-only refs pass through untouched.
 * @param {string} path
 * @param {string} [pathname]
 * @returns {string}
 */
export function resolveRouteRelativePath(path, pathname = window.location.pathname) {
    const value = String(path || '').trim();
    if (!value) return value;
    if (value.startsWith('#') || /^(?:https?:)?\/\//i.test(value)) return value;
    const externalHref = normalizeBareWebUrl(value);
    if (externalHref) return externalHref;
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return '';
    const cleaned = value.replace(/^\.\//, '').replace(/^\/+/, '');
    return `${getRouteAssetPrefix(pathname)}${cleaned}`;
}

/**
 * Build the canonical URL for a given locale and current route.
 * @param {string} locale
 * @param {string} [origin]
 * @param {string} [pathname]
 * @returns {string}
 */
export function getCanonicalHref(locale, origin = window.location.origin, pathname = window.location.pathname) {
    return new URL(buildLocalizedRoutePath(locale, pathname), origin).toString();
}

/**
 * Get metadata for a single locale.
 * @param {string} locale
 */
export function getLocaleMeta(locale) {
    return LOCALE_META[normalizeLocale(locale)];
}

/**
 * Generate the options array for the locale switcher.
 * @param {string} [pathname]
 * @param {string} [search]
 * @param {string} [hash]
 */
export function getLocaleOptions(
    pathname = window.location.pathname,
    search = window.location.search || '',
    hash = window.location.hash || '',
) {
    return LOCALE_ORDER.map((locale) => ({
        ...getLocaleMeta(locale),
        locale,
        href: `${buildLocalizedRoutePath(locale, pathname)}${search}${hash}`,
        flagSvg: FLAG_SVG[locale],
    }));
}
