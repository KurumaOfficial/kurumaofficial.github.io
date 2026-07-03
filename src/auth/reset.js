import { createLocaleController } from '../i18n/controller.js';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    // Mock Reset Action
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            
            alert(`[Mock Reset] Password recovery email sent to: ${email}`);
            // Redirect to login
            const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
            window.location.href = `/${currentLocale}/auth/login/`;
        });
    }

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
