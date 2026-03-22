/**
 * @fileoverview Locale detection, routing and path resolution.
 * Works with the directory-based locale scheme:  /ru/  /en/  /ua/
 * @module i18n/config
 */

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
    const p = String(pathname || '/').replace(/\\/g, '/').toLowerCase();
    if (/^\/en(?:\/|$)/.test(p)) return 'en';
    if (/^\/(ua|uk)(?:\/|$)/.test(p)) return 'ua';
    if (/^\/ru(?:\/|$)/.test(p)) return 'ru';
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
    const p = String(pathname || '/').replace(/\\/g, '/').toLowerCase();
    return /^\/(ru|en|ua|uk)(?:\/|$)/.test(p) ? '../' : './';
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
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
    const cleaned = value.replace(/^\.\//, '').replace(/^\/+/, '');
    return `${getRouteAssetPrefix(pathname)}${cleaned}`;
}

/**
 * Build the canonical URL for a given locale.
 * @param {string} locale
 * @param {string} [origin]
 * @returns {string}
 */
export function getCanonicalHref(locale, origin = window.location.origin) {
    return `${origin}${getLocalePath(normalizeLocale(locale))}`;
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
        href: `${getLocalePath(locale)}${search}${hash}`,
        flagSvg: FLAG_SVG[locale],
    }));
}
