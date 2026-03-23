import { createLocaleController } from '../i18n/controller.js';
import {
  applyGlobalRouteRedirect,
  getAdminHref,
  getEffectiveSiteData,
  initAdminRouteAccess,
  initSharedThemeToggle,
  initSmoothRouteTransitions,
} from '../core/site-shell.js';

const siteData = getEffectiveSiteData();

if (applyGlobalRouteRedirect(siteData)) {
  /* route redirect is already in progress */
}

const localeController = createLocaleController();
const shareBtn = document.getElementById('shareBtn');
const shareDock = document.getElementById('shareDock');
const shareMenu = document.getElementById('shareMenu');
const shareTelegramBtn = document.getElementById('shareTelegramBtn');
const shareDiscordBtn = document.getElementById('shareDiscordBtn');
const shareYoutubeBtn = document.getElementById('shareYoutubeBtn');
const installBtn = document.getElementById('installBtn');
const sourceBtn = document.getElementById('sourceBtn');
const gwTabsEl = document.getElementById('gwTabs');
const gwSecEl = document.getElementById('gwSec');
const gwBodyEl = document.getElementById('gwBody');
const gwItemsEl = document.getElementById('gwItems');
const modGridEl = document.getElementById('modGrid');

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

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getLocaleMeta() {
  return ROUTE_CATEGORY_META[localeController.locale] || ROUTE_CATEGORY_META.ru;
}

function getShareMeta() {
  return ROUTE_SHARE_META[localeController.locale] || ROUTE_SHARE_META.ru;
}

function resolveRouteAsset(path) {
  const value = String(path || '').trim();
  if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
  const cleaned = value.replace(/^\.\//, '').replace(/^\/+/, '');
  return new URL(`../../../${cleaned}`, window.location.href).toString();
}

function getRouteProduct() {
  const match = window.location.pathname.match(/\/products\/([^/]+)\/?/i);
  const slug = match?.[1] || 'strange-visuals';
  return siteData.products.find((product) => product.id === slug)
    || siteData.products.find((product) => String(product.detailUrl || '').includes(`/products/${slug}/`) || String(product.detailUrl || '').includes(`products/${slug}/`))
    || siteData.products[0];
}

const routeProduct = getRouteProduct();
const localeMeta = getLocaleMeta();
const shareMeta = getShareMeta();
const tabs = routeProduct?.routeModules || {};
const tabKeys = ['player', 'world', 'utils', 'other', 'interface', 'themes'].filter((key) => localeMeta[key]);

localeController.mountLanguageSwitcher();
initSharedThemeToggle();
initAdminRouteAccess({ adminHref: getAdminHref() });
initSmoothRouteTransitions();

if (installBtn && routeProduct?.downloadUrl) {
  installBtn.href = resolveRouteAsset(routeProduct.downloadUrl);
}

if (sourceBtn) {
  const sourceUrl = routeProduct?.sourceUrl || sourceBtn.getAttribute('href') || '';
  if (sourceUrl) {
    sourceBtn.href = sourceUrl;
  } else {
    sourceBtn.hidden = true;
  }
}

function initShareDock() {
  if (!shareDock || !shareBtn) return;

  const socials = siteData.socials || {};
  const shareLinks = [
    { key: 'telegram', el: shareTelegramBtn },
    { key: 'discord', el: shareDiscordBtn },
    { key: 'youtube', el: shareYoutubeBtn },
  ];

  let visibleCount = 0;

  shareLinks.forEach(({ key, el }) => {
    if (!el) return;

    const href = resolveRouteAsset(socials[key] || el.getAttribute('href') || '');
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
    el.addEventListener('click', () => setShareDockOpen(false));
  });

  if (!visibleCount) {
    shareDock.hidden = true;
    return;
  }

  if (shareMenu) {
    shareMenu.setAttribute('aria-label', shareMeta.menuLabel);
  }

  shareDock.style.setProperty('--share-count', String(visibleCount));
  setShareDockOpen(false);

  shareBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setShareDockOpen(!shareDock.classList.contains('open'));
  });

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Node) || shareDock.contains(event.target)) return;
    setShareDockOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setShareDockOpen(false);
  });
}

function setShareDockOpen(isOpen) {
  if (!shareDock || !shareBtn) return;
  shareDock.classList.toggle('open', isOpen);
  shareBtn.setAttribute('aria-expanded', String(isOpen));
  shareBtn.setAttribute('aria-label', isOpen ? shareMeta.closeLabel : shareMeta.openLabel);
}

initShareDock();

function renderGwTabs() {
  if (!gwTabsEl) return;
  gwTabsEl.innerHTML = tabKeys.map((key, index) => `
    <span class="${index === 0 ? 'active' : ''}" data-tab="${key}">${localeMeta[key].title}</span>
  `).join('');

  gwTabsEl.querySelectorAll('span').forEach((tab) => {
    tab.addEventListener('click', function () {
      gwTabsEl.querySelectorAll('span').forEach((item) => item.classList.remove('active'));
      this.classList.add('active');
      buildGui(this.dataset.tab || tabKeys[0]);
    });
  });
}

function buildGui(key) {
  const meta = localeMeta[key] || localeMeta.player;
  const items = Array.isArray(tabs[key]) ? tabs[key] : [];
  if (!gwBodyEl || !gwSecEl || !gwItemsEl) return;

  const scrollEl = gwBodyEl.querySelector('.gw-scroll');
  gwBodyEl.style.transition = 'opacity .18s ease, transform .18s ease';
  gwBodyEl.classList.replace('fin', 'fout');

  window.setTimeout(() => {
    gwSecEl.textContent = meta.title;
    gwItemsEl.innerHTML = '';
    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'gw-item';
      el.onclick = () => toggleGw(el);
      el.innerHTML = `
        <div class="gw-av"><span class="material-icons">${meta.icon}</span></div>
        <div class="gw-info">
          <div class="gw-name">${escapeHtml(item.name)}</div>
          <div class="gw-status ${item.enabled ? 'on' : 'off'}">${item.enabled ? localeMeta.enabled : localeMeta.disabled}</div>
        </div>
        <div class="gw-dots"><span class="material-icons">more_vert</span></div>
      `;
      gwItemsEl.appendChild(el);
    });

    if (scrollEl) scrollEl.scrollTop = 0;
    gwBodyEl.style.transition = 'opacity .22s ease, transform .22s ease';
    gwBodyEl.classList.replace('fout', 'fin');
  }, 170);
}

function toggleGw(el) {
  const statusEl = el.querySelector('.gw-status');
  if (!statusEl) return;
  el.style.transform = 'scale(.97)';
  window.setTimeout(() => { el.style.transform = ''; }, 110);
  if (statusEl.classList.contains('on')) {
    statusEl.classList.replace('on', 'off');
    statusEl.textContent = localeMeta.disabled;
  } else {
    statusEl.classList.replace('off', 'on');
    statusEl.textContent = localeMeta.enabled;
  }
}

function renderModuleList() {
  if (!modGridEl) return;
  modGridEl.innerHTML = tabKeys.map((key) => {
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

renderGwTabs();
buildGui(tabKeys[0] || 'player');
renderModuleList();

const compareSlider = document.getElementById('compareSlider');
const compareAfterWrap = document.getElementById('compareAfterWrap');
const compareDivider = document.getElementById('compareDivider');
const compareHandle = document.getElementById('compareHandle');

function updateCompare(value) {
  const v = Math.max(0, Math.min(100, Number(value)));
  if (compareAfterWrap) compareAfterWrap.style.width = `${v}%`;
  if (compareDivider) compareDivider.style.left = `${v}%`;
  if (compareHandle) compareHandle.style.left = `${v}%`;
}

if (compareSlider) {
  compareSlider.addEventListener('input', (e) => updateCompare(e.target.value));
  updateCompare(compareSlider.value);
}

const obs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    window.setTimeout(() => entry.target.classList.add('on'), parseInt(entry.target.dataset.d || '0', 10) || 0);
    obs.unobserve(entry.target);
  });
}, { threshold: .08, rootMargin: '0px 0px -28px 0px' });

document.querySelectorAll('.reveal').forEach((el, index) => {
  el.dataset.d = String((index % 4) * 90);
  obs.observe(el);
});
