import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { detectLocaleFromPath, getLocalePath } from '../i18n/config.js';
import { normalizeData } from './data-utils.js';
import { LOCAL_DATA_KEY, SECRET_SEQUENCE } from './constants.js';

const THEME_STORAGE_KEY = 'aleph-theme';
const ROUTE_TRANSITION_MS = 210;
const ROUTE_ENTER_MS = 320;
const THEME_VIEW_TRANSITION_MS = 620;
const SHARED_MOTION_STYLE_ID = 'aleph-shared-motion';

let navigationLocked = false;
let routeEnterTimer = 0;

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

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getStoredSiteData() {
    try {
        const raw = window.localStorage.getItem(LOCAL_DATA_KEY);
        if (!raw) return normalizeData(DEFAULT_SITE_DATA);
        return normalizeData(JSON.parse(raw));
    } catch {
        return normalizeData(DEFAULT_SITE_DATA);
    }
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

function replayRouteEnterAnimation() {
    if (!document.body) return;

    ensureSharedMotionStyles();
    window.clearTimeout(routeEnterTimer);
    document.body.classList.remove('route-transitions');
    void document.body.offsetWidth;
    document.body.classList.add('route-transitions', 'route-ready');

    routeEnterTimer = window.setTimeout(() => {
        document.body?.classList.remove('route-transitions');
    }, ROUTE_ENTER_MS + 40);
}

function performRouteNavigation(nextHref, { replace = false } = {}) {
    const targetUrl = new URL(nextHref, window.location.href);
    const currentUrl = new URL(window.location.href);
    if (targetUrl.href === currentUrl.href || navigationLocked) return;

    navigationLocked = true;
    document.body?.classList.add('route-leaving');

    window.setTimeout(() => {
        if (replace) {
            window.location.replace(targetUrl.toString());
            return;
        }
        window.location.assign(targetUrl.toString());
    }, ROUTE_TRANSITION_MS);
}

function updateThemeColorMeta(theme) {
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeMeta) return;
    themeMeta.setAttribute('content', theme === 'dark' ? '#080606' : '#f5f0ee');
}

function performThemeChange(nextTheme, applyTheme, origin) {
    const root = document.documentElement;
    const useViewTransition = !prefersReducedMotion()
        && typeof document.startViewTransition === 'function'
        && typeof root.animate === 'function';

    if (!useViewTransition) {
        applyTheme(nextTheme);
        return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
    );

    root.style.setProperty('--theme-transition-x', `${x}px`);
    root.style.setProperty('--theme-transition-y', `${y}px`);

    const transition = document.startViewTransition(() => {
        applyTheme(nextTheme);
    });

    transition.ready
        .then(() => {
            root.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: THEME_VIEW_TRANSITION_MS,
                    easing: 'cubic-bezier(.22, 1, .36, 1)',
                    pseudoElement: '::view-transition-new(root)',
                },
            );
        })
        .catch(() => {
            /* ignore animation failures and keep the new theme */
        });
}

export function initSharedThemeToggle() {
    ensureSharedMotionStyles();

    const btn = /** @type {HTMLButtonElement | null} */ (document.getElementById('themeBtn'));
    const ico = document.getElementById('themeIco');
    if (!btn || !ico) return;

    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        ico.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
        updateThemeColorMeta(theme);
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
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
        applyTheme(saved);
    } else {
        updateThemeColorMeta(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    }

    btn.addEventListener('click', (event) => {
        const rect = btn.getBoundingClientRect();
        const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        performThemeChange(
            nextTheme,
            applyTheme,
            event instanceof MouseEvent
                ? { x: event.clientX, y: event.clientY }
                : { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        );
    });
}

export function getAdminHref(pathname = window.location.pathname) {
    return buildSiteHref('admin/', pathname);
}

export function getEffectiveSiteData() {
    return getStoredSiteData();
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

    const targetHref = getAutoRouteRedirectTarget(siteData, pathname);
    if (!targetHref) return false;

    const targetPath = normalizeComparablePath(new URL(targetHref).pathname);
    const currentPath = normalizeComparablePath(pathname);
    if (targetPath === currentPath) return false;

    performRouteNavigation(targetHref, { replace: true });
    return true;
}

export function navigateWithRouteTransition(nextHref, options) {
    performRouteNavigation(nextHref, options);
}

export function initAdminRouteAccess({ adminHref }) {
    const trigger = document.getElementById('logoLink') || document.querySelector('.nav-logo');
    if (!trigger || document.body.dataset.adminPage === 'true') return;

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
        navigationLocked = false;
        clearTransientPageState();
        if (event.persisted) {
            replayRouteEnterAnimation();
        }
    });

    window.addEventListener('pagehide', () => {
        navigationLocked = false;
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
