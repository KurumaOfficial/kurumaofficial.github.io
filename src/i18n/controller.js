/**
 * @fileoverview Locale controller — resolves the active locale,
 * exposes a `t()` helper, applies document-level meta, mounts the
 * language switcher and keeps hreflang / canonical links in sync.
 *
 * Designed for zero innerHTML with user data — all switcher nodes
 * are built via DOM API.
 * @module i18n/controller
 */

import {
    DEFAULT_LOCALE,
    detectLocaleFromPath,
    getCanonicalHref,
    getLocaleMeta,
    getLocaleOptions,
    getLocalePath,
    normalizeLocale,
    resolveRouteRelativePath,
} from './config.js';
import { MESSAGES } from './messages.js';
import { navigateWithRouteTransition } from '../core/site-shell.js';

// ── Private helpers ─────────────────────────────────────────

/**
 * Walk an object by dot-path.
 * @param {Record<string, unknown>} obj
 * @param {string} path
 * @returns {unknown}
 */
function getByPath(obj, path) {
    return String(path || '')
        .split('.')
        .filter(Boolean)
        .reduce((cur, key) => (cur && typeof cur === 'object' ? /** @type {any} */ (cur)[key] : undefined), obj);
}

/**
 * Ensure a `<link>` element exists in `<head>`.
 * @param {string} id
 * @param {string} rel
 * @param {Record<string, string>} [attrs]
 * @returns {HTMLLinkElement}
 */
function ensureHeadLink(id, rel, attrs = {}) {
    let link = /** @type {HTMLLinkElement | null} */ (document.getElementById(id));
    if (!link) {
        link = /** @type {HTMLLinkElement} */ (document.createElement('link'));
        link.id = id;
        document.head.appendChild(link);
    }
    link.rel = rel;
    for (const [k, v] of Object.entries(attrs)) link.setAttribute(k, v);
    return link;
}

// ── Factory ─────────────────────────────────────────────────

/**
 * Create a locale controller bound to the current page locale.
 */
export function createLocaleController() {
    const locale = detectLocaleFromPath();
    const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
    const meta = getLocaleMeta(locale);

    /** @type {boolean} */
    let switcherMounted = false;

    /**
     * Look up a translation string by dot-path.
     * @param {string} path  e.g. `'nav.products'`
     * @param {string} [fallback]
     * @returns {string}
     */
    function t(path, fallback = '') {
        const val = getByPath(/** @type {any} */ (messages), path);
        return val == null ? fallback : String(val);
    }

    /**
     * Resolve a site-relative path from the current locale route.
     * @param {string} path
     * @returns {string}
     */
    function resolveSitePath(path) {
        return resolveRouteRelativePath(path);
    }

    // ── Document-level meta ─────────────────────────────────

    function applyDocumentMeta() {
        document.documentElement.lang = meta.code;
        document.title = t('meta.title', 'Aleph Studio');

        const descEl = document.querySelector('meta[name="description"]');
        if (descEl) descEl.setAttribute('content', t('meta.description', ''));

        /* Canonical */
        const canonical = ensureHeadLink('siteCanonical', 'canonical');
        canonical.href = getCanonicalHref(locale);

        /* x-default alternate */
        const xDefault = ensureHeadLink('siteAltDefault', 'alternate', { hreflang: 'x-default' });
        xDefault.href = `${window.location.origin}/`;

        /* per-locale alternates */
        for (const { routeLocale, hreflang } of [
            { routeLocale: 'ru', hreflang: 'ru' },
            { routeLocale: 'en', hreflang: 'en' },
            { routeLocale: 'ua', hreflang: 'uk' },
        ]) {
            const alt = ensureHeadLink(`siteAlt-${routeLocale}`, 'alternate', { hreflang });
            alt.href = `${window.location.origin}${getLocalePath(routeLocale)}`;
        }
    }

    // ── Static copy binding ─────────────────────────────────

    /** @type {ReadonlyArray<[string, string]>} */
    const TEXT_BINDINGS = [
        /* Navigation */
        ['navLinkProducts',  'nav.products'],
        ['navLinkManifesto', 'nav.manifesto'],
        ['navLinkTeam',      'nav.team'],
        /* Hero CTAs */
        ['heroCta1',         'hero.ctaPrimary'],
        ['heroCta2',         'hero.ctaSecondary'],
        /* Products */
        ['productsTitle',    'products.title'],
        ['catalogTitle',     'products.catalogTitle'],
        ['catalogDesc',      'products.catalogDesc'],
        /* Manifesto (plain text items) */
        ['manifestoHeading', 'manifesto.heading'],
        ['case1Title',       'manifesto.case1Title'],
        ['case1Text',        'manifesto.case1Text'],
        ['case2Title',       'manifesto.case2Title'],
        ['case2Text',        'manifesto.case2Text'],
        ['case3Title',       'manifesto.case3Title'],
        ['case3Text',        'manifesto.case3Text'],
        /* Team */
        ['teamTitle',        'team.title'],
        ['teamIntro',        'team.intro'],
        /* Footer */
        ['footerDesc',       'footer.desc'],
        ['footerNavHeading', 'footer.navHeading'],
        ['footerWetteaHeading', 'footer.wetteaHeading'],
        ['footerCopyright',  'footer.copyright'],
    ];

    /** @type {ReadonlyArray<[string, string]>} */
    const HTML_BINDINGS = [
        ['heroIntro',      'hero.intro'],
        ['approachLead',   'approach.lead'],
        ['manifestoText',  'manifesto.text'],
    ];

    function applyStaticCopy() {
        for (const [id, path] of TEXT_BINDINGS) {
            const el = document.getElementById(id);
            if (el) el.textContent = t(path, el.textContent ?? '');
        }
        for (const [id, path] of HTML_BINDINGS) {
            const el = document.getElementById(id);
            if (el) el.innerHTML = t(path, el.innerHTML);
        }

        /* Aria labels */
        const logoLink = document.getElementById('logoLink');
        if (logoLink) logoLink.setAttribute('aria-label', t('brand.homeLabel', 'Aleph Studio'));

        const skipLink = document.getElementById('skipLink');
        if (skipLink) skipLink.textContent = t('skipLink', skipLink.textContent ?? '');
    }

    // ── Language switcher ───────────────────────────────────

    function mountLanguageSwitcher() {
        const container = document.getElementById('localeSwitcher');
        const trigger = document.getElementById('localeSwitcherTrigger');
        const flag = document.getElementById('localeSwitcherFlag');
        const label = document.getElementById('localeSwitcherLabel');
        const menu = document.getElementById('localeSwitcherMenu');

        if (!container || !trigger || !flag || !label || !menu) return;

        const options = getLocaleOptions();
        const current = options.find((o) => o.locale === locale);

        /* Set current flag + label */
        if (current) {
            flag.innerHTML = current.flagSvg;
            label.textContent = current.label;
        }
        trigger.setAttribute('aria-label', t('locale.triggerLabel', 'Choose language'));
        menu.setAttribute('aria-label', t('locale.menuLabel', 'Choose language'));

        /* Build option buttons via DOM API (no innerHTML with user data) */
        menu.textContent = ''; // clear
        for (const opt of options) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'locale-option';
            btn.setAttribute('role', 'option');
            btn.setAttribute('aria-selected', String(opt.locale === locale));
            btn.dataset.locale = opt.locale;
            btn.dataset.href = opt.href;

            const flagSpan = document.createElement('span');
            flagSpan.className = 'locale-option__flag';
            flagSpan.innerHTML = opt.flagSvg; // trusted SVG from config

            const copyDiv = document.createElement('span');
            copyDiv.className = 'locale-option__copy';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'locale-option__label';
            labelSpan.textContent = opt.label;

            const codeSpan = document.createElement('span');
            codeSpan.className = 'locale-option__code mono';
            codeSpan.textContent = opt.shortLabel;

            copyDiv.append(labelSpan, codeSpan);
            btn.append(flagSpan, copyDiv);
            menu.appendChild(btn);
        }

        /* Close menu */
        const close = () => {
            trigger.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
        };
        close();

        if (switcherMounted) return;
        switcherMounted = true;

        /* Toggle */
        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
        });

        /* Select */
        menu.addEventListener('click', (e) => {
            const btn = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[data-locale]'));
            if (!btn) return;
            const nextHref = btn.dataset.href;
            if (nextHref) {
                close();
                navigateWithRouteTransition(nextHref);
                return;
            }
            const next = normalizeLocale(btn.dataset.locale ?? '');
            const search = window.location.search || '';
            const hash = window.location.hash || '';
            close();
            navigateWithRouteTransition(`${getLocalePath(next)}${search}${hash}`);
        });

        /* Click outside */
        document.addEventListener('click', (e) => {
            if (!container.contains(/** @type {Node} */ (e.target))) close();
        });

        /* Escape */
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });
    }

    // ── Public API ──────────────────────────────────────────

    return Object.freeze({
        locale,
        messages,
        t,
        resolveSitePath,
        applyDocumentMeta,
        applyStaticCopy,
        mountLanguageSwitcher,
    });
}
