import {
    applyGlobalRouteRedirect,
    getAdminHref,
    initAdminRouteAccess,
    initSharedThemeToggle,
    initSkipLink,
    initSmoothRouteTransitions,
} from '../core/site-shell.js';

let booted = false;

function boot() {
    if (booted) return;
    booted = true;

    if (applyGlobalRouteRedirect()) return;

    delete document.documentElement.dataset.routePending;

    initSharedThemeToggle();
    initAdminRouteAccess({ adminHref: getAdminHref() });
    initSkipLink();
    initSmoothRouteTransitions();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
