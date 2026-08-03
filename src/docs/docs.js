import { createLocaleController } from '../i18n/controller.js?v=20260703a';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

        // Live search on docs hub
    const searchInput = document.querySelector('.docs-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            const catGroups = document.querySelectorAll('.docs-cat-group');
            catGroups.forEach(group => {
                let hasMatch = false;
                const links = group.querySelectorAll('.docs-cat-link');
                links.forEach(link => {
                    const text = link.textContent.toLowerCase();
                    if (query === '' || text.includes(query)) {
                        link.style.display = '';
                        hasMatch = true;
                    } else {
                        link.style.display = 'none';
                    }
                });
                group.style.display = (query === '' || hasMatch) ? '' : 'none';
            });

            const hubCards = document.querySelectorAll('.docs-hub-card');
            hubCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = (query === '' || text.includes(query)) ? '' : 'none';
            });
        });
    }

    // Code blocks copy on click
    document.querySelectorAll('.docs-content pre').forEach(pre => {
        pre.style.cursor = 'pointer';
        pre.title = 'Click to copy snippet';
        pre.addEventListener('click', () => {
            const code = pre.textContent;
            navigator.clipboard.writeText(code).then(() => {
                const origBg = pre.style.background;
                pre.style.background = 'rgba(63, 207, 127, 0.15)';
                setTimeout(() => {
                    pre.style.background = origBg;
                }, 800);
            }).catch(() => {});
        });
    });

    
    // Track initial entry point into documentation system from non-docs page
    try {
        const currentRef = document.referrer;
        if (currentRef && !currentRef.includes('/docs/')) {
            sessionStorage.setItem('aleph_docs_entry_referrer', currentRef);
        }
    } catch (e) {}

    // Handle "Back" button click (skips internal docs history and returns to non-docs referrer)
    const backBtns = document.querySelectorAll('.hero-store-back, .docs-hub-back');
    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const entryRef = sessionStorage.getItem('aleph_docs_entry_referrer');
            if (entryRef && !entryRef.includes('/docs/')) {
                window.location.href = entryRef;
            } else {
                const currentPath = window.location.pathname;
                if (currentPath.includes('/en/')) {
                    window.location.href = '/en/';
                } else if (currentPath.includes('/ua/')) {
                    window.location.href = '/ua/';
                } else {
                    window.location.href = '/ru/';
                }
            }
        });
    });

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
