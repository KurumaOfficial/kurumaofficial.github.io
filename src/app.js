/**
 * @fileoverview Application bootstrap — single entry point.
 *
 * Wires together locale controller, renderer and reveal system.
 * Loaded as `type="module"` from every locale page.
 *
 * @module app
 */

import { createLocaleController } from './i18n/controller.js';
import { createRenderer }        from './components/renderer.js';
import { initReveal }            from './components/reveal.js';
import { showToast }             from './components/toast.js';
import {
    applyGlobalRouteRedirect,
    getAdminHref,
    getEffectiveSiteData,
    initAdminRouteAccess,
    initSkipLink,
    initSharedThemeToggle,
    initSmoothRouteTransitions,
} from './core/site-shell.js?v=20260416c';

/* ------------------------------------------------------------------ */
/*  Boot                                                              */
/* ------------------------------------------------------------------ */

let booted = false;

/**
 * Main initialisation sequence.
 * Idempotent — calling twice is harmless.
 */
function boot() {
    if (booted) return;
    booted = true;

    /* 1 — Build locale controller (auto-detects locale from path) -- */
    const lc = createLocaleController();
    const isAdminPage = document.body?.dataset.adminPage === 'true';

    /* 1.5 — Auto-redirect to product detail route (if configured) - */
    if (!isAdminPage && applyGlobalRouteRedirect()) return;

    if (isAdminPage) {
        document.documentElement.lang = lc.locale === 'ua' ? 'uk' : lc.locale;
    }

    /* 2 — Apply document‑level meta (lang, title, OG, etc.) -------- */
    if (!isAdminPage) {
        lc.applyDocumentMeta();
    }

    /* 3 — Stamp static text copies (nav, hero, manifesto, footer) -- */
    if (!isAdminPage) {
        lc.applyStaticCopy();
    }

    /* 4 — Mount language switcher ---------------------------------- */
    if (!isAdminPage) {
        lc.mountLanguageSwitcher();
    }

    /* 5 — Render dynamic sections (products, team, socials) -------- */
    const renderer = createRenderer({ localeController: lc });
    renderer.renderSite(isAdminPage ? undefined : getEffectiveSiteData());

    /* 5.1 — Admin: lazy-load editor on admin page, otherwise just
             wire up the secret key-sequence redirect. --------------- */
    if (isAdminPage) {
        import('./admin/editor.js?v=20260416d').then(({ createEditorController }) => {
            const editor = createEditorController({
                renderSite: renderer.renderSite,
                showToast,
                locale: lc.locale,
            });
            void editor.initialize();
        }).catch((error) => {
            console.error(error);
            showToast('Failed to load editor module', 'error');
        });
    } else {
        initAdminRouteAccess({ adminHref: getAdminHref() });
    }

    /* 6 — Activate scroll-reveal ----------------------------------- */
    initReveal([document.getElementById('main')].filter(Boolean));

    /* 7 — Bind global UI helpers ----------------------------------- */
    initSkipLink();
    initSharedThemeToggle();
    initSmoothRouteTransitions();

    /* 8 — Expose toast globally for admin / dev use ---------------- */
    /** @type {any} */ (window).__alephToast = showToast;
}

/* ------------------------------------------------------------------ */
/*  Launch                                                            */
/* ------------------------------------------------------------------ */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
