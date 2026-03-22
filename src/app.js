/**
 * @fileoverview Application bootstrap — single entry point.
 *
 * Wires together locale controller, renderer and reveal system.
 * Loaded as `type="module"` from every locale page.
 *
 * @module app
 */

import { createLocaleController } from './i18n/controller.js';
import { createEditorController }   from './admin/editor.js';
import { createRenderer }        from './components/renderer.js';
import { initReveal }            from './components/reveal.js';
import { showToast }             from './components/toast.js';
import { applyGlobalRouteRedirect, initSharedThemeToggle, initSmoothRouteTransitions } from './core/site-shell.js';

/* ------------------------------------------------------------------ */
/*  Boot                                                              */
/* ------------------------------------------------------------------ */

/**
 * Main initialisation sequence.
 * Idempotent — calling twice is harmless.
 */
function boot() {
    /* 1 — Build locale controller (auto-detects locale from path) -- */
    const lc = createLocaleController();

    /* 2 — Apply document‑level meta (lang, title, OG, etc.) -------- */
    lc.applyDocumentMeta();

    /* 3 — Stamp static text copies (nav, hero, manifesto, footer) -- */
    lc.applyStaticCopy();

    /* 3.1 — Global redirect to enabled product route --------------- */
    if (applyGlobalRouteRedirect()) return;

    /* 4 — Mount language switcher ---------------------------------- */
    lc.mountLanguageSwitcher();

    /* 5 — Render dynamic sections (products, team, socials) -------- */
    const renderer = createRenderer({ localeController: lc });
    renderer.renderSite();

    /* 5.1 — Hidden admin panel for site owner --------------------- */
    const editor = createEditorController({
        renderSite: renderer.renderSite,
        showToast,
        locale: lc.locale,
    });

    /* 6 — Activate scroll-reveal ----------------------------------- */
    initReveal();

    /* 7 — Bind global UI helpers ----------------------------------- */
    bindNavClose();
    bindSkipLink();
    initSharedThemeToggle();
    initSmoothRouteTransitions();

    /* 8 — Expose toast globally for admin / dev use ---------------- */
    /** @type {any} */ (window).__alephToast = showToast;

    /* 9 — Finalise admin state (loads local draft if present) ------ */
    void editor.initialize();
}

/* ------------------------------------------------------------------ */
/*  Minor UI helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Close mobile nav when a nav link is clicked.
 */
function bindNavClose() {
    const toggle = /** @type {HTMLInputElement | null} */ (
        document.getElementById('nav-toggle')
    );
    if (!toggle) return;

    document.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            toggle.checked = false;
        });
    });
}

/**
 * Ensure skip-to-content link moves focus correctly.
 */
function bindSkipLink() {
    const link = document.querySelector('.skip-link');
    if (!link) return;

    link.addEventListener('click', (e) => {
        const target = document.getElementById('main');
        if (target) {
            e.preventDefault();
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: false });
            target.removeAttribute('tabindex');
        }
    });
}

/* ------------------------------------------------------------------ */
/*  Launch                                                            */
/* ------------------------------------------------------------------ */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
