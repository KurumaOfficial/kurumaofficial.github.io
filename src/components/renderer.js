/**
 * @fileoverview Main site renderer — products, team, social links.
 * Replaces the monolithic `public-site.js` with a cleaner separation:
 * - each `render*` function owns a single DOM region
 * - all user-data HTML is escaped via `escapeHtml` / `linkify`
 * - sorting and filtering are pure functions
 * @module components/renderer
 */

import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { localizeSiteData } from '../data/localized-site-data.js';
import { SOCIAL_PLATFORMS } from '../core/constants.js';
import { normalizeData, toNumber, getFlagMeta } from '../core/data-utils.js';
import { escapeHtml, linkify, $ } from '../core/dom.js';
import { navigateWithRouteTransition } from '../core/site-shell.js';

// ── Social icon SVGs (static, trusted) ──────────────────────

const SOCIAL_SVG = Object.freeze({
    youtube:
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/></svg>',
    discord:
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/></svg>',
    telegram:
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/></svg>',
});

// ── Factory ─────────────────────────────────────────────────

/**
 * Create the public-site renderer.
 * @param {{ localeController: ReturnType<import('../i18n/controller.js').createLocaleController> }} deps
 */
export function createRenderer({ localeController }) {
    const featuredEl = $('featured-products');
    const archiveEl = $('archive-products');
    const featuredSocialEl = $('featuredSocialLinks');
    const footerSocialEl = $('footerSocialLinks');
    const teamShowcaseEl = $('teamShowcase');

    /** @type {import('../core/data-utils.js').SiteData} */
    let siteData = localizeSiteData(normalizeData(DEFAULT_SITE_DATA), localeController.locale);

    /** Shorthand for translations. */
    const t = localeController.t.bind(localeController);

    // ── Sorting helpers ─────────────────────────────────────

    function sortedProducts(data = siteData) {
        return [...data.products].sort((a, b) => {
            const diff = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            return diff !== 0 ? diff : a.title.localeCompare(b.title, localeController.locale);
        });
    }

    function featuredProducts(data = siteData) {
        return sortedProducts(data)
            .filter((p) => p.featured)
            .sort((a, b) => toNumber(a.featuredOrder, 0) - toNumber(b.featuredOrder, 0))
            .slice(0, 3);
    }

    function archiveProducts(data = siteData) {
        const ids = new Set(featuredProducts(data).map((p) => p.id));
        return sortedProducts(data).filter((p) => !ids.has(p.id));
    }

    function sortedTeam(data = siteData) {
        return [...data.team].sort((a, b) => {
            const diff = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            return diff !== 0 ? diff : a.name.localeCompare(b.name, localeController.locale);
        });
    }

    // ── Badge renderer ──────────────────────────────────────

    function flagBadgeHtml(flag) {
        const meta = getFlagMeta(flag);
        if (!meta) return '';
        return `<span class="product-flag ${meta.className}">${meta.label}</span>`;
    }

    // ── Download button ─────────────────────────────────────

    function downloadBtnHtml(product) {
        if (product.downloadUrl) {
            const isLocal = !/^https?:\/\//i.test(product.downloadUrl);
            const href = isLocal
                ? localeController.resolveSitePath(product.downloadUrl)
                : product.downloadUrl;
            return `<a href="${escapeHtml(href)}" class="btn-download"${isLocal ? ' download' : ''}>${escapeHtml(t('products.download', 'Скачать'))}</a>`;
        }
        return `<button class="btn-disabled" type="button" disabled>${escapeHtml(t('products.soon', 'Скоро'))}</button>`;
    }

    // ── Social links ────────────────────────────────────────

    function renderSocialLinks(target) {
        if (!target) return;
        target.innerHTML = SOCIAL_PLATFORMS.map(({ key, label }) => {
            const href = siteData.socials?.[key] || '';
            const icon = SOCIAL_SVG[key] || '';
            if (!href) {
                return `<a class="social-link" aria-disabled="true" tabindex="-1" aria-label="${escapeHtml(label)}">${icon}</a>`;
            }
            return `<a class="social-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}">${icon}</a>`;
        }).join('');
    }

    // ── Featured products ───────────────────────────────────

    function renderFeatured() {
        if (!featuredEl) return;
        const products = featuredProducts();

        if (!products.length) {
            featuredEl.innerHTML = `
                <div class="product-card" style="grid-column:1/-1;text-align:center;padding:60px 36px;">
                    <p style="color:var(--color-text-muted);font-size:14px;">${escapeHtml(t('products.noFeatured', ''))}</p>
                </div>`;
            return;
        }

        featuredEl.innerHTML = products.map((product) => {
            const dotClass = (product.downloadUrl || product.detailUrl) ? 'status-dot' : 'status-dot inactive';
            const badge = flagBadgeHtml(product.flag);

            /* Card with detail page link */
            if (product.detailUrl) {
                /* detailUrl is locale-relative, resolve against current directory */
                const href = './' + product.detailUrl.replace(/^\.\//, '');
                const cardAttrs = product.autoRouteRedirect
                    ? ` data-detail-card="${escapeHtml(href)}" tabindex="0" role="link" aria-label="${escapeHtml(product.title)}"`
                    : '';
                return `
<article class="product-card ${product.autoRouteRedirect ? 'is-route-card' : ''}" id="${escapeHtml(product.id)}"${cardAttrs}>
  <div class="product-status"><span class="${dotClass}"></span>${escapeHtml(product.status || product.tag)} ${badge}</div>
  <h3 class="product-name">${escapeHtml(product.title)}</h3>
  <p class="product-version">v${escapeHtml(product.version)}</p>
  ${product.summary ? `<p class="product-desc">${linkify(product.summary)}</p>` : ''}
  <div class="product-meta">
    <span class="product-tag">${escapeHtml(product.tag)}</span>
    <a class="btn-detail" href="${escapeHtml(href)}" data-detail-nav>${escapeHtml(t('products.detail', 'Подробнее'))}</a>
  </div>
</article>`;
            }

            /* Full card */
            const steps = product.instructions.length
                ? `<ol class="product-steps">${product.instructions.map((s, i) =>
                    `<li><span class="step-num">${i + 1}</span><span>${linkify(s)}</span></li>`).join('')}</ol>`
                : '';
            const source = product.sourceUrl
                ? `<div class="product-meta-links"><a class="inline-link" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t('products.sourceCode', 'Исходный код ↗'))}</a></div>`
                : '';
            const note = product.note
                ? `<p class="product-note">${linkify(product.note)}</p>`
                : '';

            return `
<article class="product-card" id="${escapeHtml(product.id)}">
  <div class="product-status"><span class="${dotClass}"></span>${escapeHtml(product.status || product.tag)} ${badge}</div>
  <h3 class="product-name">${escapeHtml(product.title)}</h3>
  <p class="product-version">v${escapeHtml(product.version)}</p>
  ${product.summary ? `<p class="product-desc">${linkify(product.summary)}</p>` : ''}
  ${steps}${note}${source}
  <div class="product-meta">
    <span class="product-tag">${escapeHtml(product.tag)}</span>
    ${downloadBtnHtml(product)}
  </div>
</article>`;
        }).join('');

        bindDetailNavLinks();
    }

    // ── Archive / catalog ───────────────────────────────────

    function renderArchive() {
        if (!archiveEl) return;
        const products = archiveProducts();
        if (!products.length) { archiveEl.innerHTML = ''; return; }

        archiveEl.innerHTML = products.map((p) => `
<div class="catalog-item" role="listitem">
  <div class="catalog-item-left">
    <span class="catalog-item-name">${escapeHtml(p.title)}</span>
    <span class="catalog-item-status">${escapeHtml(p.status || p.tag)}</span>
  </div>
  <span class="product-tag">${escapeHtml(p.tag)}</span>
</div>`).join('');
    }

    // ── Team ────────────────────────────────────────────────

    function renderTeam() {
        if (!teamShowcaseEl) return;
        const members = sortedTeam();

        if (!members.length) {
            teamShowcaseEl.innerHTML = `<p style="color:var(--color-text-muted);font-size:14px;">${escapeHtml(t('team.empty', ''))}</p>`;
            return;
        }

        const cardHtml = (m) => {
            const initials = String(m.name || '').split(/\s+/).filter(Boolean)
                .map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
            const avatar = m.avatarUrl
                ? `<img src="${escapeHtml(m.avatarUrl)}" alt="${escapeHtml(m.name)}" loading="lazy">`
                : escapeHtml(initials);
            return `
<div class="team-card">
  <div class="team-avatar">${avatar}</div>
  <div class="team-name">${escapeHtml(m.name)}</div>
  <div class="team-role">${escapeHtml(m.role)}</div>
  ${m.description ? `<p class="team-bio">${linkify(m.description)}</p>` : ''}
</div>`;
        };

        if (members.length >= 5) {
            const cards = members.map(cardHtml).join('');
            teamShowcaseEl.innerHTML = `
<div class="team-marquee-wrap">
  <div class="team-marquee-track">${cards}${cards}</div>
</div>`;
            return;
        }

        teamShowcaseEl.innerHTML = members.map(cardHtml).join('');
    }

    // ── Detail page transition ──────────────────────────────

    function bindDetailNavLinks() {
        document.querySelectorAll('[data-detail-nav]').forEach((link) => {
            if (/** @type {HTMLElement} */ (link).dataset.bound) return;
            /** @type {HTMLElement} */ (link).dataset.bound = '1';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navigateWithRouteTransition(/** @type {HTMLAnchorElement} */ (link).href);
            });
        });

        document.querySelectorAll('[data-detail-card]').forEach((card) => {
            if (/** @type {HTMLElement} */ (card).dataset.boundCard) return;
            /** @type {HTMLElement} */ (card).dataset.boundCard = '1';

            const navigate = () => {
                const href = /** @type {HTMLElement} */ (card).dataset.detailCard;
                if (!href) return;
                navigateWithRouteTransition(href);
            };

            card.addEventListener('click', (event) => {
                const target = event.target instanceof Element ? event.target.closest('a, button, input, textarea, select') : null;
                if (target) return;
                navigate();
            });

            card.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                navigate();
            });
        });
    }

    // ── Public API ──────────────────────────────────────────

    /**
     * Full render (or re-render) of every dynamic section.
     * @param {Record<string, unknown>} [nextData]
     */
    function renderSite(nextData) {
        siteData = localizeSiteData(normalizeData(nextData ?? siteData), localeController.locale);
        renderSocialLinks(featuredSocialEl);
        renderSocialLinks(footerSocialEl);
        renderFeatured();
        renderArchive();
        renderTeam();
    }

    return Object.freeze({ renderSite });
}
