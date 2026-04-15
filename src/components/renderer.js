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
import { SOCIAL_PLATFORMS, SOCIAL_ICON_SVG } from '../core/constants.js';
import { normalizeData, toNumber, getFlagMeta } from '../core/data-utils.js';
import { cleanUrl, escapeHtml, linkify, optimizeDiscordAvatarUrl, $ } from '../core/dom.js';
import { navigateWithRouteTransition } from '../core/site-shell.js?v=20260415c';

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
    const collationLocale = localeController.locale === 'ua' ? 'uk' : localeController.locale;

    /** @type {import('../core/data-utils.js').SiteData} */
    let siteData = localizeSiteData(normalizeData(DEFAULT_SITE_DATA), localeController.locale);

    /** Shorthand for translations. */
    const t = localeController.t.bind(localeController);

    function bindDetailNavLinks() {
        if (!featuredEl || featuredEl.dataset.detailNavBound === '1') return;
        featuredEl.dataset.detailNavBound = '1';

        featuredEl.addEventListener('click', (event) => {
            const target = event.target instanceof Element ? event.target : null;
            if (!target) return;

            const detailLink = target.closest('[data-detail-nav]');
            if (detailLink instanceof HTMLAnchorElement && featuredEl.contains(detailLink)) {
                event.preventDefault();
                navigateWithRouteTransition(detailLink.href);
                return;
            }

            const detailCard = target.closest('[data-detail-card]');
            if (!(detailCard instanceof HTMLElement) || !featuredEl.contains(detailCard)) return;

            const interactiveTarget = target.closest('a, button, input, textarea, select');
            if (interactiveTarget) return;

            const href = detailCard.dataset.detailCard;
            if (href) {
                navigateWithRouteTransition(href);
            }
        });

        featuredEl.addEventListener('keydown', (event) => {
            const detailCard = event.target instanceof Element
                ? event.target.closest('[data-detail-card]')
                : null;

            if (!(detailCard instanceof HTMLElement) || !featuredEl.contains(detailCard)) return;
            if (event.key !== 'Enter' && event.key !== ' ') return;

            event.preventDefault();
            const href = detailCard.dataset.detailCard;
            if (href) {
                navigateWithRouteTransition(href);
            }
        });
    }

    // ── Sorting helpers ─────────────────────────────────────

    function sortedProducts(data = siteData) {
        return [...data.products].sort((a, b) => {
            const diff = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            return diff !== 0 ? diff : a.title.localeCompare(b.title, collationLocale);
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
            return diff !== 0 ? diff : a.name.localeCompare(b.name, collationLocale);
        });
    }

    // ── Badge renderer ──────────────────────────────────────

    function flagBadgeHtml(flag) {
        const meta = getFlagMeta(flag);
        if (!meta) return '';
        const label = t(`products.flags.${flag}`, meta.label);
        return `<span class="product-flag ${meta.className}">${escapeHtml(label)}</span>`;
    }

    // ── Download button ─────────────────────────────────────

    function downloadBtnHtml(product) {
        if (product.downloadUrl) {
            const href = localeController.resolveSitePath(product.downloadUrl);
            const isLocal = href && !/^(?:https?:)?\/\//i.test(href);
            if (href) {
                return `<a href="${escapeHtml(href)}" class="btn-download"${isLocal ? ' download' : ''}>${escapeHtml(t('products.download'))}</a>`;
            }
        }
        return `<button class="btn-disabled" type="button" disabled>${escapeHtml(t('products.soon'))}</button>`;
    }

    // ── Social links ────────────────────────────────────────

    function renderSocialLinks(target) {
        if (!target) return;
        target.innerHTML = SOCIAL_PLATFORMS.map(({ key, label }) => {
            const href = cleanUrl(siteData.socials?.[key] || '');
            const icon = SOCIAL_ICON_SVG[key] || '';
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
                const href = product.detailUrl.replace(/^\.?\//, './');
                const cardAttrs = product.autoRouteRedirect
                    ? ` data-detail-card="${escapeHtml(href)}" tabindex="0" role="link" aria-label="${escapeHtml(product.title)}"`
                    : '';
                return `
<article class="product-card ${product.autoRouteRedirect ? 'is-route-card' : ''}" id="${escapeHtml(product.id)}" role="listitem"${cardAttrs}>
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
            const sourceHref = localeController.resolveSitePath(product.sourceUrl || '');
            const sourceIsExternal = /^(?:https?:)?\/\//i.test(sourceHref);
            const source = sourceHref
                ? `<div class="product-meta-links"><a class="inline-link" href="${escapeHtml(sourceHref)}"${sourceIsExternal ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(t('products.sourceCode', 'Исходный код ↗'))}</a></div>`
                : '';
            const note = product.note
                ? `<p class="product-note">${linkify(product.note)}</p>`
                : '';

            return `
<article class="product-card" id="${escapeHtml(product.id)}" role="listitem">
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
            const avatarSrc = optimizeDiscordAvatarUrl(localeController.resolveSitePath(m.avatarUrl || ''));
            const avatar = avatarSrc
                ? `<img src="${escapeHtml(avatarSrc)}" alt="" loading="lazy" decoding="async" fetchpriority="low" width="44" height="44">`
                : escapeHtml(initials);
            return `
<div class="team-card" role="listitem">
  <div class="team-avatar" aria-hidden="true">${avatar}</div>
  <div class="team-name">${escapeHtml(m.name)}</div>
  <div class="team-role">${escapeHtml(m.role)}</div>
  ${m.description ? `<p class="team-bio">${linkify(m.description)}</p>` : ''}
</div>`;
        };

        if (members.length >= 5) {
            const cards = members.map(cardHtml).join('');
            teamShowcaseEl.removeAttribute('role');
            teamShowcaseEl.innerHTML = `
<div class="team-marquee-wrap">
  <div class="team-marquee-track">${cards}${cards}</div>
</div>`;
            return;
        }

        teamShowcaseEl.setAttribute('role', 'list');
        teamShowcaseEl.innerHTML = members.map(cardHtml).join('');
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
