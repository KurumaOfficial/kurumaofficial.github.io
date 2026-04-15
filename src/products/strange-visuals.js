import { initReveal } from '../components/reveal.js';
import { createLocaleController } from '../i18n/controller.js';
import { resolveRouteRelativePath } from '../i18n/config.js';
import { escapeHtml } from '../core/dom.js';
import { getIconMarkup, setInlineIcon } from '../core/icons.js';
import { localizeSiteData } from '../data/localized-site-data.js';
import {
  applyGlobalRouteRedirect,
  getAdminHref,
  getEffectiveSiteData,
  initAdminRouteAccess,
  initSkipLink,
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

const ROUTE_COMPARE_ALT_COPY = Object.freeze({
  ru: Object.freeze({
    before: 'до применения мода',
    after: 'после применения мода',
  }),
  en: Object.freeze({
    before: 'before applying the mod',
    after: 'after applying the mod',
  }),
  ua: Object.freeze({
    before: 'до застосування мода',
    after: 'після застосування мода',
  }),
});

const GUI_PREVIEW_THEMES = Object.freeze([
  Object.freeze({ key: 'white', labels: Object.freeze({ ru: 'Белая', en: 'White', ua: 'Біла' }) }),
  Object.freeze({ key: 'black', labels: Object.freeze({ ru: 'Черная', en: 'Black', ua: 'Чорна' }) }),
  Object.freeze({ key: 'frost-white', labels: Object.freeze({ ru: 'Прозрачная белая', en: 'Transparent White', ua: 'Прозора біла' }) }),
  Object.freeze({ key: 'frost-black', labels: Object.freeze({ ru: 'Прозрачная черная', en: 'Transparent Black', ua: 'Прозора чорна' }) }),
  Object.freeze({ key: 'pink', labels: Object.freeze({ ru: 'Розовая', en: 'Pink', ua: 'Рожева' }) }),
  Object.freeze({ key: 'violet', labels: Object.freeze({ ru: 'Фиолетовая', en: 'Violet', ua: 'Фіолетова' }) }),
]);

function iconHtml(name, className = 'ui-icon') {
  const markup = getIconMarkup(name);
  if (!markup) return '';
  return `<span class="${className}" aria-hidden="true">${markup}</span>`;
}

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
    heroTitleEl: document.querySelector('.hero-app-name'),
    heroBackLabelEl: document.querySelector('.hero-store-back-label'),
    heroProductVersion: document.getElementById('heroProductVersion'),
    featureSummaryEl: document.querySelector('#features .s-desc'),
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

function syncRouteIcons(elements) {
  const sourceIcon = elements.sourceBtn?.querySelector('.ui-icon');
  if (sourceIcon instanceof HTMLElement) {
    setInlineIcon(sourceIcon, 'code_wide', { className: 'ui-icon' });
  }

  const shareIcon = elements.shareBtn?.querySelector('.hero-share-toggle-icon--share');
  if (shareIcon instanceof HTMLElement) {
    setInlineIcon(shareIcon, 'share', { className: 'hero-share-toggle-icon hero-share-toggle-icon--share ui-icon' });
  }

  document.querySelectorAll('.feat-card--open-source .feat-ico .ui-icon').forEach((icon) => {
    if (icon instanceof HTMLElement) {
      setInlineIcon(icon, 'code_wide', { className: 'ui-icon' });
    }
  });
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

function getRouteCompareAltCopy(locale) {
  return ROUTE_COMPARE_ALT_COPY[locale] || ROUTE_COMPARE_ALT_COPY.ru;
}

function getGuiPreviewThemeLabel(locale, themeKey) {
  const theme = GUI_PREVIEW_THEMES.find((item) => item.key === themeKey);
  return theme?.labels?.[locale] || theme?.labels?.ru || themeKey;
}

function replaceLeadingSegment(source, nextLeadingSegment) {
  const sourceText = String(source || '').trim();
  const nextText = String(nextLeadingSegment || '').trim();
  if (!nextText) return sourceText;

  const match = sourceText.match(/\s+[—-]\s+/);
  if (!match || typeof match.index !== 'number') {
    return nextText;
  }

  const separator = match[0];
  const suffix = sourceText.slice(match.index + separator.length).trim();
  return suffix ? `${nextText}${separator}${suffix}` : nextText;
}

function buildRouteDocumentMeta(routeProduct) {
  const currentTitle = document.title;
  const currentDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const nextTitle = String(routeProduct?.title || '').trim();
  const nextDescription = String(routeProduct?.summary || '').trim();

  return {
    title: nextTitle ? replaceLeadingSegment(currentTitle, nextTitle) : currentTitle,
    description: nextDescription || currentDescription,
  };
}

function renderProductName(target, title) {
  if (!(target instanceof HTMLElement)) return;

  const nextTitle = String(title || '').trim();
  if (!nextTitle) return;

  const segments = nextTitle.split(/\s+/).filter(Boolean);
  target.textContent = '';

  if (segments.length < 2) {
    target.textContent = nextTitle;
    return;
  }

  const lastSegment = segments.pop();
  target.append(document.createTextNode(`${segments.join(' ')} `));

  const accent = document.createElement('em');
  accent.textContent = lastSegment || '';
  target.append(accent);
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
    elements.guiWidgetEl.setAttribute('data-gui-preview-theme', themeKey || 'black');
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
  if (!value) return value;

  const resolved = resolveRouteRelativePath(value, window.location.pathname);
  if (!resolved) return '';
  if (resolved.startsWith('#')) return resolved;

  return new URL(resolved, window.location.href).toString();
}

function getDonateHref() {
  return new URL('donate/', window.location.href).toString();
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

  if (elements.shareMenu instanceof HTMLElement) {
    elements.shareMenu.setAttribute('aria-hidden', String(!isOpen));
  }

  [elements.shareTelegramBtn, elements.shareDiscordBtn, elements.shareYoutubeBtn].forEach((link) => {
    if (!(link instanceof HTMLAnchorElement) || link.hidden) return;
    link.tabIndex = isOpen ? 0 : -1;
    link.setAttribute('aria-hidden', String(!isOpen));
  });

  if (!isOpen && elements.shareMenu instanceof HTMLElement && elements.shareMenu.contains(document.activeElement)) {
    elements.shareBtn.focus();
  }
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
      el.tabIndex = -1;
      el.setAttribute('aria-hidden', 'true');
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

function bindRouteProductMeta(elements, routeProduct, locale) {
  const nextTitle = String(routeProduct?.title || '').trim();
  const nextSummary = String(routeProduct?.summary || '').trim();

  if (nextTitle) {
    renderProductName(elements.heroTitleEl, nextTitle);
    if (elements.gwTitleEl instanceof HTMLElement) {
      elements.gwTitleEl.textContent = nextTitle;
    }
  }

  if (elements.heroProductVersion && routeProduct?.version) {
    elements.heroProductVersion.textContent = routeProduct.version;
  }

  if (nextSummary && elements.featureSummaryEl instanceof HTMLElement) {
    elements.featureSummaryEl.textContent = nextSummary;
  }

  const altCopy = getRouteCompareAltCopy(locale);
  if (nextTitle && elements.compareBeforeImage instanceof HTMLImageElement) {
    elements.compareBeforeImage.alt = `${nextTitle} ${altCopy.before}`;
  }
  if (nextTitle && elements.compareAfterImage instanceof HTMLImageElement) {
    elements.compareAfterImage.alt = `${nextTitle} ${altCopy.after}`;
  }
}

function syncDonateLinks(elements) {
  const donateHref = getDonateHref();

  elements.donateLinks.forEach((link) => {
    if (!(link instanceof HTMLAnchorElement)) return;
    link.href = donateHref;
  });
}

function startDownloadThenRedirect(downloadHref, redirectHref, downloadName = '') {
  if (!downloadHref) {
    navigateWithRouteTransition(redirectHref);
    return;
  }

  const tempLink = document.createElement('a');
  tempLink.href = downloadHref;
  tempLink.setAttribute('download', String(downloadName || ''));
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
      if (downloadHref) {
        elements.installBtn.href = downloadHref;
        elements.installBtn.setAttribute('download', routeProduct.downloadName || '');
        elements.installBtn.addEventListener('click', (event) => {
          event.preventDefault();
          startDownloadThenRedirect(downloadHref, donateHref, routeProduct.downloadName || '');
        });
      } else {
        elements.installBtn.href = donateHref;
        elements.installBtn.removeAttribute('download');
      }
    } else {
      elements.installBtn.href = donateHref;
      elements.installBtn.removeAttribute('download');
    }
  }

  if (!elements.sourceBtn) return;

  const sourceUrl = resolveRouteAsset(routeProduct?.sourceUrl || elements.sourceBtn.getAttribute('href') || '');
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

function bindGuiInteractions(elements, previewContexts, previewState) {
  if (!(elements.gwItemsEl instanceof HTMLElement) || elements.gwItemsEl.dataset.gwInteractionsBound === '1') return;
  elements.gwItemsEl.dataset.gwInteractionsBound = '1';

  elements.gwItemsEl.addEventListener('click', (event) => {
    const target = event.target instanceof Element
      ? event.target.closest('[data-gw-toggle], [data-gui-locale], [data-gui-theme]')
      : null;
    if (!(target instanceof HTMLElement) || !elements.gwItemsEl.contains(target)) return;

    if (target.hasAttribute('data-gw-toggle')) {
      const previewContext = previewContexts[previewState.locale] || previewContexts.ru;
      toggleGwItem(target, previewContext.localeMeta);
      return;
    }

    const nextThemeKey = target.dataset.guiTheme;
    if (nextThemeKey && nextThemeKey !== previewState.themeKey) {
      previewState.themeKey = nextThemeKey;
      setGuiPreviewTheme(elements, nextThemeKey);
      return;
    }

    const nextLocale = target.dataset.guiLocale;
    if (!nextLocale || nextLocale === previewState.locale) return;
    previewState.locale = nextLocale;
    renderGuiPreview(elements, previewContexts, previewState);
  });
}

function bindGuiTabs(elements, previewContexts, previewState) {
  if (!(elements.gwTabsEl instanceof HTMLElement) || elements.gwTabsEl.dataset.gwTabsBound === '1') return;
  elements.gwTabsEl.dataset.gwTabsBound = '1';

  const activateTab = (nextKey) => {
    if (!nextKey || nextKey === previewState.tab) return;
    previewState.tab = nextKey;
    renderGuiPreview(elements, previewContexts, previewState);
    const activeBtn = elements.gwTabsEl.querySelector(`[data-tab="${nextKey}"]`);
    if (activeBtn instanceof HTMLElement) activeBtn.focus();
  };

  elements.gwTabsEl.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-tab]') : null;
    if (!(target instanceof HTMLElement) || !elements.gwTabsEl.contains(target)) return;
    activateTab(target.dataset.tab || previewState.tab);
  });

  elements.gwTabsEl.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'Home' && event.key !== 'End') return;
    const tabs = Array.from(elements.gwTabsEl.querySelectorAll('[data-tab]'));
    if (!tabs.length) return;
    event.preventDefault();
    const current = tabs.findIndex((btn) => btn.dataset.tab === previewState.tab);
    let next;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else next = tabs.length - 1;
    activateTab(tabs[next]?.dataset.tab);
  });
}

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
    elements.gwItemsEl.textContent = '';

    items.forEach((item) => {
      const itemEl = document.createElement('button');
      itemEl.type = 'button';
      itemEl.className = 'gw-item';
      itemEl.dataset.gwToggle = 'true';
      itemEl.setAttribute('aria-pressed', String(Boolean(item.enabled)));
      itemEl.innerHTML = `
        <div class="gw-av">${iconHtml(meta.icon, 'ui-icon')}</div>
        <div class="gw-info">
          <div class="gw-name">${escapeHtml(item.name)}</div>
          <div class="gw-status ${item.enabled ? 'on' : 'off'}">${item.enabled ? localeMeta.enabled : localeMeta.disabled}</div>
        </div>
        <div class="gw-dots">${iconHtml('more_vert', 'ui-icon')}</div>
      `;
      elements.gwItemsEl.appendChild(itemEl);
    });

    if (scrollEl instanceof HTMLElement) {
      scrollEl.scrollTop = 0;
    }

    elements.gwBodyEl.style.transition = 'opacity .22s ease, transform .22s ease';
    elements.gwBodyEl.classList.replace('fout', 'fin');
  }, 170);
}

function buildGuiThemePanel(elements, previewContext, previewState) {
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

    if (scrollEl instanceof HTMLElement) {
      scrollEl.scrollTop = 0;
    }

    elements.gwBodyEl.style.transition = 'opacity .22s ease, transform .22s ease';
    elements.gwBodyEl.classList.replace('fout', 'fin');
  }, 170);
}

function renderGwTabs(elements, tabKeys, localeMeta, activeKey) {
  if (!elements.gwTabsEl) return;

  if (!tabKeys.length) {
    elements.gwTabsEl.textContent = '';
    return;
  }

  elements.gwTabsEl.setAttribute('role', 'tablist');
  elements.gwTabsEl.innerHTML = tabKeys.map((key, index) => {
    const isActive = key === activeKey || (!activeKey && index === 0);
    return `<button type="button" role="tab" aria-selected="${isActive}" class="${isActive ? 'active' : ''}" data-tab="${key}">${localeMeta[key].title}</button>`;
  }).join('');
}

function renderGuiPreview(elements, previewContexts, previewState) {
  const previewContext = previewContexts[previewState.locale] || previewContexts.ru;
  if (!previewContext) return;

  previewState.languageOptions = getGuiPreviewLanguageOptions(previewState.locale);

  if (!previewContext.tabKeys.includes(previewState.tab)) {
    previewState.tab = previewContext.tabKeys[0] || 'themes';
  }

  if (elements.gwSubEl) {
    elements.gwSubEl.textContent = previewContext.copy.free;
  }

  setGuiPreviewTheme(elements, previewState.themeKey);

  renderGwTabs(elements, previewContext.tabKeys, previewContext.localeMeta, previewState.tab);

  if (previewState.tab === 'themes') {
    buildGuiThemePanel(elements, previewContext, previewState);
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
        <div class="mod-head">${iconHtml(meta.icon, 'ui-icon')}<span class="mod-head-name">${meta.title}</span><span class="mod-head-ct">${items.length}</span></div>
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

let booted = false;

function boot() {
  if (booted) return;
  booted = true;

  const localeController = createLocaleController();
  const rawSiteData = getEffectiveSiteData();
  const siteData = localizeSiteData(rawSiteData, localeController.locale);
  if (applyGlobalRouteRedirect(siteData)) return;
  const routeProduct = getRouteProduct(siteData.products);

  localeController.applyDocumentMeta(buildRouteDocumentMeta(routeProduct));

  const localeMeta = getLocaleMeta(localeController.locale);
  const shareMeta = getShareMeta(localeController.locale);
  const compareCopy = getCompareCopy(localeController.locale);
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
    themeKey: document.documentElement.getAttribute('data-theme') === 'light' ? 'white' : 'black',
    tab: tabKeys[0] || 'player',
  };

  syncRouteIcons(elements);
  localeController.mountLanguageSwitcher();
  initSharedThemeToggle();
  initAdminRouteAccess({ adminHref: getAdminHref() });
  initSkipLink();
  bindGuiInteractions(elements, previewContexts, previewState);
  bindGuiTabs(elements, previewContexts, previewState);

  bindRouteProductMeta(elements, routeProduct, localeController.locale);
  initActionButtons(elements, routeProduct);
  initShareDock(elements, siteData, shareMeta);
  renderGuiPreview(elements, previewContexts, previewState);

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'data-theme') {
        const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'white' : 'black';
        previewState.themeKey = nextTheme;
        setGuiPreviewTheme(elements, nextTheme);
        break;
      }
    }
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  renderModuleList(elements, tabKeys, tabs, localeMeta);
  initCompareSlider(elements);
  initCompareMedia(elements, compareCopy);
  applyRevealDelays();
  initReveal([document.getElementById('main')].filter(Boolean));
  document.documentElement.removeAttribute('data-booting');
  initSmoothRouteTransitions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
