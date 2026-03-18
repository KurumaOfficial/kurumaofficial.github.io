import {
    DEFAULT_LOCALE,
    detectLocaleFromPath,
    getCanonicalHref,
    getLocaleMeta,
    getLocaleOptions,
    getLocalePath,
    normalizeLocale,
    resolveRouteRelativePath
} from './config.js';
import { PUBLIC_MESSAGES } from './messages.js';
import { localizeSiteData as localizeSiteContent } from './localized-content.js';

const TEXT_BINDINGS = Object.freeze([
    ['navLinkProducts', 'nav.products'],
    ['navLinkCatalog', 'nav.catalog'],
    ['navLinkStudio', 'nav.studio'],
    ['navLinkProof', 'nav.team'],
    ['heroBadgeText', 'hero.badge'],
    ['heroCta', 'hero.cta'],
    ['heroNote', 'hero.note'],
    ['approachEyebrow', 'approach.eyebrow'],
    ['productsEyebrow', 'products.eyebrow'],
    ['productsTitle', 'products.title'],
    ['catalogEyebrow', 'products.catalogEyebrow'],
    ['catalogTitle', 'products.catalogTitle'],
    ['catalogDescription', 'products.catalogDescription'],
    ['studioEyebrow', 'studio.eyebrow'],
    ['studioParagraph1', 'studio.paragraph1'],
    ['studioParagraph2', 'studio.paragraph2'],
    ['studioParagraph3', 'studio.paragraph3'],
    ['studioCase1Title', 'studio.case1Title'],
    ['studioCase1Text', 'studio.case1Text'],
    ['studioCase2Title', 'studio.case2Title'],
    ['studioCase2Text', 'studio.case2Text'],
    ['studioCase3Title', 'studio.case3Title'],
    ['studioCase3Text', 'studio.case3Text'],
    ['teamEyebrow', 'team.eyebrow'],
    ['teamTitle', 'team.title'],
    ['teamIntro', 'team.intro'],
    ['footerCopyright', 'footer.copyright'],
    ['footerSubtitle', 'footer.subtitle']
]);

const HTML_BINDINGS = Object.freeze([
    ['heroIntro', 'hero.intro'],
    ['approachLead', 'approach.lead']
]);

function getByPath(object, path) {
    return String(path || '')
        .split('.')
        .filter(Boolean)
        .reduce((value, key) => (value && Object.prototype.hasOwnProperty.call(value, key) ? value[key] : undefined), object);
}

function ensureHeadLink(id, rel, extraAttributes = {}) {
    let link = document.getElementById(id);
    if (!link) {
        link = document.createElement('link');
        link.id = id;
        document.head.appendChild(link);
    }
    link.rel = rel;
    Object.entries(extraAttributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
    });
    return link;
}

export function createLocaleController() {
    const locale = detectLocaleFromPath();
    const messages = PUBLIC_MESSAGES[locale] || PUBLIC_MESSAGES[DEFAULT_LOCALE];
    let switcherBound = false;

    function t(path, fallback = '') {
        const value = getByPath(messages, path);
        return value == null ? fallback : value;
    }

    function localizeSiteData(data) {
        return localizeSiteContent(data, locale);
    }

    function resolveSitePath(path) {
        return resolveRouteRelativePath(path);
    }

    function applyDocumentMeta() {
        document.documentElement.lang = locale;
        document.body.dataset.locale = locale;
        document.title = t('meta.title', 'Aleph Studio');

        const descriptionEl = document.querySelector('meta[name="description"]');
        if (descriptionEl) {
            descriptionEl.setAttribute('content', t('meta.description', 'Aleph Studio'));
        }

        const canonicalLink = ensureHeadLink('siteCanonicalLink', 'canonical');
        canonicalLink.href = getCanonicalHref(locale, window.location.origin, window.location.pathname);

        const alternateDefault = ensureHeadLink('siteAlternateDefault', 'alternate', { hreflang: 'x-default' });
        alternateDefault.href = `${window.location.origin}/`;

        ['ru', 'en', 'uk'].forEach((code) => {
            const alternateLink = ensureHeadLink(`siteAlternate-${code}`, 'alternate', { hreflang: code });
            alternateLink.href = code === 'ru'
                ? `${window.location.origin}${getLocalePath(code)}`
                : `${window.location.origin}${getLocalePath(code)}`;
        });
    }

    function applyStaticCopy() {
        TEXT_BINDINGS.forEach(([id, path]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = t(path, element.textContent);
            }
        });

        HTML_BINDINGS.forEach(([id, path]) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = t(path, element.innerHTML);
            }
        });

        const editorAccessTrigger = document.getElementById('editorAccessTrigger');
        if (editorAccessTrigger) {
            editorAccessTrigger.setAttribute('aria-label', t('brand.homeLabel', editorAccessTrigger.getAttribute('aria-label') || 'Aleph Studio'));
        }

        const featuredSocialLinks = document.getElementById('featuredSocialLinks');
        if (featuredSocialLinks) {
            featuredSocialLinks.setAttribute('aria-label', t('products.socialsLabel', featuredSocialLinks.getAttribute('aria-label') || 'Aleph Studio social links'));
        }

        const footerSocialLinks = document.getElementById('footerSocialLinks');
        if (footerSocialLinks) {
            footerSocialLinks.setAttribute('aria-label', t('footer.socialsLabel', footerSocialLinks.getAttribute('aria-label') || 'Aleph Studio social links'));
        }
    }

    function closeLanguageMenu() {
        const trigger = document.getElementById('localeSwitcherButton');
        const menu = document.getElementById('localeSwitcherMenu');
        if (!trigger || !menu) return;
        trigger.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
    }

    function openLanguageMenu() {
        const trigger = document.getElementById('localeSwitcherButton');
        const menu = document.getElementById('localeSwitcherMenu');
        if (!trigger || !menu) return;
        trigger.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
    }

    function toggleLanguageMenu() {
        const menu = document.getElementById('localeSwitcherMenu');
        if (!menu) return;
        if (menu.hidden) {
            openLanguageMenu();
        } else {
            closeLanguageMenu();
        }
    }

    function mountLanguageSwitcher() {
        const switcher = document.getElementById('localeSwitcher');
        const trigger = document.getElementById('localeSwitcherButton');
        const currentFlag = document.getElementById('localeSwitcherFlag');
        const currentLabel = document.getElementById('localeSwitcherLabel');
        const menu = document.getElementById('localeSwitcherMenu');

        if (!switcher || !trigger || !currentFlag || !currentLabel || !menu) {
            return;
        }

        const activeLocaleMeta = getLocaleMeta(locale);
        const options = getLocaleOptions(window.location.pathname, window.location.hash || '');

        currentFlag.innerHTML = options.find((item) => item.locale === locale)?.flagSvg || '';
        currentLabel.textContent = activeLocaleMeta.label;
        trigger.setAttribute('aria-label', t('locale.triggerLabel', 'Choose language'));
        menu.setAttribute('aria-label', t('locale.menuLabel', 'Choose language'));

        menu.innerHTML = options.map((option) => `
            <button
                type="button"
                class="locale-option ${option.locale === locale ? 'is-active' : ''}"
                data-locale-option="${option.locale}"
                role="option"
                aria-selected="${option.locale === locale ? 'true' : 'false'}"
            >
                <span class="locale-option-flag">${option.flagSvg}</span>
                <span class="locale-option-copy">
                    <span class="locale-option-label">${option.label}</span>
                    <span class="locale-option-code mono">${option.shortLabel}</span>
                </span>
            </button>
        `).join('');

        if (switcherBound) {
            return;
        }
        switcherBound = true;

        trigger.addEventListener('click', () => {
            toggleLanguageMenu();
        });

        menu.addEventListener('click', (event) => {
            const target = event.target.closest('[data-locale-option]');
            if (!target) return;

            const nextLocale = normalizeLocale(target.getAttribute('data-locale-option'));
            const hash = window.location.hash || '';
            window.location.assign(`${getLocalePath(nextLocale)}${hash}`);
        });

        document.addEventListener('click', (event) => {
            if (!switcher.contains(event.target)) {
                closeLanguageMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeLanguageMenu();
            }
        });
    }

    return {
        locale,
        messages,
        t,
        localizeSiteData,
        resolveSitePath,
        applyDocumentMeta,
        applyStaticCopy,
        mountLanguageSwitcher,
        getLocalePath
    };
}
