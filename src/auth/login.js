import { createLocaleController } from '../i18n/controller.js?v=20260703a';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';
import { showAuthNoticeModal } from './modal.js?v=1';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    const currentLocale = window.__ALEPH_LOCALE__ || 'ru';

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = (emailInput?.value || '').trim();
            const password = (passwordInput?.value || '').trim();

            if (email === 'test' && password === '123') {
                sessionStorage.setItem('aleph_demo_auth', 'true');
                window.location.href = `/${currentLocale}/profile/`;
            } else {
                showAuthNoticeModal(currentLocale, 'login');
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
