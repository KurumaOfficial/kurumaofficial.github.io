import { createLocaleController } from '../i18n/controller.js';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    // ── Tab Navigation ──────────────────────────────────
    const menuItems = document.querySelectorAll('.profile-menu-item');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.target;

            menuItems.forEach((btn) => btn.classList.remove('is-active'));
            item.classList.add('is-active');

            contentSections.forEach((section) => {
                section.classList.remove('is-active');
                if (section.id === targetSectionId) {
                    section.classList.add('is-active');
                }
            });
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

    // ── Mock Form Submissions (no alerts) ───────────────
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = settingsForm.querySelector('.save-btn');
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

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
