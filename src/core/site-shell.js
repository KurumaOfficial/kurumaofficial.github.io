import { SECRET_SEQUENCE } from './constants.js';

const THEME_STORAGE_KEY = 'aleph-theme';

function isEditableTarget() {
    const tag = document.activeElement?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select';
}

export function initSharedThemeToggle() {
    const btn = /** @type {HTMLButtonElement | null} */ (document.getElementById('themeBtn'));
    const ico = document.getElementById('themeIco');
    if (!btn || !ico) return;

    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        ico.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
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

    if (saved === 'light' || saved === 'dark') applyTheme(saved);

    btn.addEventListener('click', () => {
        applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
}

export function initAdminRouteAccess({ adminHref }) {
    const trigger = document.getElementById('logoLink') || document.querySelector('.nav-logo');
    if (!trigger || !adminHref || document.body.dataset.adminPage === 'true') return;

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
        document.body.classList.add('route-leaving');
        window.setTimeout(() => {
            window.location.assign(adminHref);
        }, 170);
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
    document.body.classList.add('route-transitions');

    document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
        if (!(target instanceof HTMLAnchorElement)) return;
        if (target.target && target.target !== '_self') return;
        if (target.hasAttribute('download')) return;
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

        const href = target.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

        const nextUrl = new URL(target.href, window.location.href);
        const currentUrl = new URL(window.location.href);
        if (nextUrl.origin !== currentUrl.origin) return;
        if (nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search) return;

        event.preventDefault();
        document.body.classList.add('route-leaving');
        window.setTimeout(() => {
            window.location.assign(nextUrl.toString());
        }, 170);
    });
}