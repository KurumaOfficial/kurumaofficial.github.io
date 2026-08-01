import { createLocaleController } from '../i18n/controller.js?v=20260703a';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
    if (sessionStorage.getItem('aleph_demo_auth') !== 'true') {
        window.location.href = `/${currentLocale}/auth/login/`;
        return;
    }

    document.querySelectorAll('.logout-btn, #logoutBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('aleph_demo_auth');
            window.location.href = `/${currentLocale}/auth/login/`;
        });
    });

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

    // Define global helpers for Aleph Trust Dashboard navigation and settings
    window.atNav = function(el, pageId) {
        const parent = el.closest('.at-app');
        if (!parent) return;
        parent.querySelectorAll('.at-nav-item').forEach(n => n.classList.remove('active'));
        el.classList.add('active');
        parent.querySelectorAll('.at-page').forEach(p => p.classList.remove('active'));
        
        const targetPage = parent.querySelector('#page-' + pageId);
        if (targetPage) targetPage.classList.add('active');
    };

    window.atSetRole = function(role) {
        const activeSection = document.getElementById('aleph-trust');
        if (!activeSection) return;
        
        const btnAdmin = activeSection.querySelector('#btn-admin');
        const btnPlayer = activeSection.querySelector('#btn-player');
        const appAdmin = activeSection.querySelector('#app-admin');
        const appPlayer = activeSection.querySelector('#app-player');

        if (btnAdmin) btnAdmin.classList.toggle('active', role === 'admin');
        if (btnPlayer) btnPlayer.classList.toggle('active', role === 'player');
        if (appAdmin) appAdmin.style.display = role === 'admin' ? 'flex' : 'none';
        if (appPlayer) appPlayer.style.display = role === 'player' ? 'flex' : 'none';
    };

    window.atSetAccessMode = function(el, idx) {
        const activeSection = document.getElementById('aleph-trust');
        if (!activeSection) return;
        el.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
        
        const descNode = activeSection.querySelector('#access-desc');
        const locale = window.__ALEPH_LOCALE__ || 'ru';
        const accessDescriptions = {
            ru: [
                "Игрок допускается при чистом лаунчере без модификаций. Привязка WetID не требуется — самый низкий барьер входа, обход возможен переустановкой лаунчера.",
                "Игрок обязан войти в WetID-аккаунт. Бан на этом уровне требует создания нового WetID для обхода — умеренный барьер.",
                "Требуется WetID с верифицированным паспортом/документом. Обход практически невозможен без создания новой цифровой личности — максимальный барьер."
            ],
            en: [
                "Player is admitted with a clean launcher without modifications. WetID link is not required — lowest barrier to entry, bypass possible by reinstalling launcher.",
                "Players must sign in with a WetID account. Banning at this level requires creating a new WetID — moderate barrier.",
                "WetID with verified passport/document is required. Bypass is practically impossible without creating a new digital identity — maximum barrier."
            ],
            ua: [
                "Гравець допускається при чистому лаунчері без модифікацій. Прив'язка WetID не потрібна — найнижчий бар'єр входу, обход можливий переустановкою лаунчера.",
                "Гравець зобов'язаний увійти у WetID-акаунт. Бан на цьому рівні вимагає створення нового WetID для обходу — помірний бар'єр.",
                "Необхідний WetID з верифікованим паспортом/документом. Обхід практично неможливий без створення нової цифрової особистості — максимальний бар'єр."
            ]
        }[locale] || accessDescriptions.ru;
        if (descNode) descNode.textContent = accessDescriptions[idx];
    };

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
            const units = { ru: 'дн', en: 'd', ua: 'дн' };
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

        // 4. Update billing info inside Aleph Trust control panel
        const billingPlanName = document.getElementById('trustBillingPlanName');
        if (billingPlanName) billingPlanName.textContent = plan;

        const billingPlanLimit = document.getElementById('trustBillingPlanLimit');
        const billingOnline = document.getElementById('trustBillingOnline');
        const adminOnlineCount = document.getElementById('adminOnlineCount');

        const billingDetails = {
            ru: {
                Beth: { limit: 'до 100 онлайн · $19/мес', online: '87 / 100', count: '87' },
                Gimel: { limit: 'до 500 онлайн · $49/мес', online: '342 / 500', count: '342' },
                Dalet: { limit: 'Enterprise · от $199/мес', online: '1 280 / 2 000', count: '1280' }
            },
            en: {
                Beth: { limit: 'up to 100 online · $19/mo', online: '87 / 100', count: '87' },
                Gimel: { limit: 'up to 500 online · $49/mo', online: '342 / 500', count: '342' },
                Dalet: { limit: 'Enterprise · from $199/mo', online: '1,280 / 2,000', count: '1280' }
            },
            ua: {
                Beth: { limit: 'до 100 онлайн · $19/міс', online: '87 / 100', count: '87' },
                Gimel: { limit: 'до 500 онлайн · $49/міс', online: '342 / 500', count: '342' },
                Dalet: { limit: 'Enterprise · від $199/міс', online: '1 280 / 2 000', count: '1280' }
            }
        }[locale] || billingDetails.ru;

        const pData = billingDetails[plan];
        if (pData) {
            if (billingPlanLimit) billingPlanLimit.textContent = pData.limit;
            if (billingOnline) billingOnline.textContent = pData.online;
            if (adminOnlineCount) adminOnlineCount.textContent = pData.count;
        }

        // 5. Draw connections bar chart
        const chart = document.getElementById('chart-connections');
        if (chart) {
            chart.innerHTML = '';
            const allowed = [1720, 1830, 1690, 1980, 2100, 2350, 1942];
            const denied  = [38, 41, 29, 52, 47, 60, 54];
            const maxV = Math.max(...allowed);
            allowed.forEach((v, i) => {
                const wrap = document.createElement('div');
                wrap.className = 'at-bar-wrap';

                const dBar = document.createElement('div');
                dBar.className = 'at-bar denied';
                dBar.style.height = Math.max(2, (denied[i] / maxV) * 75) + 'px';
                dBar.title = denied[i] + ' rejected';

                const aBar = document.createElement('div');
                aBar.className = 'at-bar';
                aBar.style.height = Math.max(2, (v / maxV) * 75) + 'px';
                aBar.title = v + ' allowed';

                wrap.appendChild(dBar);
                wrap.appendChild(aBar);
                chart.appendChild(wrap);
            });
        }

        // 6. Draw logs table
        const logsTable = document.getElementById('logs-table');
        if (logsTable) {
            logsTable.innerHTML = '';
            const logNames = ['Steve_1337', 'nordic_wolf', 'quietfox22', 'xXx_Diamond_xXx', 'FrostyPine', 'Vantablack', 'ember_lynx', 'Cobalt99', 'driftwood', 'Nyx_Shade'];
            const results = ['allowed', 'allowed', 'allowed', 'denied', 'allowed', 'flagged', 'allowed', 'allowed', 'denied', 'allowed'];
            
            const reasons = {
                ru: {
                    allowed: ['Проверка пройдена', 'WetID подтверждён', 'Whitelist'],
                    denied: ['Unverified mod detected', 'Хэндшейк не пройден', 'Blacklist WetID'],
                    flagged: ['Низкий Trust Score (34)', 'Подозрение на модификацию']
                },
                en: {
                    allowed: ['Check passed', 'WetID verified', 'Whitelist'],
                    denied: ['Unverified mod detected', 'Handshake failed', 'Blacklist WetID'],
                    flagged: ['Low Trust Score (34)', 'Suspicion of modification']
                },
                ua: {
                    allowed: ['Перевірка пройдена', 'WetID підтверджено', 'Whitelist'],
                    denied: ['Unverified mod detected', 'Хендшейк не пройдено', 'Blacklist WetID'],
                    flagged: ['Низький Trust Score (34)', 'Підозра на модифікацію']
                }
            }[locale] || reasons.ru;

            for (let i = 0; i < 10; i++) {
                const r = results[i];
                const time = new Date(Date.now() - i * 1000 * 60 * 17);
                const timeStr = time.toTimeString().slice(0, 5);
                const reasonList = reasons[r];
                const reason = reasonList[Math.floor(Math.random() * reasonList.length)];
                const wetid = r === 'denied' && Math.random() > 0.5 ? '—' : logNames[i].toLowerCase();
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="mono dim">${timeStr}</td>
                    <td>${logNames[i]}</td>
                    <td class="mono dim">${wetid}</td>
                    <td><span class="at-badge ${r}">${r}</span></td>
                    <td class="dim">${reason}</td>
                `;
                logsTable.appendChild(row);
            }
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

    // ── Intermittent Re-Authentication Interactive Controller ──
    const reauthToggleWrap = document.getElementById('reauthToggleWrap');
    const reauthToggleBtn = document.getElementById('reauthToggleBtn');
    const reauthToggleState = document.getElementById('reauthToggleState');
    const reauthSettingsGrid = document.getElementById('reauthSettingsGrid');
    const reauthSaveBtn = document.getElementById('reauthSaveBtn');
    const reauthTestPromptBtn = document.getElementById('reauthTestPromptBtn');
    const reauthPasscodeInput = document.getElementById('reauthPasscodeInput');

    const reauthPromptModal = document.getElementById('reauthPromptModal');
    const reauthPromptForm = document.getElementById('reauthPromptForm');
    const reauthModalCodeInput = document.getElementById('reauthModalCodeInput');
    const reauthModalErrorMsg = document.getElementById('reauthModalErrorMsg');

    const reauth2faModal = document.getElementById('reauth2faModal');
    const reauth2faForm = document.getElementById('reauth2faForm');
    const reauth2faInput = document.getElementById('reauth2faInput');

    let reauthEnabled = localStorage.getItem('aleph_reauth_enabled') === 'true';
    let masterPasscode = localStorage.getItem('aleph_reauth_code') || '123456';
    let pendingAction = null;

    function updateReauthUi() {
        if (!reauthToggleBtn || !reauthToggleState || !reauthSettingsGrid || !reauthSaveBtn) return;

        const currentLocale = window.__ALEPH_LOCALE__ || 'ru';
        const labels = {
            ru: { on: 'ВКЛ', off: 'ВЫКЛ' },
            en: { on: 'ON', off: 'OFF' },
            ua: { on: 'УВІМК', off: 'ВИМК' }
        }[currentLocale] || { on: 'ON', off: 'OFF' };

        if (reauthEnabled) {
            reauthToggleBtn.classList.add('is-on');
            reauthToggleState.textContent = labels.on;
            reauthToggleState.style.color = 'var(--green)';
            reauthSettingsGrid.style.opacity = '1';
            reauthSettingsGrid.style.pointerEvents = 'auto';
            reauthSaveBtn.disabled = false;
        } else {
            reauthToggleBtn.classList.remove('is-on');
            reauthToggleState.textContent = labels.off;
            reauthToggleState.style.color = 'var(--text-secondary)';
            reauthSettingsGrid.style.opacity = '0.4';
            reauthSettingsGrid.style.pointerEvents = 'none';
            reauthSaveBtn.disabled = true;
        }
    }

    updateReauthUi();

    if (reauthToggleWrap) {
        reauthToggleWrap.addEventListener('click', () => {
            pendingAction = 'toggle';
            openModal(reauth2faModal);
        });
    }

    if (reauthSaveBtn) {
        reauthSaveBtn.addEventListener('click', () => {
            if (!reauthEnabled) return;
            pendingAction = 'save';
            openModal(reauth2faModal);
        });
    }

    if (reauth2faForm) {
        reauth2faForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const code = reauth2faInput.value.trim();
            if (code.length >= 6) {
                closeModal(reauth2faModal);
                reauth2faInput.value = '';

                if (pendingAction === 'toggle') {
                    reauthEnabled = !reauthEnabled;
                    localStorage.setItem('aleph_reauth_enabled', String(reauthEnabled));
                    updateReauthUi();
                } else if (pendingAction === 'save') {
                    if (reauthPasscodeInput && reauthPasscodeInput.value) {
                        masterPasscode = reauthPasscodeInput.value.trim();
                        localStorage.setItem('aleph_reauth_code', masterPasscode);
                    }
                    const btn = reauthSaveBtn;
                    const orig = btn.textContent;
                    btn.textContent = '✓';
                    btn.style.background = 'var(--green)';
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.style.background = '';
                    }, 1500);
                }
                pendingAction = null;
            }
        });
    }

    function triggerReauthPrompt() {
        if (!reauthPromptModal) return;
        if (reauthModalErrorMsg) reauthModalErrorMsg.style.display = 'none';
        if (reauthModalCodeInput) {
            reauthModalCodeInput.value = '';
            setTimeout(() => reauthModalCodeInput.focus(), 150);
        }
        openModal(reauthPromptModal);
    }

    if (reauthTestPromptBtn) {
        reauthTestPromptBtn.addEventListener('click', () => {
            triggerReauthPrompt();
        });
    }

    if (reauthPromptForm) {
        reauthPromptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputCode = reauthModalCodeInput.value.trim();
            if (inputCode === masterPasscode || inputCode === '123456') {
                closeModal(reauthPromptModal);
                if (reauthModalErrorMsg) reauthModalErrorMsg.style.display = 'none';
                reauthModalCodeInput.value = '';
            } else {
                if (reauthModalErrorMsg) reauthModalErrorMsg.style.display = 'block';
            }
        });
    }

    menuItems.forEach((item) => {
        item.addEventListener('click', () => {
            const targetSectionId = item.dataset.target;
            if (!reauthEnabled) return;

            const trigTrust = document.getElementById('reauthTriggerTrust')?.checked;
            const trigSec = document.getElementById('reauthTriggerSecurity')?.checked;
            const trigStore = document.getElementById('reauthTriggerStore')?.checked;

            if (
                (targetSectionId === 'aleph-trust' && trigTrust) ||
                (targetSectionId === 'security' && trigSec) ||
                (targetSectionId === 'licenses' && trigStore)
            ) {
                triggerReauthPrompt();
            }
        });
    });

    function openModal(m) {
        if (!m) return;
        m.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        m.style.visibility = 'visible';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                m.classList.add('is-open');
            });
        });
    }

    function closeModal(m) {
        if (!m) return;
        m.classList.remove('is-open');
        m.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            if (!m.classList.contains('is-open')) {
                m.style.visibility = '';
            }
        }, 350);
    }

    document.querySelectorAll('#reauthPromptCloseBtn, #reauthPromptBackdrop').forEach(b => {
        b?.addEventListener('click', () => closeModal(reauthPromptModal));
    });
    document.querySelectorAll('#reauth2faCloseBtn, #reauth2faBackdrop').forEach(b => {
        b?.addEventListener('click', () => closeModal(reauth2faModal));
    });

    initReveal([document.getElementById('main')].filter(Boolean));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
