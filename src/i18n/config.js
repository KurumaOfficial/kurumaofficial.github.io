export const DEFAULT_LOCALE = 'ru';
export const LOCALE_ORDER = ['ru', 'en', 'uk'];
export const LOCALE_ROUTE_MAP = Object.freeze({
    ru: '/ru/',
    en: '/en/',
    uk: '/uk/'
});

export const LOCALE_META = Object.freeze({
    ru: {
        code: 'ru',
        label: 'Русский',
        shortLabel: 'RU'
    },
    en: {
        code: 'en',
        label: 'English',
        shortLabel: 'EN'
    },
    uk: {
        code: 'uk',
        label: 'Українська',
        shortLabel: 'UA'
    }
});

const FLAG_SVG = Object.freeze({
    ru: `
        <svg viewBox="0 0 18 12" aria-hidden="true" focusable="false">
            <rect width="18" height="12" rx="2" fill="#ffffff"></rect>
            <rect y="4" width="18" height="4" fill="#2563eb"></rect>
            <rect y="8" width="18" height="4" fill="#dc2626"></rect>
        </svg>
    `,
    en: `
        <svg viewBox="0 0 18 12" aria-hidden="true" focusable="false">
            <rect width="18" height="12" rx="2" fill="#0f3d8a"></rect>
            <path d="M0 1.2 1.2 0 18 10.8 16.8 12zM16.8 0 18 1.2 1.2 12 0 10.8z" fill="#ffffff"></path>
            <path d="M0 2 2 0 18 10 16 12zM16 0 18 2 2 12 0 10z" fill="#ef4444"></path>
            <rect x="7" width="4" height="12" fill="#ffffff"></rect>
            <rect y="4" width="18" height="4" fill="#ffffff"></rect>
            <rect x="7.6" width="2.8" height="12" fill="#ef4444"></rect>
            <rect y="4.6" width="18" height="2.8" fill="#ef4444"></rect>
        </svg>
    `,
    uk: `
        <svg viewBox="0 0 18 12" aria-hidden="true" focusable="false">
            <rect width="18" height="12" rx="2" fill="#2563eb"></rect>
            <rect y="6" width="18" height="6" rx="0" fill="#facc15"></rect>
        </svg>
    `
});

export function normalizeLocale(locale) {
    const normalized = String(locale || '')
        .trim()
        .toLowerCase();
    if (normalized === 'ua') return 'uk';
    return LOCALE_META[normalized] ? normalized : DEFAULT_LOCALE;
}

export function detectLocaleFromPath(pathname = window.location.pathname) {
    const normalizedPath = String(pathname || '/')
        .replace(/\\/g, '/')
        .toLowerCase();

    if (/^\/en(?:\/|$)/.test(normalizedPath)) return 'en';
    if (/^\/uk(?:\/|$)/.test(normalizedPath)) return 'uk';
    if (/^\/ru(?:\/|$)/.test(normalizedPath)) return 'ru';

    return normalizeLocale(window.__ALEPH_ROUTE_LOCALE__);
}

export function getLocalePath(locale) {
    const normalized = normalizeLocale(locale);
    return LOCALE_ROUTE_MAP[normalized] || LOCALE_ROUTE_MAP[DEFAULT_LOCALE];
}

export function getRouteAssetPrefix(pathname = window.location.pathname) {
    const normalizedPath = String(pathname || '/')
        .replace(/\\/g, '/')
        .toLowerCase();
    return /^\/(ru|en|uk)(?:\/|$)/.test(normalizedPath) ? '../' : './';
}

export function resolveRouteRelativePath(path, pathname = window.location.pathname) {
    const value = String(path || '').trim();
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) {
        return value;
    }

    const cleaned = value
        .replace(/^\.\//, '')
        .replace(/^\/+/, '');

    return `${getRouteAssetPrefix(pathname)}${cleaned}`;
}

export function getLocaleMeta(locale) {
    return LOCALE_META[normalizeLocale(locale)];
}

export function getLocaleOptions(currentPathname = window.location.pathname, currentHash = window.location.hash || '') {
    return LOCALE_ORDER.map((locale) => ({
        ...getLocaleMeta(locale),
        locale,
        href: `${getLocalePath(locale)}${currentHash || ''}`,
        flagSvg: FLAG_SVG[locale]
    }));
}

export function getCanonicalHref(locale, origin = window.location.origin, pathname = window.location.pathname) {
    const normalized = normalizeLocale(locale);
    const normalizedPath = String(pathname || '/')
        .replace(/\\/g, '/')
        .toLowerCase();

    if (normalized === DEFAULT_LOCALE) {
        return /^\/ru(?:\/|$)/.test(normalizedPath)
            ? `${origin}${getLocalePath(normalized)}`
            : `${origin}/`;
    }

    return `${origin}${getLocalePath(normalized)}`;
}
