import { initReveal } from '../components/reveal.js';
import { createLocaleController } from '../i18n/controller.js';
import { escapeHtml } from '../core/dom.js';
import { localizeSiteData } from '../data/localized-site-data.js';
import {
  applyGlobalRouteRedirect,
  getAdminHref,
  getEffectiveSiteData,
  initAdminRouteAccess,
  initSharedThemeToggle,
  initSmoothRouteTransitions,
  navigateWithRouteTransition,
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
    hint: 'Наглядная разница игры с нашим модом и без него. Также на изображениях не применялась дополнительная обработка, которую используют некоторые.',
  },
  en: {
    hint: 'A clear look at the game with our mod and without it. The images also do not use the extra processing that some others rely on.',
  },
  ua: {
    hint: 'Наочна різниця гри з нашим модом і без нього. Також на зображеннях не застосовувалась додаткова обробка, яку використовують деякі інші.',
  },
});

const GUI_PREVIEW_COPY = Object.freeze({
  ru: {
    free: 'БЕСПЛАТНО',
    languageLabel: 'Язык GUI',
  },
  en: {
    free: 'FREE',
    languageLabel: 'GUI language',
  },
  ua: {
    free: 'БЕЗКОШТОВНО',
    languageLabel: 'Мова GUI',
  },
});

const GUI_PREVIEW_LANGUAGE_OPTIONS = Object.freeze({
  ru: Object.freeze(['ru', 'en']),
  en: Object.freeze(['en', 'ru']),
  ua: Object.freeze(['ua', 'en']),
});

const GUI_PREVIEW_LANGUAGE_LABELS = Object.freeze({
  ru: Object.freeze({ ru: 'Русский', en: 'English', ua: 'Українська' }),
  en: Object.freeze({ ru: 'Russian', en: 'English', ua: 'Ukrainian' }),
  ua: Object.freeze({ ru: 'Російська', en: 'English', ua: 'Українська' }),
});

const GUI_PREVIEW_THEMES = Object.freeze([
  Object.freeze({ key: 'white', labels: Object.freeze({ ru: 'Белая', en: 'White', ua: 'Біла' }) }),
  Object.freeze({ key: 'black', labels: Object.freeze({ ru: 'Черная', en: 'Black', ua: 'Чорна' }) }),
  Object.freeze({ key: 'frost-white', labels: Object.freeze({ ru: 'Прозрачная белая', en: 'Transparent White', ua: 'Прозора біла' }) }),
  Object.freeze({ key: 'frost-black', labels: Object.freeze({ ru: 'Прозрачная черная', en: 'Transparent Black', ua: 'Прозора чорна' }) }),
  Object.freeze({ key: 'pink', labels: Object.freeze({ ru: 'Розовая', en: 'Pink', ua: 'Рожева' }) }),
  Object.freeze({ key: 'violet', labels: Object.freeze({ ru: 'Фиолетовая', en: 'Violet', ua: 'Фіолетова' }) }),
]);

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
    heroProductVersion: document.getElementById('heroProductVersion'),
    gwTabsEl: document.getElementById('gwTabs'),
    gwSecEl: document.getElementById('gwSec'),
    gwBodyEl: document.getElementById('gwBody'),
    gwItemsEl: document.getElementById('gwItems'),
    modGridEl: document.getElementById('modGrid'),
    compareSlider: document.getElementById('compareSlider'),
    compareAfterWrap: document.getElementById('compareAfterWrap'),
    compareDivider: document.getElementById('compareDivider'),
    compareHandle: document.getElementById('compareHandle'),
    compareBeforeImage: document.getElementById('compareBeforeImage'),
    compareAfterImage: document.getElementById('compareAfterImage'),
    compareSlot: document.getElementById('compareSlot'),
    supportDiscordLink: document.getElementById('supportDiscordLink'),
    donateLinks: [...document.querySelectorAll('[data-donate-link]')],
    guiWidgetEl: document.querySelector('.gui-w'),
    gwTitleEl: document.querySelector('.gw-title'),
    gwSubEl: document.querySelector('.gw-sub'),
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

function getGuiPreviewCopy(locale) {
  return GUI_PREVIEW_COPY[locale] || GUI_PREVIEW_COPY.ru;
}

function getGuiPreviewLanguageOptions(locale) {
  return GUI_PREVIEW_LANGUAGE_OPTIONS[locale] || GUI_PREVIEW_LANGUAGE_OPTIONS.ru;
}

function getGuiPreviewLanguageLabels(locale) {
  return GUI_PREVIEW_LANGUAGE_LABELS[locale] || GUI_PREVIEW_LANGUAGE_LABELS.ru;
}

function getGuiPreviewThemeLabel(locale, themeKey) {
  const theme = GUI_PREVIEW_THEMES.find((item) => item.key === themeKey);
  return theme?.labels?.[locale] || theme?.labels?.ru || themeKey;
}

function syncGuiPreviewThemeCards(elements, themeKey) {
  if (!(elements.gwItemsEl instanceof HTMLElement)) return;

  elements.gwItemsEl.querySelectorAll('[data-gui-theme]').forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    const isActive = (button.dataset.guiTheme || '') === themeKey;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function setGuiPreviewTheme(elements, themeKey) {
  if (elements.guiWidgetEl instanceof HTMLElement) {
    elements.guiWidgetEl.removeAttribute('data-gui-preview-theme');
  }
  syncGuiPreviewThemeCards(elements, themeKey);
}

function buildGuiPreviewContext(siteData, locale) {
  const localizedSiteData = localizeSiteData(siteData, locale);
  const routeProduct = getRouteProduct(localizedSiteData.products);
  const localeMeta = getLocaleMeta(locale);
  const tabs = routeProduct?.routeModules || {};

  return {
    locale,
    localeMeta,
    tabs,
    tabKeys: getTabKeys(localeMeta, tabs),
    copy: getGuiPreviewCopy(locale),
  };
}

function resolveRouteAsset(path) {
  const value = String(path || '').trim();
  if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
  const cleaned = value.replace(/^\.\//, '').replace(/^\/+/, '');
  return new URL(`../../../${cleaned}`, window.location.href).toString();
}

function getDonateHref() {
  return new URL('../../donate/', window.location.href).toString();
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
  if (!elements.supportDiscordLink) return;

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

function initShareDock(elements, siteData, shareMeta) {
  if (!elements.shareDock || !elements.shareBtn) return;

  const shareLinks = [
    { key: 'telegram', el: elements.shareTelegramBtn },
    { key: 'discord', el: elements.shareDiscordBtn },
    { key: 'youtube', el: elements.shareYoutubeBtn },
  ];

  let visibleCount = 0;

  shareLinks.forEach(({ key, el }) => {
    if (!el) return;

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

function bindRouteProductMeta(elements, routeProduct) {
  if (elements.heroProductVersion && routeProduct?.version) {
    elements.heroProductVersion.textContent = routeProduct.version;
  }
}

function syncDonateLinks(elements) {
  const donateHref = getDonateHref();

  elements.donateLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    link.href = donateHref;
  });
}

function startDownloadThenRedirect(downloadHref, redirectHref) {
  if (!downloadHref) {
    navigateWithRouteTransition(redirectHref);
    return;
  }

  const tempLink = document.createElement('a');
  tempLink.href = downloadHref;
  tempLink.setAttribute('download', '');
  tempLink.hidden = true;
  document.body.appendChild(tempLink);
  tempLink.click();

  window.requestAnimationFrame(() => {
    window.setTimeout(() => {
      tempLink.remove();
      navigateWithRouteTransition(redirectHref);
    }, 320);
  });
}

function initActionButtons(elements, routeProduct) {
  const donateHref = getDonateHref();
  syncDonateLinks(elements);

  if (elements.installBtn) {
    if (routeProduct?.downloadUrl) {
      const downloadHref = resolveRouteAsset(routeProduct.downloadUrl);
      elements.installBtn.href = downloadHref;
      elements.installBtn.setAttribute('download', '');
      elements.installBtn.addEventListener('click', (event) => {
        event.preventDefault();
        startDownloadThenRedirect(downloadHref, donateHref);
      });
    } else {
      elements.installBtn.href = donateHref;
      elements.installBtn.removeAttribute('download');
    }
  }

  if (!elements.sourceBtn) return;

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

function buildGuiList(elements, tabs, localeMeta, key) {
  if (!elements.gwBodyEl || !elements.gwSecEl || !elements.gwItemsEl) return;

  const meta = localeMeta[key] || localeMeta.player;
  const items = Array.isArray(tabs[key]) ? tabs[key] : [];
  const scrollEl = elements.gwBodyEl.querySelector('.gw-scroll');

  elements.gwBodyEl.style.transition = 'opacity .18s ease, transform .18s ease';
  elements.gwBodyEl.classList.replace('fin', 'fout');

  window.clearTimeout(guiBuildTimer);
  guiBuildTimer = window.setTimeout(() => {
    elements.gwSecEl.textContent = meta.title;
    elements.gwBodyEl.dataset.mode = 'list';
    elements.gwItemsEl.className = 'gw-items';
    elements.gwItemsEl.onclick = null;
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

    elements.gwBodyEl.style.transition = 'opacity .22s ease, transform .22s ease';
    elements.gwBodyEl.classList.replace('fout', 'fin');
  }, 170);
}

function buildGuiThemePanel(elements, previewContext, previewState, onThemeChange, onLocaleChange) {
  if (!elements.gwBodyEl || !elements.gwSecEl || !elements.gwItemsEl) return;

  const scrollEl = elements.gwBodyEl.querySelector('.gw-scroll');
  const languageLabels = getGuiPreviewLanguageLabels(previewContext.locale);

  elements.gwBodyEl.style.transition = 'opacity .18s ease, transform .18s ease';
  elements.gwBodyEl.classList.replace('fin', 'fout');

  window.clearTimeout(guiBuildTimer);
  guiBuildTimer = window.setTimeout(() => {
    elements.gwSecEl.textContent = previewContext.localeMeta.themes.title;
    elements.gwBodyEl.dataset.mode = 'themes';
    elements.gwItemsEl.className = 'gw-items gw-items--themes';
    elements.gwItemsEl.innerHTML = `
      <div class="gw-theme-panel">
        <div class="gw-theme-grid">
          ${GUI_PREVIEW_THEMES.map((theme) => `
            <button
              type="button"
              class="gw-theme-card ${previewState.themeKey === theme.key ? 'is-active' : ''}"
              data-gui-theme="${theme.key}"
              aria-pressed="${String(previewState.themeKey === theme.key)}"
            >
              <span class="gw-theme-preview" data-preview-theme="${theme.key}"></span>
              <span class="gw-theme-card-title">${escapeHtml(getGuiPreviewThemeLabel(previewContext.locale, theme.key))}</span>
            </button>
          `).join('')}
        </div>

        <div class="gw-locale-row">
          <span class="gw-locale-label">${escapeHtml(previewContext.copy.languageLabel)}</span>
          <div class="gw-locale-actions">
            ${previewState.languageOptions.map((locale) => `
              <button
                type="button"
                class="gw-locale-btn ${previewState.locale === locale ? 'is-active' : ''}"
                data-gui-locale="${locale}"
                aria-pressed="${String(previewState.locale === locale)}"
              >${escapeHtml(languageLabels[locale] || locale.toUpperCase())}</button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    elements.gwItemsEl.querySelectorAll('[data-gui-theme]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!(button instanceof HTMLButtonElement)) return;
        const nextThemeKey = button.dataset.guiTheme || previewState.themeKey;
        if (nextThemeKey === previewState.themeKey) return;
        onThemeChange(nextThemeKey);
      });
    });

    elements.gwItemsEl.querySelectorAll('[data-gui-locale]').forEach((button) => {
      button.addEventListener('click', () => {
        if (!(button instanceof HTMLButtonElement)) return;
        const nextLocale = button.dataset.guiLocale || previewState.locale;
        if (nextLocale === previewState.locale) return;
        onLocaleChange(nextLocale);
      });
    });

    if (scrollEl instanceof HTMLElement) {
      scrollEl.scrollTop = 0;
    }

    elements.gwBodyEl.style.transition = 'opacity .22s ease, transform .22s ease';
    elements.gwBodyEl.classList.replace('fout', 'fin');
  }, 170);
}

function renderGwTabs(elements, tabKeys, localeMeta, activeKey, onSelect) {
  if (!elements.gwTabsEl) return;

  if (!tabKeys.length) {
    elements.gwTabsEl.textContent = '';
    return;
  }

  elements.gwTabsEl.innerHTML = tabKeys.map((key, index) => `
    <button type="button" class="${key === activeKey || (!activeKey && index === 0) ? 'active' : ''}" data-tab="${key}">${localeMeta[key].title}</button>
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

function renderGuiPreview(elements, previewContexts, previewState) {
  const previewContext = previewContexts[previewState.locale] || previewContexts.ru;
  if (!previewContext) return;

  if (!previewContext.tabKeys.includes(previewState.tab)) {
    previewState.tab = previewContext.tabKeys[0] || 'themes';
  }

  if (elements.gwSubEl) {
    elements.gwSubEl.textContent = previewContext.copy.free;
  }

  setGuiPreviewTheme(elements, previewState.themeKey);

  renderGwTabs(elements, previewContext.tabKeys, previewContext.localeMeta, previewState.tab, (nextKey) => {
    previewState.tab = nextKey;
    renderGuiPreview(elements, previewContexts, previewState);
  });

  if (previewState.tab === 'themes') {
    buildGuiThemePanel(
      elements,
      previewContext,
      previewState,
      (nextThemeKey) => {
        previewState.themeKey = nextThemeKey;
        setGuiPreviewTheme(elements, previewState.themeKey);
      },
      (nextLocale) => {
        previewState.locale = nextLocale;
        renderGuiPreview(elements, previewContexts, previewState);
      },
    );
    return;
  }

  buildGuiList(elements, previewContext.tabs, previewContext.localeMeta, previewState.tab);
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
  if (elements.compareAfterWrap) elements.compareAfterWrap.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
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
    elements.compareBeforeImage,
    elements.compareAfterImage,
  ].filter((item) => item instanceof HTMLImageElement);
  const compareCard = elements.compareSlot instanceof HTMLElement
    ? elements.compareSlot.closest('.compare-card')
    : null;

  if (!items.length) return;

  const updateState = () => {
    const readyCount = items.filter((item) => item.dataset.loaded === 'true').length;
    const shouldShowHint = readyCount < items.length;
    compareCard?.classList.toggle('compare-card--empty', shouldShowHint);
    if (elements.compareSlot) {
      elements.compareSlot.hidden = !shouldShowHint;
      elements.compareSlot.textContent = compareCopy.hint;
    }
    if (elements.compareSlider instanceof HTMLInputElement) {
      elements.compareSlider.disabled = shouldShowHint;
    }
  };

  items.forEach((image) => {
    const markLoaded = () => {
      image.dataset.loaded = 'true';
      image.hidden = false;
      updateState();
    };

    const markMissing = () => {
      image.dataset.loaded = 'false';
      image.hidden = true;
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
}

function applyRevealDelays() {
  document.querySelectorAll('.reveal').forEach((element, index) => {
    if (!(element instanceof HTMLElement)) return;
    element.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
  });
}

function boot() {
  const localeController = createLocaleController();
  const rawSiteData = getEffectiveSiteData();
  const siteData = localizeSiteData(rawSiteData, localeController.locale);
  if (applyGlobalRouteRedirect(siteData)) return;

  const localeMeta = getLocaleMeta(localeController.locale);
  const shareMeta = getShareMeta(localeController.locale);
  const compareCopy = getCompareCopy(localeController.locale);
  const routeProduct = getRouteProduct(siteData.products);
  const tabs = routeProduct?.routeModules || {};
  const tabKeys = getTabKeys(localeMeta, tabs);
  const elements = getElements();
  const previewContexts = Object.freeze({
    ru: buildGuiPreviewContext(rawSiteData, 'ru'),
    en: buildGuiPreviewContext(rawSiteData, 'en'),
    ua: buildGuiPreviewContext(rawSiteData, 'ua'),
  });
  const previewState = {
    locale: getGuiPreviewLanguageOptions(localeController.locale)[0] || localeController.locale,
    languageOptions: getGuiPreviewLanguageOptions(localeController.locale),
    themeKey: 'black',
    tab: tabKeys[0] || 'player',
  };

  localeController.mountLanguageSwitcher();
  initSharedThemeToggle();
  initAdminRouteAccess({ adminHref: getAdminHref() });
  initSmoothRouteTransitions();

  bindRouteProductMeta(elements, routeProduct);
  initActionButtons(elements, routeProduct);
  initShareDock(elements, siteData, shareMeta);
  renderGuiPreview(elements, previewContexts, previewState);
  renderModuleList(elements, tabKeys, tabs, localeMeta);
  initCompareSlider(elements);
  initCompareMedia(elements, compareCopy);
  applyRevealDelays();
  initReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
