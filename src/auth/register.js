import { createLocaleController } from '../i18n/controller.js?v=20260703a';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';
import { showAuthNoticeModal } from './modal.js?v=1';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const pw = document.getElementById('password')?.value || '';
            const cpw = document.getElementById('confirmPassword')?.value || '';

            if (pw && cpw && pw !== cpw) {
                const cpwInput = document.getElementById('confirmPassword');
                if (cpwInput) {
                    cpwInput.style.borderColor = 'var(--accent-light)';
                    cpwInput.focus();
                }
                return;
            }

            showAuthNoticeModal(currentLocale, 'register');
        });
    }

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
