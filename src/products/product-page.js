/**
 * @fileoverview Minimal bootstrap for non-SV product detail pages
 * (Aleph Launcher, Aleph Trust, and any future products that use
 * product-page.css instead of strange-visuals.css).
 *
 * Responsibilities:
 *  - Locale detection + language switcher
 *  - Theme toggle
 *  - Skip-link
 *  - Smooth route transitions
 *  - Admin route access (secret sequence)
 *  - Reveal scroll animations
 *  - Share dock (hero-share-dock)
 *  - Donate link href injection
 *  - Gallery slider (ppGalleryScroll / ppGalleryPrev / ppGalleryNext)
 *  - Social links in footer (via renderer)
 *
 * NOT included (not needed on these pages):
 *  - GUI widget (strange-visuals specific)
 *  - Compare slider (strange-visuals specific)
 *  - Module list renderer (strange-visuals specific)
 *  - Visit counter (handled by app.js on the main site)
 *
 * @module products/product-page
 */

import { createLocaleController } from '../i18n/controller.js';
import { initReveal }             from '../components/reveal.js';
import {
    getAdminHref,
    getEffectiveSiteData,
    getLocaleDonateHref,
    initAdminRouteAccess,
    initSkipLink,
    initSharedThemeToggle,
    initSmoothRouteTransitions,
} from '../core/site-shell.js?v=20260606a';
import { localizeSiteData }       from '../data/localized-site-data.js';
import { SOCIAL_PLATFORMS, SOCIAL_ICON_SVG } from '../core/constants.js';
import { cleanUrl, escapeHtml }   from '../core/dom.js';

// ── Share dock ──────────────────────────────────────────────

/**
 * @param {{ shareDock: HTMLElement|null, shareBtn: HTMLButtonElement|null,
 *           shareMenu: HTMLElement|null }} els
 * @param {boolean} isOpen
 */
function setShareOpen(els, isOpen) {
    if (!els.shareDock || !els.shareBtn) return;
    els.shareDock.classList.toggle('open', isOpen);
    els.shareBtn.setAttribute('aria-expanded', String(isOpen));
    if (els.shareMenu instanceof HTMLElement) {
        els.shareMenu.setAttribute('aria-hidden', String(!isOpen));
    }
    [
        document.getElementById('shareTelegramBtn'),
        document.getElementById('shareDiscordBtn'),
        document.getElementById('shareYoutubeBtn'),
    ].forEach((link) => {
        if (!(link instanceof HTMLAnchorElement) || link.hidden) return;
        link.tabIndex = isOpen ? 0 : -1;
        link.setAttribute('aria-hidden', String(!isOpen));
    });
    if (!isOpen && els.shareMenu instanceof HTMLElement && els.shareMenu.contains(document.activeElement)) {
        els.shareBtn.focus();
    }
}

function initShareDock() {
    const shareDock = document.getElementById('shareDock');
    const shareBtn  = document.getElementById('shareBtn');
    const shareMenu = document.getElementById('shareMenu');
    if (!shareDock || !shareBtn) return;

    const els = { shareDock, shareBtn, shareMenu };
    setShareOpen(els, false);

    shareBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShareOpen(els, !shareDock.classList.contains('open'));
    });

    document.addEventListener('click', (e) => {
        if (!(e.target instanceof Node) || shareDock.contains(e.target)) return;
        setShareOpen(els, false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setShareOpen(els, false);
    });
}

// ── Donate links ────────────────────────────────────────────

function syncDonateLinks() {
    const baseHref = getLocaleDonateHref();
    const match = window.location.pathname.match(/\/(products\/[^/]+\/)/i);
    const href = match
        ? `${baseHref}${baseHref.includes('?') ? '&' : '?'}from=${encodeURIComponent(match[1])}`
        : baseHref;

    document.querySelectorAll('[data-donate-link]').forEach((el) => {
        if (el instanceof HTMLAnchorElement) el.href = href;
    });
}

// ── Footer social links ─────────────────────────────────────

function renderFooterSocials(siteData) {
    const target = document.getElementById('footerSocialLinks');
    if (!target) return;
    target.innerHTML = SOCIAL_PLATFORMS.map(({ key, label }) => {
        const href = cleanUrl(siteData.socials?.[key] || '');
        const icon = SOCIAL_ICON_SVG[key] || '';
        if (!href) return `<a class="social-link" aria-disabled="true" tabindex="-1" aria-label="${escapeHtml(label)}">${icon}</a>`;
        return `<a class="social-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${icon}</a>`;
    }).join('');
}

// ── Gallery slider ──────────────────────────────────────────

function initGallery() {
    const scroll = document.getElementById('ppGalleryScroll');
    const dots   = document.getElementById('ppGalleryDots');
    const prev   = document.getElementById('ppGalleryPrev');
    const next   = document.getElementById('ppGalleryNext');
    if (!(scroll instanceof HTMLElement)) return;

    const dotEls   = dots ? Array.from(dots.querySelectorAll('.gallery-dot')) : [];
    const total     = scroll.children.length;
    let autoTimer   = 0;
    let idleTimer   = 0;

    function currentIndex() {
        return Math.round(scroll.scrollLeft / scroll.clientWidth);
    }

    function goTo(index) {
        const i = ((index % total) + total) % total;
        scroll.scrollTo({ left: i * scroll.clientWidth, behavior: 'smooth' });
    }

    function updateDots() {
        const i = currentIndex();
        dotEls.forEach((d, n) => d.classList.toggle('active', n === i));
    }

    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = window.setInterval(() => goTo(currentIndex() + 1), 30000);
    }

    function resetIdle() {
        clearTimeout(idleTimer);
        clearInterval(autoTimer);
        idleTimer = window.setTimeout(startAuto, 30000);
    }

    scroll.addEventListener('scroll', updateDots, { passive: true });
    if (prev instanceof HTMLElement) prev.addEventListener('click', () => { goTo(currentIndex() - 1); resetIdle(); });
    if (next instanceof HTMLElement) next.addEventListener('click', () => { goTo(currentIndex() + 1); resetIdle(); });
    ['mousedown', 'touchstart', 'keydown'].forEach((ev) => {
        scroll.addEventListener(ev, resetIdle, { passive: true });
    });

    resetIdle();
}

// ── Boot ────────────────────────────────────────────────────

let booted = false;

function boot() {
    if (booted) return;
    booted = true;

    const lc       = createLocaleController();
    const siteData = localizeSiteData(getEffectiveSiteData(), lc.locale);

    lc.applyDocumentMeta();
    lc.applyStaticCopy();
    lc.mountLanguageSwitcher();

    initSkipLink();
    initSharedThemeToggle();
    initAdminRouteAccess({ adminHref: getAdminHref() });
    initSmoothRouteTransitions();

    syncDonateLinks();
    renderFooterSocials(siteData);
    initShareDock();
    initGallery();

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
