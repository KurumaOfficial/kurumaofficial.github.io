import { initReveal } from '../components/reveal.js';
import { escapeHtml } from '../core/dom.js';
import { localizeSiteData } from '../data/localized-site-data.js';
import { createLocaleController } from '../i18n/controller.js';
import {
    applyGlobalRouteRedirect,
    getAdminHref,
    getEffectiveSiteData,
    initAdminRouteAccess,
    initSharedThemeToggle,
    initSmoothRouteTransitions,
} from '../core/site-shell.js';

const CATEGORY_ORDER = Object.freeze(['player', 'world', 'utils', 'other', 'interface', 'themes']);

const ROUTE_CATEGORY_META = Object.freeze({
    ru: {
        player: { title: 'На игроке', icon: 'person' },
        world: { title: 'В мире', icon: 'public' },
        utils: { title: 'Утилиты', icon: 'build' },
        other: { title: 'Остальное', icon: 'more_horiz' },
        interface: { title: 'Интерфейс', icon: 'dashboard' },
        themes: { title: 'Темы', icon: 'palette' },
        enabled: 'ВКЛЮЧЕНО',
        disabled: 'ВЫКЛЮЧЕНО',
        badgeOn: 'ВКЛ',
        badgeOff: 'ВЫКЛ',
    },
    en: {
        player: { title: 'Player', icon: 'person' },
        world: { title: 'World', icon: 'public' },
        utils: { title: 'Utilities', icon: 'build' },
        other: { title: 'Other', icon: 'more_horiz' },
        interface: { title: 'Interface', icon: 'dashboard' },
        themes: { title: 'Themes', icon: 'palette' },
        enabled: 'ENABLED',
        disabled: 'DISABLED',
        badgeOn: 'ON',
        badgeOff: 'OFF',
    },
    ua: {
        player: { title: 'На гравці', icon: 'person' },
        world: { title: 'У світі', icon: 'public' },
        utils: { title: 'Утиліти', icon: 'build' },
        other: { title: 'Інше', icon: 'more_horiz' },
        interface: { title: 'Інтерфейс', icon: 'dashboard' },
        themes: { title: 'Теми', icon: 'palette' },
        enabled: 'УВІМКНЕНО',
        disabled: 'ВИМКНЕНО',
        badgeOn: 'УВІМК',
        badgeOff: 'ВИМК',
    },
});

const ROUTE_SHARE_META = Object.freeze({
    ru: {
        menuLabel: 'Поделиться в соцсетях',
        openLabel: 'Открыть меню ссылок',
        closeLabel: 'Закрыть меню ссылок',
        telegram: 'Telegram',
        discord: 'Discord',
        youtube: 'YouTube',
    },
    en: {
        menuLabel: 'Share on social platforms',
        openLabel: 'Open links menu',
        closeLabel: 'Close links menu',
        telegram: 'Telegram',
        discord: 'Discord',
        youtube: 'YouTube',
    },
    ua: {
        menuLabel: 'Поділитися у соцмережах',
        openLabel: 'Відкрити меню посилань',
        closeLabel: 'Закрити меню посилань',
        telegram: 'Telegram',
        discord: 'Discord',
        youtube: 'YouTube',
    },
});

const COMPARE_COPY = Object.freeze({
    ru: {
        slotHint: 'Скриншоты появятся здесь',
        beforeEmpty: 'Скриншот без мода',
        afterEmpty: 'Скриншот с модом',
    },
    en: {
        slotHint: 'Screenshots will appear here',
        beforeEmpty: 'Screenshot without the mod',
        afterEmpty: 'Screenshot with the mod',
    },
    ua: {
        slotHint: 'Скриншоти зʼявляться тут',
        beforeEmpty: 'Скриншот без мода',
        afterEmpty: 'Скриншот з модом',
    },
});

function getElements() {
    return {
        shareBtn: document.getElementById('shareBtn'),
        shareDock: document.getElementById('shareDock'),
        shareMenu: document.getElementById('shareMenu'),
        shareTelegramBtn: document.getElementById('shareTelegramBtn'),
        shareDiscordBtn: document.getElementById('shareDiscordBtn'),
        shareYoutubeBtn: document.getElementById('shareYoutubeBtn'),
        installBtn: document.getElementById('installBtn'),
        sourceBtn: document.getElementById('sourceBtn'),
        gwTabsEl: document.getElementById('gwTabs'),
        gwSecEl: document.getElementById('gwSec'),
        gwBodyEl: document.getElementById('gwBody'),
        gwItemsEl: document.getElementById('gwItems'),
        modGridEl: document.getElementById('modGrid'),
        compareSlider: document.getElementById('compareSlider'),
        compareAfterWrap: document.getElementById('compareAfterWrap'),
        compareDivider: document.getElementById('compareDivider'),
        compareHandle: document.getElementById('compareHandle'),
        compareBeforeFrame: document.getElementById('compareBeforeFrame'),
        compareAfterFrame: document.getElementById('compareAfterFrame'),
        compareBeforeImage: document.getElementById('compareBeforeImage'),
        compareAfterImage: document.getElementById('compareAfterImage'),
        compareBeforeState: document.getElementById('compareBeforeState'),
        compareAfterState: document.getElementById('compareAfterState'),
        compareSlot: document.getElementById('compareSlot'),
        supportDiscordLink: document.getElementById('supportDiscordLink'),
        donateLinks: [...document.querySelectorAll('[data-donate-link]')],
    };
}

function getLocaleMeta(locale) {
    return ROUTE_CATEGORY_META[locale] || ROUTE_CATEGORY_META.ru;
}

function getShareMeta(locale) {
    return ROUTE_SHARE_META[locale] || ROUTE_SHARE_META.ru;
}

function getCompareCopy(locale) {
    return COMPARE_COPY[locale] || COMPARE_COPY.ru;
}

function resolveRouteAsset(path) {
    const value = String(path || '').trim();
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
    const cleaned = value.replace(/^\.\//, '').replace(/^\/+/, '');
    return new URL(`../../../${cleaned}`, window.location.href).toString();
}

function getDonateHref() {
    return new URL('./donate/', window.location.href).toString();
}

function getRouteProduct(products) {
    const items = Array.isArray(products) ? products : [];
    const match = window.location.pathname.match(/\/products\/([^/]+)\/?/i);
    const slug = match?.[1] || 'strange-visuals';

    return items.find((product) => product.id === slug)
        || items.find((product) => String(product.detailUrl || '').includes(`/products/${slug}/`) || String(product.detailUrl || '').includes(`products/${slug}/`))
        || items[0]
        || null;
}

function getTabKeys(localeMeta, tabs) {
    return CATEGORY_ORDER.filter((key) => localeMeta[key] && Array.isArray(tabs[key]) && tabs[key].length);
}

function setShareDockOpen(elements, isOpen, shareMeta) {
    if (!elements.shareDock || !elements.shareBtn) return;
    elements.shareDock.classList.toggle('open', isOpen);
    elements.shareBtn.setAttribute('aria-expanded', String(isOpen));
    elements.shareBtn.setAttribute('aria-label', isOpen ? shareMeta.closeLabel : shareMeta.openLabel);
}

function syncSupportDiscordLink(elements, siteData) {
    if (!(elements.supportDiscordLink instanceof HTMLAnchorElement)) return;

    const discordHref = resolveRouteAsset(siteData.socials?.discord || '');
    if (!discordHref) {
        elements.supportDiscordLink.removeAttribute('href');
        elements.supportDiscordLink.removeAttribute('target');
        elements.supportDiscordLink.removeAttribute('rel');
        return;
    }

    elements.supportDiscordLink.href = discordHref;
    elements.supportDiscordLink.target = '_blank';
    elements.supportDiscordLink.rel = 'noopener noreferrer';
}

function syncDonateLinks(elements) {
    const donateHref = getDonateHref();
    elements.donateLinks.forEach((link) => {
        if (link instanceof HTMLAnchorElement) {
            link.href = donateHref;
        }
    });
}

function initShareDock(elements, siteData, shareMeta) {
    if (!elements.shareDock || !elements.shareBtn) return;

    const shareLinks = [
        { key: 'telegram', el: elements.shareTelegramBtn },
        { key: 'discord', el: elements.shareDiscordBtn },
        { key: 'youtube', el: elements.shareYoutubeBtn },
    ];

    let visibleCount = 0;

    shareLinks.forEach(({ key, el }) => {
        if (!(el instanceof HTMLAnchorElement)) return;

        const href = resolveRouteAsset(siteData.socials?.[key] || el.getAttribute('href') || '');
        if (!href) {
            el.hidden = true;
            el.removeAttribute('href');
            return;
        }

        visibleCount += 1;
        el.hidden = false;
        el.href = href;
        el.style.setProperty('--share-index', String(visibleCount));
        el.setAttribute('aria-label', shareMeta[key] || key);
        el.setAttribute('title', shareMeta[key] || key);
        el.addEventListener('click', () => setShareDockOpen(elements, false, shareMeta));
    });

    syncSupportDiscordLink(elements, siteData);
    syncDonateLinks(elements);

    if (!visibleCount) {
        elements.shareDock.hidden = true;
        return;
    }

    if (elements.shareMenu) {
        elements.shareMenu.setAttribute('aria-label', shareMeta.menuLabel);
    }

    elements.shareDock.hidden = false;
    elements.shareDock.style.setProperty('--share-count', String(visibleCount));
    setShareDockOpen(elements, false, shareMeta);

    elements.shareBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setShareDockOpen(elements, !elements.shareDock.classList.contains('open'), shareMeta);
    });

    document.addEventListener('click', (event) => {
        if (!(event.target instanceof Node) || elements.shareDock.contains(event.target)) return;
        setShareDockOpen(elements, false, shareMeta);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        setShareDockOpen(elements, false, shareMeta);
    });
}

function initActionButtons(elements, routeProduct) {
    syncDonateLinks(elements);

    if (elements.installBtn instanceof HTMLAnchorElement) {
        if (routeProduct?.downloadUrl) {
            elements.installBtn.href = resolveRouteAsset(routeProduct.downloadUrl);
            elements.installBtn.setAttribute('download', '');
        } else {
            elements.installBtn.removeAttribute('href');
            elements.installBtn.removeAttribute('download');
            elements.installBtn.setAttribute('aria-disabled', 'true');
        }
    }

    if (!(elements.sourceBtn instanceof HTMLAnchorElement)) return;

    const sourceUrl = routeProduct?.sourceUrl || elements.sourceBtn.getAttribute('href') || '';
    if (!sourceUrl) {
        elements.sourceBtn.hidden = true;
        return;
    }

    elements.sourceBtn.hidden = false;
    elements.sourceBtn.href = sourceUrl;
}

function toggleGwItem(itemEl, localeMeta) {
    const statusEl = itemEl.querySelector('.gw-status');
    if (!(statusEl instanceof HTMLElement)) return;

    const nextEnabled = !statusEl.classList.contains('on');
    itemEl.style.transform = 'scale(.97)';
    window.setTimeout(() => {
        itemEl.style.transform = '';
    }, 110);

    statusEl.classList.toggle('on', nextEnabled);
    statusEl.classList.toggle('off', !nextEnabled);
    statusEl.textContent = nextEnabled ? localeMeta.enabled : localeMeta.disabled;
    itemEl.setAttribute('aria-pressed', String(nextEnabled));
}

let guiBuildTimer = 0;

function buildGui(elements, tabs, localeMeta, key) {
    if (!elements.gwBodyEl || !elements.gwSecEl || !elements.gwItemsEl) return;

    const meta = localeMeta[key] || localeMeta.player;
    const items = Array.isArray(tabs[key]) ? tabs[key] : [];
    const scrollEl = elements.gwBodyEl.querySelector('.gw-scroll');

    elements.gwBodyEl.classList.replace('fin', 'fout');
    window.clearTimeout(guiBuildTimer);

    guiBuildTimer = window.setTimeout(() => {
        elements.gwSecEl.textContent = meta.title;
        elements.gwItemsEl.textContent = '';

        items.forEach((item) => {
            const itemEl = document.createElement('button');
            itemEl.type = 'button';
            itemEl.className = 'gw-item';
            itemEl.setAttribute('aria-pressed', String(Boolean(item.enabled)));
            itemEl.innerHTML = `
                <div class="gw-av"><span class="material-icons">${meta.icon}</span></div>
                <div class="gw-info">
                  <div class="gw-name">${escapeHtml(item.name)}</div>
                  <div class="gw-status ${item.enabled ? 'on' : 'off'}">${item.enabled ? localeMeta.enabled : localeMeta.disabled}</div>
                </div>
                <div class="gw-dots"><span class="material-icons">more_vert</span></div>
            `;
            itemEl.addEventListener('click', () => toggleGwItem(itemEl, localeMeta));
            elements.gwItemsEl.appendChild(itemEl);
        });

        if (scrollEl instanceof HTMLElement) {
            scrollEl.scrollTop = 0;
        }

        elements.gwBodyEl.classList.replace('fout', 'fin');
    }, 170);
}

function renderGwTabs(elements, tabKeys, localeMeta, onSelect) {
    if (!elements.gwTabsEl) return;

    if (!tabKeys.length) {
        elements.gwTabsEl.textContent = '';
        return;
    }

    elements.gwTabsEl.innerHTML = tabKeys.map((key, index) => `
        <button type="button" class="gw-tab${index === 0 ? ' active' : ''}" data-tab="${key}">
          ${localeMeta[key].title}
        </button>
    `).join('');

    elements.gwTabsEl.onclick = (event) => {
        const target = event.target instanceof Element ? event.target.closest('[data-tab]') : null;
        if (!(target instanceof HTMLElement)) return;

        const nextKey = target.dataset.tab || tabKeys[0];
        elements.gwTabsEl.querySelectorAll('[data-tab]').forEach((item) => {
            item.classList.toggle('active', item === target);
        });
        onSelect(nextKey);
    };
}

function renderModuleList(elements, tabKeys, tabs, localeMeta) {
    if (!elements.modGridEl) return;

    elements.modGridEl.innerHTML = tabKeys.map((key) => {
        const meta = localeMeta[key] || localeMeta.player;
        const items = Array.isArray(tabs[key]) ? tabs[key] : [];

        return `
            <div class="mod-group reveal">
              <div class="mod-head"><span class="material-icons">${meta.icon}</span><span class="mod-head-name">${meta.title}</span><span class="mod-head-ct">${items.length}</span></div>
              <div class="mod-items">
                ${items.map((item) => `
                    <div class="mod-item"><span class="mod-item-name">${escapeHtml(item.name)}</span><span class="mod-badge ${item.enabled ? 'on' : 'off'}">${item.enabled ? localeMeta.badgeOn : localeMeta.badgeOff}</span></div>
                `).join('')}
              </div>
            </div>
        `;
    }).join('');
}

function updateCompare(elements, value) {
    const percentage = Math.max(0, Math.min(100, Number(value)));
    if (elements.compareAfterWrap) elements.compareAfterWrap.style.width = `${percentage}%`;
    if (elements.compareDivider) elements.compareDivider.style.left = `${percentage}%`;
    if (elements.compareHandle) elements.compareHandle.style.left = `${percentage}%`;
}

function initCompareSlider(elements) {
    if (!(elements.compareSlider instanceof HTMLInputElement)) return;

    elements.compareSlider.addEventListener('input', (event) => {
        if (!(event.target instanceof HTMLInputElement)) return;
        updateCompare(elements, event.target.value);
    });
    updateCompare(elements, elements.compareSlider.value);
}

function initCompareMedia(elements, compareCopy) {
    const items = [
        {
            frame: elements.compareBeforeFrame,
            image: elements.compareBeforeImage,
            state: elements.compareBeforeState,
            text: compareCopy.beforeEmpty,
        },
        {
            frame: elements.compareAfterFrame,
            image: elements.compareAfterImage,
            state: elements.compareAfterState,
            text: compareCopy.afterEmpty,
        },
    ];

    const updateState = () => {
        const readyCount = items.filter(({ image }) => image instanceof HTMLImageElement && image.dataset.loaded === 'true').length;
        if (elements.compareSlot) {
            elements.compareSlot.hidden = readyCount === items.length;
            elements.compareSlot.textContent = compareCopy.slotHint;
        }
    };

    items.forEach(({ frame, image, state, text }) => {
        if (!(frame instanceof HTMLElement) || !(image instanceof HTMLImageElement) || !(state instanceof HTMLElement)) return;

        state.textContent = text;

        const markLoaded = () => {
            image.dataset.loaded = 'true';
            frame.dataset.state = 'ready';
            image.hidden = false;
            state.hidden = true;
            updateState();
        };

        const markMissing = () => {
            image.dataset.loaded = 'false';
            frame.dataset.state = 'empty';
            image.hidden = true;
            state.hidden = false;
            updateState();
        };

        image.addEventListener('load', markLoaded, { once: true });
        image.addEventListener('error', markMissing, { once: true });

        if (image.complete && image.naturalWidth > 0) {
            markLoaded();
            return;
        }

        if (image.complete) {
            markMissing();
        }
    });

    updateState();
}

function applyRevealDelays() {
    document.querySelectorAll('.reveal').forEach((element, index) => {
        if (!(element instanceof HTMLElement)) return;
        element.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
    });
}

function boot() {
    const localeController = createLocaleController();
    const locale = localeController.locale;
    const siteData = localizeSiteData(getEffectiveSiteData(), locale);
    if (applyGlobalRouteRedirect(siteData)) return;

    const localeMeta = getLocaleMeta(locale);
    const shareMeta = getShareMeta(locale);
    const compareCopy = getCompareCopy(locale);
    const routeProduct = getRouteProduct(siteData.products);
    const tabs = routeProduct?.routeModules || {};
    const tabKeys = getTabKeys(localeMeta, tabs);
    const elements = getElements();

    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();
    initAdminRouteAccess({ adminHref: getAdminHref() });
    initSmoothRouteTransitions();

    initActionButtons(elements, routeProduct);
    initShareDock(elements, siteData, shareMeta);
    renderGwTabs(elements, tabKeys, localeMeta, (key) => buildGui(elements, tabs, localeMeta, key));
    if (tabKeys.length) {
        buildGui(elements, tabs, localeMeta, tabKeys[0]);
    }
    renderModuleList(elements, tabKeys, tabs, localeMeta);
    initCompareSlider(elements);
    initCompareMedia(elements, compareCopy);
    applyRevealDelays();
    initReveal([elements.modGridEl].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
