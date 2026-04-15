import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { detectLocaleFromPath, getLocalePath } from '../i18n/config.js';
import { normalizeData } from './data-utils.js';
import { setInlineIcon } from './icons.js';
import { LOCAL_DATA_KEY, SECRET_SEQUENCE } from './constants.js';

const THEME_STORAGE_KEY = 'aleph-theme';
const THEME_SWITCH_ATTR = 'data-theme-switching';
const THEME_TRANSITION_MS = 260;
const ROUTE_TRANSITION_MS = 210;
const ROUTE_ENTER_MS = 320;
const SHARED_MOTION_STYLE_ID = 'aleph-shared-motion';
const SHOWCASE_SEARCH_PARAM = 'view';
const SHOWCASE_SEARCH_VALUE = 'showcase';
const NORMALIZED_DEFAULT_SITE_DATA = normalizeData(DEFAULT_SITE_DATA);

let navigationLocked = false;
let routeEnterTimer = 0;
let themeSwitchTimer = 0;
let navigationRecoveryTimer = 0;
let cachedStoredSiteDataRaw = null;
let cachedStoredSiteData = NORMALIZED_DEFAULT_SITE_DATA;

function isEditableTarget() {
    const tag = document.activeElement?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
}

function getNormalizedPathname(pathname = window.location.pathname) {
    return String(pathname || '/')
        .replace(/\\/g, '/')
        .replace(/\/+/g, '/')
        .replace(/\/?$/, '/') || '/';
}

function getSiteBasePath(pathname = window.location.pathname) {
    const segments = getNormalizedPathname(pathname)
        .split('/')
        .filter(Boolean);
    const anchorIndex = segments.findIndex((segment) => /^(?:ru|en|ua|uk|admin)$/i.test(segment));
    if (anchorIndex <= 0) return '/';
    return `/${segments.slice(0, anchorIndex).join('/')}/`;
}

function buildSiteHref(relativePath = '', pathname = window.location.pathname) {
    const cleaned = String(relativePath || '')
        .replace(/^\.\//, '')
        .replace(/^\/+/, '');
    return new URL(`${getSiteBasePath(pathname)}${cleaned}`, window.location.origin).toString();
}

function normalizeComparablePath(pathname) {
    return getNormalizedPathname(pathname).replace(/index\.html\/?$/i, '');
}

function getStoredSiteData() {
    try {
        const raw = window.localStorage.getItem(LOCAL_DATA_KEY);
        if (!raw) {
            cachedStoredSiteDataRaw = null;
            cachedStoredSiteData = NORMALIZED_DEFAULT_SITE_DATA;
            return cachedStoredSiteData;
        }

        if (raw === cachedStoredSiteDataRaw) {
            return cachedStoredSiteData;
        }

        cachedStoredSiteDataRaw = raw;
        cachedStoredSiteData = normalizeData(JSON.parse(raw));
        return cachedStoredSiteData;
    } catch {
        cachedStoredSiteDataRaw = null;
        cachedStoredSiteData = NORMALIZED_DEFAULT_SITE_DATA;
        return cachedStoredSiteData;
    }
}

function hasShowcaseBypass(search = window.location.search, hash = window.location.hash) {
    if (String(hash || '').trim()) return true;
    const params = new URLSearchParams(search || '');
    return params.get(SHOWCASE_SEARCH_PARAM) === SHOWCASE_SEARCH_VALUE;
}

function ensureSharedMotionStyles() {
    if (document.getElementById(SHARED_MOTION_STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = SHARED_MOTION_STYLE_ID;
    style.textContent = `
@media (prefers-reduced-motion: no-preference) {
  body.route-transitions {
    animation: aleph-route-enter ${ROUTE_ENTER_MS}ms cubic-bezier(.22, 1, .36, 1) both;
  }

  body.route-leaving,
  body.page-leaving {
    opacity: .64 !important;
    transform: translateY(10px) !important;
    pointer-events: none !important;
    transition: opacity .22s ease, transform .22s ease;
  }

  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }
}

@keyframes aleph-route-enter {
  from {
    opacity: .74;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

    document.head.appendChild(style);
}

function clearTransientPageState() {
    if (!document.body) return;
    document.body.classList.remove('route-leaving', 'page-leaving');
    document.body.classList.add('route-ready');
}

function clearRouteEnterState() {
    window.clearTimeout(routeEnterTimer);
    routeEnterTimer = 0;
    document.body?.classList.remove('route-transitions');
}

function clearThemeSwitchState() {
    window.clearTimeout(themeSwitchTimer);
    themeSwitchTimer = 0;
    document.documentElement.removeAttribute(THEME_SWITCH_ATTR);
}

function unlockNavigation() {
    navigationLocked = false;
    window.clearTimeout(navigationRecoveryTimer);
    navigationRecoveryTimer = 0;
}

/* Recover from blocked navigations (bfcache restore, beforeunload cancel, etc.) */
window.addEventListener('pageshow', (event) => {
    if (event.persisted || navigationLocked) {
        unlockNavigation();
        clearTransientPageState();
    }
});

function replayRouteEnterAnimation() {
    if (!document.body) return;

    ensureSharedMotionStyles();
    clearRouteEnterState();
    document.body.classList.remove('route-transitions');
    void document.body.offsetWidth;
    document.body.classList.add('route-transitions', 'route-ready');

    routeEnterTimer = window.setTimeout(() => {
        document.body?.classList.remove('route-transitions');
        routeEnterTimer = 0;
    }, ROUTE_ENTER_MS + 40);
}

function performRouteNavigation(nextHref, { replace = false, instant = false } = {}) {
    const targetUrl = new URL(nextHref, window.location.href);
    const currentUrl = new URL(window.location.href);
    if (targetUrl.href === currentUrl.href || navigationLocked) return;

    navigationLocked = true;

    const doNavigate = () => {
        try {
            if (replace) {
                window.location.replace(targetUrl.toString());
                return;
            }
            window.location.assign(targetUrl.toString());
        } catch (error) {
            console.error('Failed to perform route navigation.', error);
            unlockNavigation();
            clearTransientPageState();
        }
    };

    if (instant) {
        doNavigate();
        return;
    }

    window.clearTimeout(navigationRecoveryTimer);
    navigationRecoveryTimer = window.setTimeout(() => {
        unlockNavigation();
        clearTransientPageState();
    }, ROUTE_TRANSITION_MS + 2000);
    document.body?.classList.add('route-leaving');

    window.setTimeout(doNavigate, ROUTE_TRANSITION_MS);
}

function updateThemeColorMeta(theme) {
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) return;
    themeMeta.setAttribute('content', theme === 'dark' ? '#080606' : '#f5f0ee');
}

function updateColorSchemeMeta(theme) {
    document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';

    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) return;

    colorSchemeMeta.setAttribute('content', theme === 'light' ? 'light dark' : 'dark light');
}

export function initSharedThemeToggle() {
    const btn = /** @type {HTMLButtonElement | null} */ (document.getElementById('themeBtn'));
    const ico = document.getElementById('themeIco');
    if (!btn || !ico) return;

    const root = document.documentElement;

    function applyTheme(theme, { persist = true, animate = false } = {}) {
        const nextTheme = theme === 'light' ? 'light' : 'dark';

        if (animate) {
            root.setAttribute(THEME_SWITCH_ATTR, 'true');
            window.clearTimeout(themeSwitchTimer);
            themeSwitchTimer = window.setTimeout(() => {
                themeSwitchTimer = 0;
                root.removeAttribute(THEME_SWITCH_ATTR);
            }, THEME_TRANSITION_MS + 40);
        } else {
            clearThemeSwitchState();
        }

        root.setAttribute('data-theme', nextTheme);
        setInlineIcon(ico, nextTheme === 'dark' ? 'light_mode' : 'dark_mode', { className: 'theme-icon' });
        btn.setAttribute('aria-pressed', String(nextTheme === 'light'));
        updateThemeColorMeta(nextTheme);
        updateColorSchemeMeta(nextTheme);

        if (!persist) return;

        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
            /* ignore localStorage failures */
        }
    }

    let saved = null;
    try {
        saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
        saved = null;
    }

    if (saved === 'light' || saved === 'dark') {
        applyTheme(saved, { persist: false });
    } else {
        const currentTheme = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        setInlineIcon(ico, currentTheme === 'dark' ? 'light_mode' : 'dark_mode', { className: 'theme-icon' });
        btn.setAttribute('aria-pressed', String(currentTheme === 'light'));
        updateThemeColorMeta(currentTheme);
        updateColorSchemeMeta(currentTheme);
    }

    if (btn.dataset.themeToggleBound === '1') return;
    btn.dataset.themeToggleBound = '1';

    btn.addEventListener('click', () => {
        applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', { animate: true });
    });
}

export function initSkipLink() {
    const link = document.querySelector('.skip-link');
    if (!(link instanceof HTMLAnchorElement)) return;
    if (link.dataset.skipLinkBound === '1') return;
    link.dataset.skipLinkBound = '1';

    link.addEventListener('click', (event) => {
        const target = document.getElementById('main');
        if (!target) return;

        event.preventDefault();

        const hadTabIndex = target.hasAttribute('tabindex');
        const previousTabIndex = target.getAttribute('tabindex');
        const restoreFocusability = () => {
            if (hadTabIndex) {
                if (previousTabIndex == null) {
                    target.removeAttribute('tabindex');
                } else {
                    target.setAttribute('tabindex', previousTabIndex);
                }
                return;
            }

            target.removeAttribute('tabindex');
        };

        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', restoreFocusability, { once: true });
        target.focus({ preventScroll: false });
    });
}

export function getAdminHref(pathname = window.location.pathname) {
    return buildSiteHref('admin/', pathname);
}

export function getEffectiveSiteData() {
    return getStoredSiteData();
}

export function getLocaleShowcaseHref({ pathname = window.location.pathname, hash = '' } = {}) {
    const localePrefix = getLocalePath(detectLocaleFromPath(pathname)).replace(/^\//, '');
    const url = new URL(buildSiteHref(localePrefix, pathname));
    url.searchParams.set(SHOWCASE_SEARCH_PARAM, SHOWCASE_SEARCH_VALUE);
    if (hash) {
        url.hash = hash.startsWith('#') ? hash : `#${hash}`;
    }
    return url.toString();
}

export function getAutoRouteRedirectTarget(siteData = getStoredSiteData(), pathname = window.location.pathname) {
    const locale = detectLocaleFromPath(pathname);
    const redirectProduct = (siteData.products || []).find((product) => product.autoRouteRedirect && product.detailUrl);
    if (!redirectProduct) return null;

    const localePrefix = getLocalePath(locale).replace(/^\//, '');
    const detailPath = String(redirectProduct.detailUrl || '')
        .replace(/^\.\//, '')
        .replace(/^\/+/, '');

    if (!detailPath) return null;
    return buildSiteHref(`${localePrefix}${detailPath}`, pathname);
}

export function applyGlobalRouteRedirect(siteData = getStoredSiteData()) {
    const pathname = getNormalizedPathname(window.location.pathname);
    if (/\/admin\/?$/i.test(pathname) || document.body.dataset.adminPage === 'true') return false;
    if (hasShowcaseBypass()) return false;

    const targetHref = getAutoRouteRedirectTarget(siteData, pathname);
    if (!targetHref) return false;

    const targetPath = normalizeComparablePath(new URL(targetHref).pathname);
    const currentPath = normalizeComparablePath(pathname);
    if (targetPath === currentPath) return false;

    performRouteNavigation(targetHref, { replace: true, instant: true });
    return true;
}

export function navigateWithRouteTransition(nextHref, options) {
    performRouteNavigation(nextHref, options);
}

export function initAdminRouteAccess({ adminHref }) {
    const trigger = document.getElementById('logoLink') || document.querySelector('.nav-logo');
    if (!trigger || document.body.dataset.adminPage === 'true') return;
    if (trigger instanceof HTMLElement && trigger.dataset.adminAccessBound === '1') return;
    if (trigger instanceof HTMLElement) {
        trigger.dataset.adminAccessBound = '1';
    }

    const resolvedAdminHref = adminHref || getAdminHref();
    if (!resolvedAdminHref) return;

    let sequenceBuffer = [];
    let armed = false;
    let timerId = null;

    function disarm() {
        armed = false;
        if (timerId) {
            window.clearTimeout(timerId);
            timerId = null;
        }
    }

    function arm() {
        armed = true;
        if (timerId) window.clearTimeout(timerId);
        timerId = window.setTimeout(disarm, 12000);
    }

    trigger.addEventListener('click', (event) => {
        if (!armed) return;
        event.preventDefault();
        disarm();
        sequenceBuffer = [];
        performRouteNavigation(resolvedAdminHref);
    });

    document.addEventListener('keydown', (event) => {
        if (isEditableTarget()) return;

        sequenceBuffer.push(event.key);
        if (sequenceBuffer.length > SECRET_SEQUENCE.length) sequenceBuffer.shift();

        const matches = SECRET_SEQUENCE.every((key, index) => sequenceBuffer[index] === key);
        if (!matches) return;

        sequenceBuffer = [];
        arm();
    });
}

export function initSmoothRouteTransitions() {
    if (!document.body) return;

    ensureSharedMotionStyles();

    if (document.body.dataset.routeTransitionsReady === 'true') return;
    document.body.dataset.routeTransitionsReady = 'true';

    clearTransientPageState();
    replayRouteEnterAnimation();

    window.addEventListener('pageshow', (event) => {
        unlockNavigation();
        clearTransientPageState();
        if (event.persisted) {
            replayRouteEnterAnimation();
        }
    });

    window.addEventListener('pagehide', () => {
        clearThemeSwitchState();
        clearRouteEnterState();
        unlockNavigation();
    });

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!(target instanceof HTMLAnchorElement)) return;
        if (target.target && target.target !== '_self') return;
        if (target.hasAttribute('download')) return;
        if (target.hasAttribute('data-no-route-transition')) return;
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const href = target.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        const nextUrl = new URL(target.href, window.location.href);
        const currentUrl = new URL(window.location.href);
        if (nextUrl.origin !== currentUrl.origin) return;
        if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

        event.preventDefault();
        performRouteNavigation(nextUrl.toString());
    });
}
