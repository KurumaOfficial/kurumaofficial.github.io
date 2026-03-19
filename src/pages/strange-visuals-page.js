import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { escapeHtml, linkify, normalizeData } from '../core/site-utils.js';

/* ── Load product data ─────────────────────────────────────── */
const data    = normalizeData(DEFAULT_SITE_DATA);
const product = data.products.find(p => p.id === 'strange-visuals') || null;

if (product) {
    /* Version badge */
    const versionBadge = document.getElementById('svVersionBadge');
    if (versionBadge) {
        versionBadge.textContent = `v${product.version || 'x'}`;
    }

    /* Hero description */
    const descEl = document.getElementById('svHeroDesc');
    if (descEl && product.summary) {
        descEl.innerHTML = linkify(product.summary);
    }

    /* Download button */
    const downloadBtn   = document.getElementById('svDownloadBtn');
    const downloadLabel = document.getElementById('svDownloadLabel');
    if (downloadBtn) {
        if (product.downloadUrl) {
            const isLocal = !/^https?:\/\//i.test(product.downloadUrl);
            // Resolve path: page is one level deep, assets are at root
            const href = isLocal
                ? product.downloadUrl.replace(/^\.\//, '../')
                : product.downloadUrl;
            downloadBtn.href = href;
            if (isLocal) downloadBtn.setAttribute('download', '');
            if (downloadLabel) {
                downloadLabel.textContent = `Скачать v${product.version}`;
            }
        } else {
            downloadBtn.style.opacity = '0.4';
            downloadBtn.style.pointerEvents = 'none';
            downloadBtn.removeAttribute('download');
            if (downloadLabel) downloadLabel.textContent = 'Скоро';
        }
    }

    /* Source / GitHub buttons */
    const sourceBtn   = document.getElementById('svSourceBtn');
    const githubNavBtn = document.getElementById('svGithubNavBtn');
    if (product.sourceUrl) {
        if (sourceBtn)    sourceBtn.href    = product.sourceUrl;
        if (githubNavBtn) githubNavBtn.href = product.sourceUrl;
    } else {
        if (sourceBtn)    sourceBtn.hidden    = true;
        if (githubNavBtn) githubNavBtn.hidden = true;
    }

    /* Installation steps */
    const stepsEl = document.getElementById('svSteps');
    if (stepsEl) {
        if (product.instructions && product.instructions.length) {
            stepsEl.innerHTML = product.instructions.map((step, i) => `
<li class="sv-step sv-reveal">
  <div class="sv-step-num">0${i + 1}</div>
  <div class="sv-step-text">${linkify(step)}</div>
</li>`).join('');
        } else {
            stepsEl.hidden = true;
        }
    }

    /* Note */
    const noteEl = document.getElementById('svNote');
    if (noteEl) {
        if (product.note) {
            noteEl.innerHTML = linkify(product.note);
            noteEl.hidden = false;
        }
    }
}

/* ── Back navigation ───────────────────────────────────────── */
// Try to infer the locale from the referrer so the user lands back
// on the same language. Fall back to root (which redirects correctly).
function getBackHref() {
    const ref = document.referrer || '';
    if (/\/ru(?:\/|$)/.test(ref)) return '../ru/';
    if (/\/en(?:\/|$)/.test(ref)) return '../en/';
    if (/\/ua(?:\/|$)/.test(ref)) return '../ua/';
    return '../';
}

function navigateBack(e) {
    e.preventDefault();
    const href = getBackHref();
    document.body.classList.add('sv-leaving');
    setTimeout(() => { window.location.href = href; }, 480);
}

['svBackBtn', 'svFooterBackBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', navigateBack);
});

/* ── Reveal on scroll ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
    entries => entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('sv-visible');
            revealObserver.unobserve(e.target);
        }
    }),
    { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
);

// Observe static .sv-reveal elements already in DOM
document.querySelectorAll('.sv-reveal').forEach(el => revealObserver.observe(el));

// Observe dynamically inserted steps (after steps are rendered above)
document.querySelectorAll('#svSteps .sv-reveal').forEach(el => revealObserver.observe(el));
