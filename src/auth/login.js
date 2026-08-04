
export function initPasswordToggles() {
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
        if (btn.dataset.toggleBound === 'true') return;
        btn.dataset.toggleBound = 'true';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const input = btn.previousElementSibling || btn.parentElement.querySelector('input');
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            const eyeOff = btn.querySelector('.eye-off');
            const eyeOn = btn.querySelector('.eye-on');

            if (eyeOff && eyeOn) {
                eyeOff.style.display = isPassword ? 'none' : 'block';
                eyeOn.style.display = isPassword ? 'block' : 'none';
            }

            const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
            const locLabels = {
                ru: { show: 'Показать пароль', hide: 'Скрыть пароль' },
                en: { show: 'Show password', hide: 'Hide password' },
                ua: { show: 'Показати пароль', hide: 'Сховати пароль' }
            };
            const loc = locLabels[currentLocale] || locLabels.ru;
            const newLabel = isPassword ? loc.hide : loc.show;

            btn.setAttribute('aria-label', newLabel);
            btn.setAttribute('title', newLabel);
        });
    });
}

import { createLocaleController } from '../i18n/controller.js?v=20260703a';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';
import { showAuthNoticeModal } from './modal.js?v=1';

function boot() {
    initPasswordToggles();
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
