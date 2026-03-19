import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { SOCIAL_META } from '../core/constants.js';
import {
    normalizeData,
    toNumber,
    escapeHtml,
    linkify,
    renderFlagBadge,
    renderSocialIcon,
    renderTeamAvatar
} from '../core/site-utils.js';

export function createPublicSite({ localeController }) {
    const featuredProductsEl  = document.getElementById('featured-products');
    const archiveProductsEl   = document.getElementById('archive-products');
    const featuredSocialEl    = document.getElementById('featuredSocialLinks');
    const footerSocialEl      = document.getElementById('footerSocialLinks');
    const teamShowcaseEl      = document.getElementById('teamShowcase');
    const toastEl             = document.getElementById('toast');

    let siteData = localeController.localizeSiteData(DEFAULT_SITE_DATA);
    let toastTimer = null;

    function t(path, fallback = '') {
        return localeController.t(path, fallback);
    }

    /* ── social links ─────────────────────────────────────── */
    function renderSocialLinks(target) {
        if (!target) return;
        target.innerHTML = SOCIAL_META.map(({ key, label }) => {
            const href = siteData.socials?.[key] || '';
            const disabled = !href;
            const attrs = disabled
                ? 'href="#" aria-disabled="true" tabindex="-1"'
                : `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
            return `<a class="social-link${disabled ? ' is-disabled' : ''}" data-social="${key}" ${attrs} aria-label="${label}">${renderSocialIcon(key)}</a>`;
        }).join('');
    }

    /* ── toast ────────────────────────────────────────────── */
    // kind: 'success' | 'error' | 'info' (optional, maps to CSS data-kind attr)
    function showToast(message, kind = 'info') {
        if (!toastEl) return;
        toastEl.textContent = message;
        toastEl.dataset.kind = kind;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
            delete toastEl.dataset.kind;
        }, 3200);
    }

    /* ── download button ──────────────────────────────────── */
    function renderDownloadBtn(product) {
        if (product.downloadUrl) {
            const isLocal = !/^https?:\/\//i.test(product.downloadUrl);
            const href = isLocal
                ? localeController.resolveSitePath(product.downloadUrl)
                : product.downloadUrl;
            return `<a href="${escapeHtml(href)}" class="btn-download"${isLocal ? ' download' : ''}>${escapeHtml(t('products.download', 'Скачать'))}</a>`;
        }
        return `<button class="btn-disabled" type="button" disabled>${escapeHtml(t('products.soon', 'Скоро'))}</button>`;
    }

    function getSortedTeam(data) {
        return [...data.team].sort((a, b) => {
            const bySort = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            if (bySort !== 0) return bySort;
            return a.name.localeCompare(b.name, localeController.locale);
        });
    }

    function getSortedProducts(data) {
        return [...data.products].sort((a, b) => {
            const bySort = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            if (bySort !== 0) return bySort;
            return a.title.localeCompare(b.title, localeController.locale);
        });
    }

    function getFeaturedProducts(data) {
        return getSortedProducts(data)
            .filter((item) => item.featured)
            .sort((a, b) => {
                const byFeaturedOrder = toNumber(a.featuredOrder, 0) - toNumber(b.featuredOrder, 0);
                if (byFeaturedOrder !== 0) return byFeaturedOrder;
                return toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            })
            .slice(0, 3);
    }

    function getArchiveProducts(data) {
        const featuredIds = new Set(getFeaturedProducts(data).map((item) => item.id));
        return getSortedProducts(data).filter((item) => !featuredIds.has(item.id));
    }

    function renderFeaturedProducts() {
        const products = getFeaturedProducts(siteData);
        if (!products.length) {
            featuredProductsEl.innerHTML = `
                <div class="product-card" style="grid-column:1/-1;text-align:center;padding:60px 36px;">
                    <p style="color:var(--muted);font-size:14px;">${escapeHtml(t('products.noFeaturedBody', 'Откройте скрытый редактор и выведите хотя бы один продукт на витрину.'))}</p>
                </div>`;
            return;
        }

        featuredProductsEl.innerHTML = products.map(product => {
            const dotClass  = (product.downloadUrl || product.detailUrl) ? 'status-dot' : 'status-dot inactive';
            const flagBadge = renderFlagBadge(product.flag);

            /* ── Products with a dedicated detail page ── */
            if (product.detailUrl) {
                const detailHref = localeController.resolveSitePath(product.detailUrl);
                return `
<div class="product-card" id="${escapeHtml(product.id)}">
  <div class="product-status">
    <span class="${dotClass}"></span>
    ${escapeHtml(product.status || product.tag)}
    ${flagBadge}
  </div>
  <div class="product-name">${escapeHtml(product.title)}</div>
  <div class="product-version">v${escapeHtml(product.version || 'x')}</div>
  ${product.summary ? `<p class="product-desc">${linkify(product.summary)}</p>` : ''}
  <div class="product-meta">
    <span class="product-tag">${escapeHtml(product.tag)}</span>
    <a class="btn-detail" href="${escapeHtml(detailHref)}" data-detail-nav>Подробнее</a>
  </div>
</div>`;
            }

            /* ── Regular products — full card ── */
            const instructionsMarkup = product.instructions.length
                ? `<ol class="product-steps">${product.instructions.map((item, i) =>
                    `<li><span class="step-num">${i + 1}</span><span>${linkify(item)}</span></li>`).join('')}</ol>`
                : '';
            const sourceLink = product.sourceUrl
                ? `<div class="product-meta-links"><a class="inline-link" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">Исходный код ↗</a></div>`
                : '';
            const noteMarkup = product.note
                ? `<p class="product-note">${linkify(product.note)}</p>` : '';

            return `
<div class="product-card" id="${escapeHtml(product.id)}">
  <div class="product-status">
    <span class="${dotClass}"></span>
    ${escapeHtml(product.status || product.tag)}
    ${flagBadge}
  </div>
  <div class="product-name">${escapeHtml(product.title)}</div>
  <div class="product-version">v${escapeHtml(product.version || 'x')}</div>
  ${product.summary ? `<p class="product-desc">${linkify(product.summary)}</p>` : ''}
  ${instructionsMarkup}${noteMarkup}${sourceLink}
  <div class="product-meta">
    <span class="product-tag">${escapeHtml(product.tag)}</span>
    ${renderDownloadBtn(product)}
  </div>
</div>`;
        }).join('');

        setupDetailNavLinks();
    }

    /* ── Detail page nav with exit animation ───────────────── */
    function setupDetailNavLinks() {
        document.querySelectorAll('[data-detail-nav]').forEach(link => {
            if (link.dataset.detailNavBound) return;
            link.dataset.detailNavBound = '1';
            link.addEventListener('click', e => {
                e.preventDefault();
                document.body.classList.add('page-leaving');
                setTimeout(() => { window.location.href = link.getAttribute('href'); }, 280);
            });
        });
    }

    function renderArchiveProducts() {
        const products = getArchiveProducts(siteData);
        if (!archiveProductsEl) return;
        if (!products.length) { archiveProductsEl.innerHTML = ''; return; }

        archiveProductsEl.innerHTML = products.map(product => `
<div class="catalog-item" tabindex="0" role="listitem">
  <div class="catalog-item-left">
    <span class="catalog-item-name">${escapeHtml(product.title)}</span>
    <span class="catalog-item-status">${escapeHtml(product.status || product.tag)}</span>
  </div>
  <span class="product-tag">${escapeHtml(product.tag)}</span>
</div>`).join('');
    }

    function renderTeamShowcase() {
        const members = getSortedTeam(siteData);
        if (!teamShowcaseEl) return;
        if (!members.length) {
            teamShowcaseEl.innerHTML = `<p style="color:var(--muted);font-size:14px;">${escapeHtml(t('team.empty', 'Нет участников.'))}</p>`;
            return;
        }

        const renderCard = (member) => {
            const initials = String(member.name || '').split(/\s+/).filter(Boolean)
                .map(p => p[0]).join('').toUpperCase().slice(0, 2) || '?';
            const avatarInner = member.avatarUrl
                ? `<img src="${escapeHtml(member.avatarUrl)}" alt="${escapeHtml(member.name)}" loading="lazy">`
                : initials;
            return `
<div class="team-card">
  <div class="team-avatar">${avatarInner}</div>
  <div class="team-name">${escapeHtml(member.name)}</div>
  <div class="team-role">${escapeHtml(member.role)}</div>
  ${member.description ? `<p class="team-bio">${linkify(member.description)}</p>` : ''}
</div>`;
        };

        if (members.length >= 5) {
            const cards = members.map(renderCard).join('');
            teamShowcaseEl.innerHTML = `
<div class="team-marquee-wrap">
  <div class="team-marquee-track">${cards}${cards}</div>
</div>`;
            return;
        }

        teamShowcaseEl.innerHTML = members.map(renderCard).join('');
    }

    /* ── reveal observer ─────────────────────────────────────── */
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    function setupRevealAnimations() {
        document.querySelectorAll('.reveal').forEach(el => {
            if (el.dataset.revealBound === '1') return;
            el.dataset.revealBound = '1';
            revealObserver.observe(el);
        });
    }

    /* ── full render ─────────────────────────────────────────── */
    function renderSite(nextData = siteData) {
        siteData = localeController.localizeSiteData(normalizeData(nextData));
        renderSocialLinks(featuredSocialEl);
        renderSocialLinks(footerSocialEl);
        renderFeaturedProducts();
        renderArchiveProducts();
        renderTeamShowcase();
        setupRevealAnimations();
    }

    /* ── global UI setup ─────────────────────────────────────── */
    function setupGlobalUi() {
        localeController.applyDocumentMeta();
        localeController.applyStaticCopy();
        localeController.mountLanguageSwitcher();
        setupRevealAnimations();
        setupDetailNavLinks();

        const mo = new MutationObserver(() => { setupRevealAnimations(); setupDetailNavLinks(); });
        if (featuredProductsEl) mo.observe(featuredProductsEl, { childList: true, subtree: true });
        if (archiveProductsEl)  mo.observe(archiveProductsEl,  { childList: true, subtree: true });
    }

    return { renderSite, setupGlobalUi, showToast };
}
