/**
 * @fileoverview Split-panel login/register modal for Aleph Studio.
 * Adapted from Delta Client for the square/ruby design language.
 *
 * @module auth/login-modal
 */

import { showAuthNoticeModal } from './modal.js?v=20260830b';
import { MESSAGES } from '../i18n/messages.js';

/** @type {(key: string) => string} */
let _t = (key) => key;

function initModalI18n() {
    const locale = /** @type {any} */ (window).__ALEPH_LOCALE__ || 'ru';
    const msgs = MESSAGES[locale]?.loginModal ?? MESSAGES.ru?.loginModal ?? {};
    _t = (key) => msgs[key] ?? MESSAGES.ru?.loginModal?.[key] ?? key;
}

function ensureModalStyles() {
    if (typeof document === 'undefined') return;
    if (document.querySelector('link[href*="auth-login-modal.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const pathDepth = window.location.pathname.replace(/^\/|\/$/g, '').split('/').filter(Boolean).length;
    const prefix = pathDepth > 0 ? '../'.repeat(pathDepth) : './';
    link.href = `${prefix}assets/css/auth-login-modal.css?v=14`;
    document.head.appendChild(link);
}

/**
 * Initialise the login modal.
 * Binds to the #navAuthBtn element and manages form switching,
 * password visibility, and choreographed entrance animations.
 */
export function initLoginModal() {
    if (typeof document === 'undefined') return;
    ensureModalStyles();
    initModalI18n();
    buildModalHTML();
    bindModalEvents();

    const trigger = document.getElementById('navAuthBtn');
    if (trigger && trigger.dataset.loginModalBound !== '1') {
        trigger.dataset.loginModalBound = '1';
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openLoginModal('login');
        }, true);
    }

    /* Split the brand text into per-character spans so each letter
       "draws" in sequence on open. */
    const brand = document.getElementById('loginLeftBrand');
    if (brand && !brand.dataset.split) {
        brand.dataset.split = '1';
        const text = brand.textContent;
        brand.textContent = '';
        [...text].forEach((ch, i) => {
            const c = document.createElement('span');
            c.className = 'login-left-brand-char';
            c.style.setProperty('--si', i);
            c.textContent = ch === ' ' ? '\u00A0' : ch;
            brand.appendChild(c);
        });
    }
}

/* ── State ────────────────────────────────────────────── */

let _forms = {};
let _currentMode = 'login';
let _backdrop = null;

function openLoginModal(mode) {
    if (typeof document === 'undefined') return;
    if (!_backdrop) {
        initModalI18n();
        buildModalHTML();
        bindModalEvents();
    }
    if (!_backdrop) return;
    Object.values(_forms).forEach((f) => {
        if (f) {
            f.classList.add('hidden');
            f.classList.remove('form-enter', 'form-exit');
        }
    });

    const target = mode || 'login';
    if (_forms[target]) _forms[target].classList.remove('hidden');
    _currentMode = target;

    if (_forms[target]) {
        _forms[target].querySelectorAll('.login-field, .login-form-header, .login-submit').forEach((el) => {
            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = '';
        });
    }

    _backdrop.classList.add('open');
    document.body.classList.add('modal-open');
}

function closeLoginModal() {
    if (!_backdrop) return;
    _backdrop.classList.remove('open');
    document.body.classList.remove('modal-open');
}

function setMode(mode) {
    if (mode === _currentMode || !_forms[mode]) return;
    const oldWrap = _forms[_currentMode];
    const newWrap = _forms[mode];

    oldWrap.classList.add('form-exit');
    setTimeout(() => {
        oldWrap.classList.add('hidden');
        oldWrap.classList.remove('form-exit');

        newWrap.classList.remove('hidden');
        newWrap.classList.add('form-enter');

        newWrap.querySelectorAll('.login-field, .login-form-header, .login-submit').forEach((el) => {
            el.style.animation = 'none';
            void el.offsetWidth;
            el.style.animation = '';
        });

        setTimeout(() => newWrap.classList.remove('form-enter'), 380);
    }, 250);

    _currentMode = mode;
}

/* ── Build DOM ──────────────────────────────────────────── */

function buildModalHTML() {
    if (document.getElementById('loginBackdrop')) return;

    const html = `
<div class="login-backdrop" id="loginBackdrop">
  <div class="login-backdrop-bg" id="loginBackdropBg"></div>
  <div class="login-modal">

    <!-- Close -->
    <button class="login-close" id="loginClose" aria-label="${_t('closeLabel')}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>

    <!-- Left panel (desktop) -->
    <div class="login-left-panel">
      <div class="login-left-overlay"></div>
      <div class="login-left-gradient"></div>
      <div class="login-left-content">
        <svg class="login-left-deco" viewBox="0 0 200 200" fill="none" aria-hidden="true">
          <rect x="10" y="10" width="180" height="180" pathLength="1" />
        </svg>
        <span class="login-left-brand" id="loginLeftBrand">Aleph Studio</span>
      </div>
    </div>

    <!-- Right panel — forms -->
    <div class="login-right-panel">

      <!-- Mobile logo -->
      <div class="login-mobile-logo">
        <span class="login-mob-sq" aria-hidden="true"></span>
        <span class="login-mobile-brand">Aleph Studio</span>
      </div>

      <!-- Login Form -->
      <div class="login-form-wrap" id="loginFormWrap">
        <div class="login-form-header anim-login-field" style="--d:0s">
          <h2 class="login-form-title">${_t('loginTitle')}</h2>
          <p class="login-form-sub">${_t('loginNoAccount')} <a class="login-switch-link" href="https://wettea.net" target="_blank" rel="noopener">${_t('loginRegisterLink')}</a></p>
        </div>
        <form class="login-form" id="loginFormEl" autocomplete="off">
          <div class="login-field anim-login-field" style="--d:0.15s">
            <label class="login-label">${_t('loginEmailLabel')}</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="3" width="18" height="18" rx="0"/><path d="M8 12h8"/></svg>
              <input type="text" name="loginOrEmail" placeholder="${_t('loginEmailPlaceholder')}" class="login-field-input">
            </div>
          </div>
          <div class="login-field anim-login-field" style="--d:0.24s">
            <div class="login-label-row">
              <label class="login-label">${_t('loginPasswordLabel')}</label>
              <a class="login-forgot-link" href="https://wettea.net" target="_blank" rel="noopener">${_t('loginForgotLink')}</a>
            </div>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" name="password" placeholder="••••••••" class="login-field-input" id="loginPassInput">
              <button type="button" class="login-eye-btn" id="loginEyeToggle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
          <div class="login-error" id="loginErrMsg"></div>
          <div class="anim-login-field" style="--d:0.4s">
            <button type="submit" class="login-submit" id="loginSubmitBtn">
              ${_t('loginSubmit')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Register Form (hidden) -->
      <div class="login-form-wrap hidden" id="loginRegisterWrap">
        <div class="login-form-header anim-login-field" style="--d:0s">
          <h2 class="login-form-title">${_t('registerTitle')}</h2>
          <p class="login-form-sub">${_t('registerHasAccount')} <button type="button" class="login-switch-link" data-switch="login">${_t('registerLoginLink')}</button></p>
        </div>
        <form class="login-form" id="loginRegisterFormEl" autocomplete="off">
          <div class="login-field anim-login-field" style="--d:0.15s">
            <label class="login-label">${_t('registerUsernameLabel')}</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="3" width="18" height="18" rx="0"/><path d="M8 12h8"/></svg>
              <input type="text" name="username" placeholder="${_t('registerUsernamePlaceholder')}" class="login-field-input">
            </div>
          </div>
          <div class="login-field anim-login-field" style="--d:0.24s">
            <label class="login-label">${_t('registerEmailLabel')}</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="2" y="4" width="20" height="16" rx="0"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" name="email" placeholder="user@example.com" class="login-field-input">
            </div>
          </div>
          <div class="login-field anim-login-field" style="--d:0.33s">
            <label class="login-label">${_t('registerPasswordLabel')}</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" name="password" placeholder="••••••••" class="login-field-input" id="regPassInput">
              <button type="button" class="login-eye-btn" id="regEyeToggle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
              </button>
            </div>
          </div>
          <div class="login-error" id="loginRegisterErrMsg"></div>
          <div class="anim-login-field" style="--d:0.45s">
            <button type="submit" class="login-submit" id="loginRegisterSubmitBtn">
              ${_t('registerSubmit')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </form>
      </div>

      <!-- Forgot Password Form (hidden) -->
      <div class="login-form-wrap hidden" id="loginForgotWrap">
        <div class="login-form-header anim-login-field" style="--d:0s">
          <h2 class="login-form-title">${_t('forgotTitle')}</h2>
          <p class="login-form-sub">${_t('forgotSub')}</p>
        </div>
        <form class="login-form" id="loginForgotFormEl" autocomplete="off">
          <div class="login-field anim-login-field" style="--d:0.15s">
            <label class="login-label">${_t('forgotEmailLabel')}</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="2" y="4" width="20" height="16" rx="0"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              <input type="email" name="email" placeholder="user@example.com" class="login-field-input">
            </div>
          </div>
          <div class="login-error" id="loginForgotErrMsg"></div>
          <div class="anim-login-field" style="--d:0.25s">
            <button type="submit" class="login-submit" id="loginForgotSubmitBtn">
              ${_t('forgotSubmit')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </form>
        <div class="anim-login-field" style="--d:0.38s">
          <p style="text-align:center;margin-top:1rem">
            <button type="button" class="login-back-link" data-switch="login">${_t('forgotBack')}</button>
          </p>
        </div>
      </div>

      <!-- 2FA Form (hidden) -->
      <div class="login-form-wrap hidden" id="login2faWrap">
        <div class="login-form-header anim-login-field" style="--d:0s">
          <h2 class="login-form-title">${_t('tfaTitle')}</h2>
          <p class="login-form-sub">${_t('tfaSub')}</p>
        </div>
        <form class="login-form" id="login2faFormEl" autocomplete="off">
          <div class="login-field anim-login-field" style="--d:0.15s">
            <label class="login-label">${_t('tfaCodeLabel')}</label>
            <div class="login-input-wrap">
              <svg class="login-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><rect x="3" y="11" width="18" height="11" rx="0"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="text" name="code" placeholder="000000" maxlength="6" class="login-field-input login-code-input">
            </div>
          </div>
          <div class="login-error" id="login2faErrMsg"></div>
          <div class="anim-login-field" style="--d:0.25s">
            <button type="submit" class="login-submit" id="login2faSubmitBtn">
              ${_t('tfaSubmit')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        </form>
        <div class="anim-login-field" style="--d:0.38s">
          <p style="text-align:center;margin-top:1rem">
            <button type="button" class="login-back-link" data-switch="login">${_t('tfaBack')}</button>
          </p>
        </div>
      </div>

    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
}


/* ── Bind Events ────────────────────────────────────────── */

function bindModalEvents() {
    _backdrop = document.getElementById('loginBackdrop');
    const backdropBg = document.getElementById('loginBackdropBg');
    const closeBtn = document.getElementById('loginClose');

    if (!_backdrop) return;

    _forms = {
        login:    document.getElementById('loginFormWrap'),
        register: document.getElementById('loginRegisterWrap'),
        forgot:   document.getElementById('loginForgotWrap'),
        twofa:    document.getElementById('login2faWrap'),
    };

    _currentMode = 'login';

    /* Expose for external use */
    window.__alephLoginModal = { open: openLoginModal, close: closeLoginModal };

    /* ── Close triggers ── */
    closeBtn?.addEventListener('click', closeLoginModal);
    backdropBg?.addEventListener('click', closeLoginModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && _backdrop.classList.contains('open')) {
            closeLoginModal();
        }
    });

    /* ── Mode switches ── */
    _backdrop.querySelectorAll('[data-switch]').forEach((btn) => {
        btn.addEventListener('click', () => setMode(btn.dataset.switch));
    });

    /* ── Password visibility toggles ── */
    function setupEyeToggle(toggleId, inputId) {
        const btn = document.getElementById(toggleId);
        const input = document.getElementById(inputId);
        if (!btn || !input) return;
        btn.addEventListener('click', () => {
            const isPass = input.type === 'password';
            input.type = isPass ? 'text' : 'password';
            btn.innerHTML = isPass
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" x2="23" y1="1" y2="23"/></svg>'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>';
        });
    }
    setupEyeToggle('loginEyeToggle', 'loginPassInput');
    setupEyeToggle('regEyeToggle', 'regPassInput');

    /* ── Form submissions ── */
    document.getElementById('loginFormEl')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const loginInput = _forms.login.querySelector('input[name="loginOrEmail"]');
        const passInput = _forms.login.querySelector('input[name="password"]');
        const credLogin = (loginInput?.value || '').trim();
        const credPass = (passInput?.value || '').trim();

        const locale = /** @type {any} */ (window).__ALEPH_LOCALE__ || 'ru';

        /* Only the demo account (test / 123) succeeds for now. */
        if (credLogin === 'test' && credPass === '123') {
            sessionStorage.setItem('aleph_demo_auth', 'true');
            window.location.href = `/${locale}/profile/`;
            return;
        }

        /* System under test: show the WetID restricted-access notice. */
        showAuthNoticeModal(locale, 'login');
    });
    document.getElementById('loginRegisterFormEl')?.addEventListener('submit', (e) => {
        e.preventDefault();
    });
    document.getElementById('loginForgotFormEl')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const errEl = document.getElementById('loginForgotErrMsg');
        if (errEl) {
            errEl.textContent = _t('forgotSuccess');
            errEl.style.color = 'rgba(80, 176, 80, 0.8)';
        }
    });
    document.getElementById('login2faFormEl')?.addEventListener('submit', (e) => {
        e.preventDefault();
    });

    /* ── 2FA code — numbers only ── */
    const codeInput = _backdrop.querySelector('.login-code-input');
    if (codeInput) {
        codeInput.addEventListener('input', () => {
            codeInput.value = codeInput.value.replace(/\D/g, '');
        });
    }
}

export { openLoginModal, closeLoginModal };

/* Global fallback: Catch any click on login triggers across the DOM */
if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
        const target = e.target instanceof Element ? e.target : null;
        if (!target) return;
        const btn = target.closest('#navAuthBtn, .nav-auth-btn, [data-open-login]');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            openLoginModal('login');
        }
    }, true);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initLoginModal(), { once: true });
    } else {
        initLoginModal();
    }
}
