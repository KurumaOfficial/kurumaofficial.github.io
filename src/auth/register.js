import { createLocaleController } from '../i18n/controller.js';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const pw = document.getElementById('password')?.value || '';
            const cpw = document.getElementById('confirmPassword')?.value || '';

            if (pw !== cpw) {
                // Simple inline validation — no alert
                const cpwInput = document.getElementById('confirmPassword');
                if (cpwInput) {
                    cpwInput.style.borderColor = 'var(--accent-light)';
                    cpwInput.focus();
                }
                return;
            }

            const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
            // Mock redirect — backend will handle real registration
            window.location.href = `/${currentLocale}/profile/`;
        });
    }

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
