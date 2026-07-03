import { createLocaleController } from '../i18n/controller.js';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    // Tab Navigation Logic
    const menuItems = document.querySelectorAll('.profile-menu-item');
    const contentSections = document.querySelectorAll('.content-section');

    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.target;
            
            // Toggle active menu item
            menuItems.forEach((btn) => btn.classList.remove('is-active'));
            item.classList.add('is-active');

            // Toggle active content section
            contentSections.forEach((section) => {
                section.classList.remove('is-active');
                if (section.id === targetSectionId) {
                    section.classList.add('is-active');
                }
            });
        });
    });

    // Copy License Key Action
    document.querySelectorAll('.copy-key-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const keyEl = btn.previousElementSibling;
            if (keyEl) {
                navigator.clipboard.writeText(keyEl.textContent.trim())
                    .then(() => {
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = '<span style="font-size:10px;color:var(--green)">✓</span>';
                        setTimeout(() => {
                            btn.innerHTML = originalHtml;
                        }, 1500);
                    })
                    .catch(() => {
                        alert('Failed to copy key.');
                    });
            }
        });
    });

    // Mock Profile Edit Form Save
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('[Mock Profile] Profile details successfully updated.');
        });
    }

    // Mock Password Change Save
    const securityForm = document.getElementById('securityForm');
    if (securityForm) {
        securityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('[Mock Security] Password successfully changed.');
        });
    }

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
