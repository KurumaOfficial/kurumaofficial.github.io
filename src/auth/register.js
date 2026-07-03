import { createLocaleController } from '../i18n/controller.js';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    // Mock Register Action
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agree = document.getElementById('agree').checked;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            if (!agree) {
                alert("You must agree to the Terms of Service!");
                return;
            }
            
            alert(`[Mock Register] Attempting registration for Username: ${username}, Email: ${email}`);
            // Redirect to profile
            const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
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
