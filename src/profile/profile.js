import { createLocaleController } from '../i18n/controller.js?v=20260703a';
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

    // ── Aleph Trust Subscription purchase simulation ──
    const planCtaBtns = document.querySelectorAll('.plan-cta');
    planCtaBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const planName = btn.dataset.plan || 'Beth';

            const activeDurationBtn = document.querySelector('.duration-option.is-active');
            const days = activeDurationBtn ? activeDurationBtn.dataset.days : '30';

            localStorage.setItem('aleph-trust-plan', planName);
            localStorage.setItem('aleph-trust-duration', days);

            applyTrustPurchase(planName, days);

            // Close modal
            const modal = document.getElementById('pricingModal');
            if (modal) {
                modal.classList.remove('is-open');
                document.body.classList.remove('modal-open');
            }
        });
    });

    function applyTrustPurchase(plan, duration) {
        // 1. Show the sidebar tab for Aleph Trust
        const sidebarTab = document.getElementById('sidebarAlephTrust');
        if (sidebarTab) {
            sidebarTab.style.display = 'flex';
        }

        // 2. Update active license card under overview section
        const licenseNameNode = document.querySelector('#overview .license-card.merged-card .license-name');
        if (licenseNameNode) {
            licenseNameNode.textContent = 'Aleph Trust';
        }

        const locale = window.__ALEPH_LOCALE__ || 'ru';
        const typeLabels = {
            ru: 'Тип: <b>Персональная лицензия - ' + plan + '</b>',
            en: 'Type: <b>Personal license - ' + plan + '</b>',
            ua: 'Тип: <b>Персональна ліцензія - ' + plan + '</b>'
        };
        const licenseDetailsSpan = document.querySelector('#overview .license-card.merged-card .license-details span:first-child');
        if (licenseDetailsSpan) {
            licenseDetailsSpan.innerHTML = typeLabels[locale] || typeLabels.ru;
        }

        const licenseButton = document.querySelector('#overview .license-card.merged-card .license-actions a');
        if (licenseButton) {
            licenseButton.href = '../products/aleph-trust/';
        }

        const ringNum = document.querySelector('#overview .license-card.merged-card .progress-ring .ring-label .num');
        if (ringNum) {
            ringNum.textContent = duration;
        }
        
        const ringUnit = document.querySelector('#overview .license-card.merged-card .progress-ring .ring-label .unit');
        if (ringUnit) {
            const units = { ru: 'д', en: 'd', ua: 'д' };
            ringUnit.textContent = units[locale] || 'd';
        }

        const ringBar = document.getElementById('ringBar');
        if (ringBar) {
            const r = 27;
            const c = 2 * Math.PI * r;
            ringBar.style.strokeDasharray = c;
            ringBar.style.strokeDashoffset = '0'; // 100% full
        }

        // 3. Update the inner details of the Aleph Trust control panel tab
        const trustPlanNameNode = document.getElementById('trustPlanName');
        if (trustPlanNameNode) {
            trustPlanNameNode.textContent = plan;
        }

        const trustSessionsLimitNode = document.getElementById('trustSessionsLimit');
        const trustInstancesLimitNode = document.getElementById('trustInstancesLimit');
        if (plan === 'Beth') {
            if (trustSessionsLimitNode) trustSessionsLimitNode.textContent = '100';
            if (trustInstancesLimitNode) trustInstancesLimitNode.textContent = '3';
        } else if (plan === 'Gimel') {
            if (trustSessionsLimitNode) trustSessionsLimitNode.textContent = '500';
            if (trustInstancesLimitNode) trustInstancesLimitNode.textContent = '20';
        } else { // Dalet
            if (trustSessionsLimitNode) trustSessionsLimitNode.textContent = '2000';
            if (trustInstancesLimitNode) trustInstancesLimitNode.textContent = '∞';
        }
    }

    const savedPlan = localStorage.getItem('aleph-trust-plan');
    const savedDuration = localStorage.getItem('aleph-trust-duration') || '30';
    if (savedPlan) {
        applyTrustPurchase(savedPlan, savedDuration);
    }
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
                    const locale = window.__ALEPH_LOCALE__ || 'ru';
                    const messages = {
                        ru: 'Скопировано в буфер обмена!',
                        en: 'Copied to clipboard!',
                        ua: 'Скопійовано в буфер обміну!'
                    };
                    if (window.__alephToast) {
                        window.__alephToast(messages[locale] || messages.en, 'info');
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
