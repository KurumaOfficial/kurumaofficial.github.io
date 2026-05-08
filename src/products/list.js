/**
 * @fileoverview Static SPA — products catalog page (`/{locale}/products/`).
 *
 * Pure client-side filtering / sorting / rendering on top of the same
 * site-data the home page consumes. No backend, no fetch — just the
 * locally-imported site-data and any localStorage overrides.
 *
 * @module products/list
 */

import { createLocaleController } from '../i18n/controller.js';
import { initReveal } from '../components/reveal.js';
import {
    applyGlobalRouteRedirect,
    getAdminHref,
    getEffectiveSiteData,
    initAdminRouteAccess,
    initSkipLink,
    initSharedThemeToggle,
    initSmoothRouteTransitions,
} from '../core/site-shell.js?v=20260507c';
import { localizeSiteData } from '../data/localized-site-data.js';
import { normalizeData, toNumber, getFlagMeta, getProductLifecycleKey } from '../core/data-utils.js';
import { escapeHtml, linkify } from '../core/dom.js';

const STATUS_KEYS = ['active', 'frozen', 'abandoned'];
const FLAG_KEYS = ['alpha', 'beta', 'release'];

let booted = false;

function boot() {
    if (booted) return;
    booted = true;

    /* Defensive: if global redirect would fire here we still want this page
     * to render. The site-shell already excludes /products/ from immune
     * paths, but applying once is safe — it short-circuits when target ===
     * current path. */
    if (applyGlobalRouteRedirect()) return;

    const lc = createLocaleController();
    lc.applyDocumentMeta({
        title: lc.t('productsPage.metaTitle', 'Aleph Studio — Products'),
        description: lc.t('productsPage.metaDescription', ''),
    });
    lc.applyStaticCopy();
    lc.mountLanguageSwitcher();

    const data = localizeSiteData(normalizeData(getEffectiveSiteData()), lc.locale);
    const products = (data.products || []).slice();
    const collation = lc.locale === 'ua' ? 'uk' : lc.locale;

    /* DOM refs */
    const eyebrowEl = document.getElementById('plistEyebrow');
    const titleEl = document.getElementById('plistTitle');
    const descEl = document.getElementById('plistDesc');
    const backEl = document.getElementById('plistBack');
    const filterStatusLabelEl = document.getElementById('plistFilterStatusLabel');
    const filterFlagLabelEl = document.getElementById('plistFilterFlagLabel');
    const sortLabelEl = document.getElementById('plistSortLabel');
    const sortSelectEl = /** @type {HTMLSelectElement | null} */ (document.getElementById('plistSortSelect'));
    const statusGroupEl = document.getElementById('plistStatusGroup');
    const flagGroupEl = document.getElementById('plistFlagGroup');
    const countLabelEl = document.getElementById('plistCountLabel');
    const countValueEl = document.getElementById('plistCountValue');
    const gridEl = document.getElementById('plistGrid');
    const emptyEl = document.getElementById('plistEmpty');
    const emptyTextEl = document.getElementById('plistEmptyText');
    const emptyResetEl = document.getElementById('plistEmptyReset');

    /* Static copy */
    if (eyebrowEl) eyebrowEl.textContent = lc.t('productsPage.heroEyebrow', 'Catalog');
    if (titleEl) titleEl.textContent = lc.t('productsPage.heroTitle', 'All products');
    if (descEl) descEl.textContent = lc.t('productsPage.heroDesc', '');
    if (backEl) backEl.textContent = lc.t('productsPage.backToHome', 'Back');
    if (filterStatusLabelEl) filterStatusLabelEl.textContent = lc.t('productsPage.filterStatus', 'Status');
    if (filterFlagLabelEl) filterFlagLabelEl.textContent = lc.t('productsPage.filterFlag', 'Label');
    if (sortLabelEl) sortLabelEl.textContent = lc.t('productsPage.sortLabel', 'Sort');
    if (countLabelEl) countLabelEl.textContent = lc.t('productsPage.countLabel', 'Found');
    if (emptyTextEl) emptyTextEl.textContent = lc.t('productsPage.empty', 'No products match the filters.');
    if (emptyResetEl) emptyResetEl.textContent = lc.t('productsPage.emptyAction', 'Reset');

    /* Filter chip buttons (status + flag) */
    function makeChipGroup(host, key, options) {
        if (!(host instanceof HTMLElement)) return;
        host.replaceChildren();
        const all = document.createElement('button');
        all.type = 'button';
        all.className = 'plist-chip is-active';
        all.dataset.value = '';
        all.textContent = lc.t('productsPage.filterAll', 'All');
        host.appendChild(all);
        for (const value of options) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'plist-chip';
            btn.dataset.value = value;
            btn.textContent = lc.t(`products.${key}.${value}`, value);
            host.appendChild(btn);
        }
    }
    makeChipGroup(statusGroupEl, 'lifecycle', STATUS_KEYS);
    makeChipGroup(flagGroupEl, 'flags', FLAG_KEYS);

    /* Sort select options */
    if (sortSelectEl) {
        sortSelectEl.replaceChildren();
        const options = [
            ['default', lc.t('productsPage.sortDefault', 'Default')],
            ['alpha-asc', lc.t('productsPage.sortAlpha', 'A→Z')],
            ['alpha-desc', lc.t('productsPage.sortAlphaDesc', 'Z→A')],
            ['version-desc', lc.t('productsPage.sortNewest', 'Newest first')],
            ['version-asc', lc.t('productsPage.sortOldest', 'Oldest first')],
        ];
        for (const [val, label] of options) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = label;
            sortSelectEl.appendChild(opt);
        }
    }

    /* Filtering / sorting state */
    const state = {
        status: '',
        flag: '',
        sort: 'default',
    };

    function semverParts(v) {
        return String(v || '').split('.').map((s) => Number.parseInt(s, 10) || 0);
    }
    function compareVersion(a, b) {
        const aa = semverParts(a);
        const bb = semverParts(b);
        const len = Math.max(aa.length, bb.length);
        for (let i = 0; i < len; i++) {
            const diff = (aa[i] || 0) - (bb[i] || 0);
            if (diff !== 0) return diff;
        }
        return 0;
    }

    function compute() {
        let list = products.slice();
        if (state.status) list = list.filter((p) => (p.status || p.tag) === state.status);
        if (state.flag) list = list.filter((p) => p.flag === state.flag);
        if (state.sort === 'default') {
            list.sort((a, b) => {
                const diff = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
                return diff !== 0 ? diff : a.title.localeCompare(b.title, collation);
            });
        } else if (state.sort === 'alpha-asc') {
            list.sort((a, b) => a.title.localeCompare(b.title, collation));
        } else if (state.sort === 'alpha-desc') {
            list.sort((a, b) => b.title.localeCompare(a.title, collation));
        } else if (state.sort === 'version-desc') {
            list.sort((a, b) => compareVersion(b.version, a.version));
        } else if (state.sort === 'version-asc') {
            list.sort((a, b) => compareVersion(a.version, b.version));
        }
        return list;
    }

    function lifecycleLabel(value) {
        const key = getProductLifecycleKey(value);
        if (!key) return String(value || '').trim();
        return lc.t(`products.lifecycle.${key}`, key);
    }

    function flagBadgeHtml(flag) {
        const meta = getFlagMeta(flag);
        if (!meta) return '';
        const label = lc.t(`products.flags.${flag}`, meta.label);
        return `<span class="product-flag ${meta.className}">${escapeHtml(label)}</span>`;
    }

    function ctaForProduct(product) {
        if (product.detailUrl) {
            const href = product.detailUrl.replace(/^\.?\//, './');
            return `<a class="plist-cta" href="${escapeHtml(href)}" data-detail-nav>${escapeHtml(lc.t('productsPage.cardOpen', 'Open'))}</a>`;
        }
        if (product.downloadUrl) {
            const href = lc.resolveSitePath(product.downloadUrl);
            const isLocal = href && !/^(?:https?:)?\/\//i.test(href);
            return `<a class="plist-cta" href="${escapeHtml(href)}"${isLocal ? ' download' : ''}>${escapeHtml(lc.t('productsPage.cardDownload', 'Download'))}</a>`;
        }
        return `<button class="plist-cta is-disabled" type="button" disabled>${escapeHtml(lc.t('productsPage.cardSoon', 'Soon'))}</button>`;
    }

    function render() {
        if (!gridEl) return;
        const list = compute();

        if (countValueEl) countValueEl.textContent = String(list.length);

        if (!list.length) {
            gridEl.replaceChildren();
            if (emptyEl) emptyEl.hidden = false;
            return;
        }

        if (emptyEl) emptyEl.hidden = true;

        gridEl.innerHTML = list.map((product) => {
            const dotClass = (product.downloadUrl || product.detailUrl) ? 'status-dot' : 'status-dot inactive';
            const badge = flagBadgeHtml(product.flag);
            const summary = product.summary
                ? `<p class="plist-card-desc">${linkify(product.summary)}</p>`
                : '';
            return `
<article class="plist-card" id="plist-${escapeHtml(product.id)}">
  <div class="plist-card-status">
    <span class="${dotClass}"></span>
    <span>${escapeHtml(lifecycleLabel(product.status || product.tag))}</span>
    ${badge}
  </div>
  <h3 class="plist-card-title">${escapeHtml(product.title)}</h3>
  <p class="plist-card-version">v${escapeHtml(product.version)}</p>
  ${summary}
  <div class="plist-card-foot">
    <span class="product-tag">${escapeHtml(lifecycleLabel(product.tag))}</span>
    ${ctaForProduct(product)}
  </div>
</article>`;
        }).join('');
    }

    /* Wire chip groups */
    function wireChips(host, key) {
        if (!(host instanceof HTMLElement)) return;
        host.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target.closest('.plist-chip') : null;
            if (!(target instanceof HTMLButtonElement) || !host.contains(target)) return;
            const value = target.dataset.value || '';
            state[key] = value;
            host.querySelectorAll('.plist-chip').forEach((btn) => {
                btn.classList.toggle('is-active', btn === target);
            });
            render();
        });
    }
    wireChips(statusGroupEl, 'status');
    wireChips(flagGroupEl, 'flag');

    if (sortSelectEl) {
        sortSelectEl.addEventListener('change', () => {
            state.sort = sortSelectEl.value || 'default';
            render();
        });
    }

    if (emptyResetEl) {
        emptyResetEl.addEventListener('click', () => {
            state.status = '';
            state.flag = '';
            state.sort = 'default';
            if (sortSelectEl) sortSelectEl.value = 'default';
            for (const host of [statusGroupEl, flagGroupEl]) {
                if (!(host instanceof HTMLElement)) continue;
                host.querySelectorAll('.plist-chip').forEach((btn) => {
                    btn.classList.toggle('is-active', !btn.dataset.value);
                });
            }
            render();
        });
    }

    /* First paint */
    render();

    /* Shared globals */
    initReveal([document.getElementById('main')].filter(Boolean));
    initSkipLink();
    initSharedThemeToggle();
    initSmoothRouteTransitions();
    initAdminRouteAccess({ adminHref: getAdminHref() });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
