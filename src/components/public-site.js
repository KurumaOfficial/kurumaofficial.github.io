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

export function createPublicSite() {
    const featuredProductsEl = document.getElementById('featured-products');
    const archiveProductsEl = document.getElementById('archive-products');
    const featuredSocialLinksEl = document.getElementById('featuredSocialLinks');
    const footerSocialLinksEl = document.getElementById('footerSocialLinks');
    const teamShowcaseEl = document.getElementById('teamShowcase');
    const toastEl = document.getElementById('toast');

    let siteData = normalizeData(DEFAULT_SITE_DATA);
    let expandedArchiveId = null;
    let toastTimer = null;

    function getSortedTeam(data) {
        return [...data.team].sort((a, b) => {
            const bySort = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            if (bySort !== 0) return bySort;
            return a.name.localeCompare(b.name, 'ru');
        });
    }

    function getSortedProducts(data) {
        return [...data.products].sort((a, b) => {
            const bySort = toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            if (bySort !== 0) return bySort;
            return a.title.localeCompare(b.title, 'ru');
        });
    }

    function getFeaturedProducts(data) {
        return getSortedProducts(data)
            .filter(item => item.featured)
            .sort((a, b) => {
                const byFeaturedOrder = toNumber(a.featuredOrder, 0) - toNumber(b.featuredOrder, 0);
                if (byFeaturedOrder !== 0) return byFeaturedOrder;
                return toNumber(a.sortOrder, 0) - toNumber(b.sortOrder, 0);
            })
            .slice(0, 3);
    }

    function getArchiveProducts(data) {
        const featuredIds = new Set(getFeaturedProducts(data).map(item => item.id));
        return getSortedProducts(data).filter(item => !featuredIds.has(item.id));
    }

    function renderSocialLinks(target, variant) {
        if (!target) return;
        target.innerHTML = SOCIAL_META.map(({ key, label }) => {
            const href = siteData.socials?.[key] || '';
            const disabled = !href;
            const attrs = disabled
                ? 'href="#" aria-disabled="true" tabindex="-1"'
                : `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
            return `<a class="social-link ${variant} ${disabled ? 'is-disabled' : ''}" data-social="${key}" ${attrs} aria-label="${label}">${renderSocialIcon(key)}</a>`;
        }).join('');
    }

    function showToast(message, kind) {
        toastEl.textContent = message;
        toastEl.style.borderColor = kind === 'error'
            ? 'rgba(251,113,133,0.35)'
            : (kind === 'success' ? 'rgba(74,222,128,0.32)' : 'rgba(255,255,255,0.12)');
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3200);
    }

    function renderProductAction(product, buttonClass, options = {}) {
        const { compact = false } = options;
        const inlineStyle = compact ? ' style="width:auto; min-width:220px;"' : '';

        if (product.downloadUrl) {
            const isLocalFile = !/^https?:\/\//i.test(product.downloadUrl);
            return `<a href="${escapeHtml(product.downloadUrl)}" class="btn ${buttonClass}"${isLocalFile ? ' download' : ''}${inlineStyle}>Скачать</a>`;
        }

        return `<button class="btn btn-secondary" type="button" disabled${inlineStyle}>Скоро</button>`;
    }

    function renderFeaturedProducts() {
        const products = getFeaturedProducts(siteData);
        if (!products.length) {
            featuredProductsEl.innerHTML = '<div class="glass-card feature-card reveal visible"><h3 style="margin-bottom:12px;">Пока нет главных продуктов</h3><p class="subtext">Открой скрытый редактор по → → ← → ← → →, затем нажми на верхний логотип и поставь галочку «На главной» хотя бы у одного продукта.</p></div>';
            return;
        }

        featuredProductsEl.innerHTML = products.map(product => {
            const toneClass = product.tone === 'green' ? 'tone-green' : 'tone-red';
            const buttonClass = product.tone === 'green' ? 'btn-product' : 'btn-primary';
            const instructionsMarkup = product.instructions.length
                ? '<ol class="product-steps">' + product.instructions.map((item, idx) =>
                    `<li><span class="step-num">${idx + 1}</span><span>${linkify(item)}</span></li>`).join('') + '</ol>'
                : '';
            const metaMarkup = [
                product.sourceUrl
                    ? `<div>Исходный код: <a class="inline-link" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(product.sourceUrl.replace(/^https?:\/\//, ''))}</a></div>`
                    : '',
                product.note ? `<div>${linkify(product.note)}</div>` : ''
            ].filter(Boolean).join('');

            return `
                <article id="${escapeHtml(product.id)}" class="glass-card glass-card-hover feature-card reveal visible product-card-featured ${toneClass}">
                    <div class="product-topline">
                        <div class="product-kicker mono">
                            <span style="width:8px; height:8px; border-radius:999px; background:${product.tone === 'green' ? 'var(--green-accent)' : 'var(--accent)'}; box-shadow:0 0 0 0 ${product.tone === 'green' ? 'rgba(var(--green-rgb),0.64)' : 'rgba(var(--accent-rgb),0.64)'}; animation:pulse 1.8s infinite;"></span>
                            ${escapeHtml(product.tag)}
                        </div>
                        ${renderFlagBadge(product.flag)}
                    </div>
                    <h3>${escapeHtml(product.title)}</h3>
                    <div class="product-version mono"><span class="version-dot"></span>версия ${escapeHtml(product.version || 'x')}</div>
                    ${product.summary ? `<p class="product-copy">${linkify(product.summary)}</p>` : ''}
                    ${instructionsMarkup}
                    ${metaMarkup ? `<div class="product-meta">${metaMarkup}</div>` : ''}
                    <div class="product-actions">
                        ${renderProductAction(product, buttonClass)}
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderArchiveProducts() {
        const products = getArchiveProducts(siteData);
        if (!products.length) {
            archiveProductsEl.innerHTML = '';
            return;
        }

        archiveProductsEl.innerHTML = products.map((product, index) => {
            const isActive = expandedArchiveId === product.id;
            const toneClass = product.tone === 'green' ? 'tone-green' : 'tone-red';
            const buttonClass = product.tone === 'green' ? 'btn-product' : 'btn-primary';
            const instructionsMarkup = product.instructions.length
                ? '<ol class="product-steps">' + product.instructions.map((item, idx) =>
                    `<li><span class="step-num">${idx + 1}</span><span>${linkify(item)}</span></li>`).join('') + '</ol>'
                : '';
            const metaMarkup = [
                product.sourceUrl
                    ? `<div>Исходный код: <a class="inline-link" href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(product.sourceUrl.replace(/^https?:\/\//, ''))}</a></div>`
                    : '',
                product.note ? `<div>${linkify(product.note)}</div>` : ''
            ].filter(Boolean).join('');

            return `
                <article class="glass-card archive-card ${toneClass} ${isActive ? 'active' : ''}" data-archive-card="${escapeHtml(product.id)}" tabindex="0" role="button" aria-expanded="${isActive ? 'true' : 'false'}">
                    <div class="archive-badges">
                        <div class="product-kicker mono">${escapeHtml(product.tag)}</div>
                        ${renderFlagBadge(product.flag)}
                    </div>
                    <div class="archive-card-top">
                        <div>
                            <span class="archive-index mono">#${String(index + 1).padStart(2, '0')}</span>
                            <h4>${escapeHtml(product.title)}</h4>
                            <div class="archive-mini-version mono">версия ${escapeHtml(product.version || 'x')} · ${escapeHtml(product.status)}</div>
                        </div>
                        <div class="archive-toggle">⌄</div>
                    </div>
                    <p class="archive-summary">${linkify(product.summary || product.note || 'Карточка готова под будущий релиз.')}</p>
                    <div class="archive-body">
                        <div class="archive-body-inner">
                            ${instructionsMarkup}
                            ${metaMarkup ? `<div class="product-meta">${metaMarkup}</div>` : ''}
                            <div class="product-actions" style="justify-content:flex-start;">${renderProductAction(product, buttonClass, { compact: true })}</div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }

    function renderTeamShowcase() {
        const members = getSortedTeam(siteData);
        teamShowcaseEl.classList.remove('has-marquee');
        if (!members.length) {
            teamShowcaseEl.innerHTML = '<div class="team-empty">Команда пока не добавлена. Настрой карточки участников в разделе «Прочее» админ-панели.</div>';
            return;
        }

        const renderCard = (member, extraClass = '') => `
            <article class="glass-card glass-card-hover team-card ${extraClass}">
                <div class="team-card-head">
                    ${renderTeamAvatar(member, 'team-avatar')}
                    <div class="team-copy">
                        <div class="team-name">${escapeHtml(member.name)}</div>
                        <div class="team-role mono">${escapeHtml(member.role)}</div>
                    </div>
                </div>
                <div class="team-bio">${linkify(member.description)}</div>
            </article>
        `;

        if (members.length >= 5) {
            const cards = members.map(member => renderCard(member, 'marquee-card')).join('');
            teamShowcaseEl.classList.add('has-marquee');
            teamShowcaseEl.innerHTML = `
                <div class="team-marquee">
                    <div class="team-marquee-track">
                        ${cards}
                        ${cards}
                    </div>
                </div>
            `;
            return;
        }

        teamShowcaseEl.innerHTML = `<div class="team-grid">${members.map(member => renderCard(member)).join('')}</div>`;
    }

    function bindArchiveToggle() {
        archiveProductsEl.querySelectorAll('[data-archive-card]').forEach(card => {
            if (card.dataset.bound === '1') return;
            card.dataset.bound = '1';

            const toggle = () => {
                const id = card.getAttribute('data-archive-card');
                expandedArchiveId = expandedArchiveId === id ? null : id;
                renderArchiveProducts();
                bindArchiveToggle();
                attachCardGlowTracking();
            };

            card.addEventListener('click', event => {
                if (event.target.closest('a, button')) return;
                toggle();
            });

            card.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                }
            });
        });
    }

    function attachCardGlowTracking() {
        document.querySelectorAll('.glass-card').forEach(el => {
            if (el.dataset.glowBound === '1') return;
            el.dataset.glowBound = '1';
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                el.style.setProperty('--mx', x + '%');
                el.style.setProperty('--my', y + '%');
            });
        });
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    function setupRevealAnimations() {
        document.querySelectorAll('.reveal').forEach((el, i) => {
            if (el.dataset.revealBound === '1') return;
            el.dataset.revealBound = '1';
            el.style.transition = `opacity 0.6s ease ${(i % 6) * 0.07}s, transform 0.6s ease ${(i % 6) * 0.07}s, border-color 0.35s ease, box-shadow 0.35s ease`;
            revealObserver.observe(el);
        });
    }

    function hydrateDynamicUi() {
        bindArchiveToggle();
        attachCardGlowTracking();
        setupRevealAnimations();
    }

    function renderSite(nextSiteData = siteData) {
        siteData = normalizeData(nextSiteData);
        renderSocialLinks(featuredSocialLinksEl, 'square');
        renderSocialLinks(footerSocialLinksEl, 'pill');
        renderFeaturedProducts();
        renderArchiveProducts();
        renderTeamShowcase();
        hydrateDynamicUi();
    }

    function setupGlobalUi() {
        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    const sy = window.scrollY;
                    document.querySelectorAll('.bg-orbs .orb').forEach((orb, i) => {
                        orb.style.transform = `translateY(${sy * (0.02 + i * 0.012)}px)`;
                    });
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });

        bindArchiveToggle();
        attachCardGlowTracking();
        setupRevealAnimations();

        const observerTarget = new MutationObserver(() => {
            bindArchiveToggle();
            attachCardGlowTracking();
            setupRevealAnimations();
        });

        observerTarget.observe(featuredProductsEl, { childList: true, subtree: true });
        observerTarget.observe(archiveProductsEl, { childList: true, subtree: true });
    }

    return {
        renderSite,
        setupGlobalUi,
        showToast
    };
}
