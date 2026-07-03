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
    // ── Document Sub-Tab Switcher ──────────────────────
    const docTabBtns = document.querySelectorAll('.docs-tab-btn');
    const docTabPanes = document.querySelectorAll('.doc-tab-pane');

    docTabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetDoc = btn.dataset.doc;
            if (!targetDoc) return;

            docTabBtns.forEach((b) => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            docTabPanes.forEach((pane) => {
                pane.classList.remove('active');
                if (pane.id === `doc-${targetDoc}`) {
                    pane.classList.add('active');
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

    // ── Click to Copy for Info Rows ─────────────────────
    document.querySelectorAll('.info-row.copyable').forEach((row) => {
        row.addEventListener('click', () => {
            const val = row.dataset.copy;
            if (!val) return;

            navigator.clipboard.writeText(val)
                .then(() => {
                    const hint = row.querySelector('.copy-hint');
                    if (hint) {
                        const original = hint.textContent;
                        hint.textContent = '✓';
                        hint.style.color = 'var(--green)';
                        setTimeout(() => {
                            hint.textContent = original;
                            hint.style.color = '';
                        }, 1500);
                    }
                })
                .catch(() => {});
        });
    });

    // ── Avatar Upload Picker ───────────────────────────
    const avatarBtn = document.getElementById('avatarBtn');
    const avatarInput = document.getElementById('avatarInput');
    const avatarImg = document.getElementById('avatarImg');

    if (avatarBtn && avatarInput && avatarImg) {
        avatarBtn.addEventListener('click', (e) => {
            // Prevent event bubbles from nested elements if they fire click
            if (e.target !== avatarInput) {
                avatarInput.click();
            }
        });

        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    avatarImg.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
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
