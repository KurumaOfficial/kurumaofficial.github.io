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
    buildLocalizedRoutePath,
    DEFAULT_LOCALE,
    detectLocaleFromPath,
    getCanonicalHref,
    getLocaleMeta,
    getLocaleOptions,
    normalizeLocale,
    resolveRouteRelativePath,
} from './config.js';
import { MESSAGES } from './messages.js';
import { navigateWithRouteTransition } from '../core/site-shell.js?v=20260415c';

const DEFAULT_SOCIAL_IMAGE_PATH = './assets/images/products/strange-visuals/after.webp';
const DEFAULT_SOCIAL_IMAGE_WIDTH = '1919';
const DEFAULT_SOCIAL_IMAGE_HEIGHT = '1054';

const OG_LOCALE_MAP = Object.freeze({
    ru: 'ru_RU',
    en: 'en_US',
    ua: 'uk_UA',
});

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

/**
 * Ensure a `<meta>` element exists in `<head>`.
 * @param {string} id
 * @param {string} key
 * @param {'name' | 'property'} [attr='name']
 * @returns {HTMLMetaElement}
 */
function ensureHeadMeta(id, key, attr = 'name') {
    let meta = /** @type {HTMLMetaElement | null} */ (document.getElementById(id));
    if (!meta) {
        meta = /** @type {HTMLMetaElement | null} */ (document.head.querySelector(`meta[${attr}="${key}"]`));
    }
    if (!meta) {
        meta = /** @type {HTMLMetaElement} */ (document.createElement('meta'));
        document.head.appendChild(meta);
    }
    if (!meta.id) {
        meta.id = id;
    }
    meta.setAttribute(attr, key);
    return meta;
}

// ── Factory ─────────────────────────────────────────────────

/**
 * Create a locale controller bound to the current page locale.
 */
export function createLocaleController() {
    const locale = detectLocaleFromPath();
    const messages = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
    const meta = getLocaleMeta(locale);

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

    /**
     * Apply page-level metadata.
     * When overrides are omitted, locale default messages are used.
     * @param {{ title?: string; description?: string }} [overrides]
     */
    function applyDocumentMeta(overrides = {}) {
        document.documentElement.lang = meta.code;
        const descriptionEl = document.querySelector('meta[name="description"]') || ensureHeadMeta('siteDescription', 'description');
        const fallbackTitle = document.title || 'Aleph Studio';
        const fallbackDescription = descriptionEl?.getAttribute('content') || '';
        const title = overrides.title ?? t('meta.title', fallbackTitle);
        const description = overrides.description ?? t('meta.description', fallbackDescription);
        const canonicalHref = getCanonicalHref(locale, window.location.origin, window.location.pathname);
        const socialImagePath = resolveRouteRelativePath(DEFAULT_SOCIAL_IMAGE_PATH, window.location.pathname);
        const socialImageHref = socialImagePath ? new URL(socialImagePath, window.location.href).toString() : '';

        document.title = title;

        if (descriptionEl) {
            descriptionEl.setAttribute('content', description);
        }

        /* Canonical */
        const canonical = ensureHeadLink('siteCanonical', 'canonical');
        canonical.href = canonicalHref;

        /* x-default alternate */
        const xDefault = ensureHeadLink('siteAltDefault', 'alternate', { hreflang: 'x-default' });
        xDefault.href = getCanonicalHref(DEFAULT_LOCALE, window.location.origin, window.location.pathname);

        /* per-locale alternates */
        for (const { routeLocale, hreflang } of [
            { routeLocale: 'ru', hreflang: 'ru' },
            { routeLocale: 'en', hreflang: 'en' },
            { routeLocale: 'ua', hreflang: 'uk' },
        ]) {
            const alt = ensureHeadLink(`siteAlt-${routeLocale}`, 'alternate', { hreflang });
            alt.href = getCanonicalHref(routeLocale, window.location.origin, window.location.pathname);
        }

        ensureHeadMeta('siteOgType', 'og:type', 'property').content = 'website';
        ensureHeadMeta('siteOgTitle', 'og:title', 'property').content = title;
        ensureHeadMeta('siteOgDescription', 'og:description', 'property').content = description;
        ensureHeadMeta('siteOgLocale', 'og:locale', 'property').content = OG_LOCALE_MAP[locale] || OG_LOCALE_MAP[DEFAULT_LOCALE];
        ensureHeadMeta('siteOgSiteName', 'og:site_name', 'property').content = 'Aleph Studio';
        ensureHeadMeta('siteOgUrl', 'og:url', 'property').content = canonicalHref;
        if (socialImageHref) {
            ensureHeadMeta('siteOgImage', 'og:image', 'property').content = socialImageHref;
            ensureHeadMeta('siteOgImageType', 'og:image:type', 'property').content = 'image/webp';
            ensureHeadMeta('siteOgImageWidth', 'og:image:width', 'property').content = DEFAULT_SOCIAL_IMAGE_WIDTH;
            ensureHeadMeta('siteOgImageHeight', 'og:image:height', 'property').content = DEFAULT_SOCIAL_IMAGE_HEIGHT;
            ensureHeadMeta('siteOgImageAlt', 'og:image:alt', 'property').content = title;
            ensureHeadMeta('siteTwitterImage', 'twitter:image').content = socialImageHref;
            ensureHeadMeta('siteTwitterImageAlt', 'twitter:image:alt').content = title;
        }
        ensureHeadMeta('siteTwitterCard', 'twitter:card').content = 'summary_large_image';
        ensureHeadMeta('siteTwitterTitle', 'twitter:title').content = title;
        ensureHeadMeta('siteTwitterDescription', 'twitter:description').content = description;
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

        const openLabel = t('locale.openLabel', t('locale.triggerLabel', 'Choose language'));
        const closeLabel = t('locale.closeLabel', openLabel);

        const options = getLocaleOptions();
        const current = options.find((o) => o.locale === locale);

        /* Set current flag + label */
        if (current) {
            flag.innerHTML = current.flagSvg;
            label.textContent = current.label;
        }
        trigger.setAttribute('aria-controls', 'localeSwitcherMenu');
        trigger.setAttribute('aria-label', openLabel);
        menu.setAttribute('aria-label', t('locale.menuLabel', 'Choose language'));
        menu.setAttribute('aria-orientation', 'vertical');

        /* Build option buttons via DOM API (no innerHTML with user data) */
        menu.textContent = ''; // clear
        for (const opt of options) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.id = `localeSwitcherOption-${opt.locale}`;
            btn.className = 'locale-option';
            btn.setAttribute('role', 'menuitemradio');
            btn.setAttribute('aria-checked', String(opt.locale === locale));
            btn.dataset.locale = opt.locale;
            btn.dataset.href = opt.href;
            btn.tabIndex = opt.locale === locale ? 0 : -1;

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

        const getItems = () => Array.from(menu.querySelectorAll('[data-locale]')).filter((item) => item instanceof HTMLButtonElement);

        const getCurrentIndex = (items) => {
            const focusedIndex = items.findIndex((item) => item === document.activeElement);
            if (focusedIndex >= 0) return focusedIndex;

            const selectedIndex = items.findIndex((item) => item.dataset.locale === locale);
            return selectedIndex >= 0 ? selectedIndex : 0;
        };

        const syncMenuFocus = (items, activeIndex, { focus = false } = {}) => {
            items.forEach((item, index) => {
                item.tabIndex = index === activeIndex ? 0 : -1;
            });

            if (focus) {
                items[activeIndex]?.focus();
            }
        };

        /* Close menu */
        const close = ({ returnFocus = false } = {}) => {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.setAttribute('aria-label', openLabel);
            menu.hidden = true;
            if (returnFocus) {
                trigger.focus();
            }
        };
        const open = ({ focusSelected = true } = {}) => {
            const items = getItems();
            const activeIndex = getCurrentIndex(items);
            syncMenuFocus(items, activeIndex, { focus: false });
            trigger.setAttribute('aria-expanded', 'true');
            trigger.setAttribute('aria-label', closeLabel);
            menu.hidden = false;
            if (focusSelected) {
                syncMenuFocus(items, activeIndex, { focus: true });
            }
        };
        close();

        if (container.dataset.localeSwitcherBound === '1') return;
        container.dataset.localeSwitcherBound = '1';

        /* Toggle */
        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            if (expanded) {
                close();
                return;
            }
            open();
        });

        trigger.addEventListener('keydown', (event) => {
            if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
            event.preventDefault();
            open();
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
            navigateWithRouteTransition(`${buildLocalizedRoutePath(next, window.location.pathname)}${search}${hash}`);
        });

        menu.addEventListener('keydown', (event) => {
            const items = getItems();
            if (!items.length) return;

            const currentIndex = getCurrentIndex(items);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % items.length;
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = items.length - 1;
            } else if (event.key === 'Escape') {
                event.preventDefault();
                close({ returnFocus: true });
                return;
            } else if (event.key === 'Tab') {
                close();
                return;
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                items[currentIndex]?.click();
                return;
            } else {
                return;
            }

            event.preventDefault();
            syncMenuFocus(items, nextIndex, { focus: true });
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
