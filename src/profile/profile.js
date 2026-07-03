import { createLocaleController } from '../i18n/controller.js';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    // ── Tab Navigation (sidebar-link & profile-section) ──
    const menuItems = document.querySelectorAll('.sidebar-link');
    const contentSections = document.querySelectorAll('.profile-section');

    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.target;
            if (!targetSectionId) return;

            menuItems.forEach((btn) => btn.classList.remove('active'));
            item.classList.add('active');

            contentSections.forEach((section) => {
                section.classList.remove('active');
                if (section.id === targetSectionId) {
                    section.classList.add('active');
                }
            });

            // Update breadcrumb dynamically to reflect tab text
            const currentBreadcrumb = document.querySelector('.breadcrumb .current');
            if (currentBreadcrumb) {
                const clone = item.cloneNode(true);
                clone.querySelectorAll('svg').forEach(s => s.remove());
                currentBreadcrumb.textContent = clone.textContent.trim();
            }
        });
    });

    // ── Copy License Key ────────────────────────────────
    document.querySelectorAll('.copy-key-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const keyEl = btn.previousElementSibling;
            if (!keyEl) return;

            navigator.clipboard.writeText(keyEl.textContent.trim())
                .then(() => {
                    const original = btn.textContent;
                    btn.textContent = '✓';
                    btn.style.color = 'var(--green)';
                    setTimeout(() => {
                        btn.textContent = original;
                        btn.style.color = '';
                    }, 1500);
                })
                .catch(() => {});
        });
    });

    // ── Mock Form Submissions ───────────────────────────
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = securityForm.querySelector('.save-btn');
            if (btn) {
                const original = btn.textContent;
                btn.textContent = '✓';
                btn.style.background = 'var(--green)';
                setTimeout(() => {
                    btn.textContent = original;
                    btn.style.background = '';
                }, 1500);
            }
        });
    }

    // ── Decorative Snowflakes Background ─────────────────
    const container = document.getElementById('snowflakes');
    if (container) {
        const positions = [
            {top:'20%', left:'46.5%', size:14, delay:0},
            {top:'27%', left:'75.3%', size:12, delay:0.6},
            {top:'42%', left:'66.7%', size:18, delay:1.2},
            {top:'47%', left:'91.3%', size:15, delay:0.3},
            {top:'49%', left:'35.5%', size:11, delay:1.6},
            {top:'54%', left:'50.7%', size:16, delay:0.9},
            {top:'64%', left:'6.5%',  size:13, delay:1.9},
        ];
        
        positions.forEach(p => {
            const el = document.createElement('span');
            el.className = 'snowflake';
            el.textContent = '❄';
            el.style.top = p.top;
            el.style.left = p.left;
            el.style.fontSize = p.size + 'px';
            el.style.animationDelay = p.delay + 's';
            container.appendChild(el);
        });
    }

    // ── Progress Ring Dashoffset ────────────────────────
    const ring = document.getElementById('ringBar');
    if (ring) {
        const r = 27;
        const c = 2 * Math.PI * r;
        const pct = 0.85; // Mock progress (85%)
        ring.style.strokeDasharray = c;
        ring.style.strokeDashoffset = c * (1 - pct);
    }

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
