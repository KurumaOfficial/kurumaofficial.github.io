/**
 * @fileoverview Custom modal dialog for WetID maintenance / restricted access notices.
 * Adheres strictly to Aleph Studio design rules: sharp square corners, zero border-radius, zero circles.
 */

export function showAuthNoticeModal(locale = 'ru', mode = 'login') {
    let modal = document.getElementById('authNoticeModal');

    const texts = {
        ru: {
            badge: 'WetID Security System',
            title: mode === 'register' ? 'Регистрация временно ограничена' : 'Ограничение доступа WetID',
            body: 'Серверы системы авторизации <strong>WetID</strong> временно находятся в режиме ограниченного доступа. Полноценная возможность регистрации и входа будет открыта в ближайшем релизе.',
            button: 'Понятно'
        },
        en: {
            badge: 'WetID Security System',
            title: mode === 'register' ? 'Registration Temporarily Restricted' : 'WetID Access Restricted',
            body: 'The <strong>WetID</strong> authentication servers are operating in restricted access mode. Full registration and login capabilities will be enabled in the upcoming release.',
            button: 'Got it'
        },
        ua: {
            badge: 'WetID Security System',
            title: mode === 'register' ? 'Реєстрація тимчасово обмежена' : 'Обмеження доступу WetID',
            body: 'Сервери системи авторизації <strong>WetID</strong> тимчасово перебувають у режимі обмеженого доступу. Повноцінна можливість реєстрації та входу буде відкрита у найближчому релізі.',
            button: 'Зрозуміло'
        }
    };

    const copy = texts[locale] || texts.ru;

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'authNoticeModal';
        modal.className = 'auth-modal';
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="auth-modal-backdrop" id="authNoticeBackdrop"></div>
            <div class="auth-modal-box" role="dialog" aria-modal="true">
                <div class="auth-modal-head">
                    <span class="auth-modal-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>
                        <span>${copy.badge}</span>
                    </span>
                    <button class="auth-modal-close" id="authModalCloseBtn" type="button" aria-label="Close">✕</button>
                </div>
                <h2 class="auth-modal-title" id="authModalTitle">${copy.title}</h2>
                <div class="auth-modal-body" id="authModalBody">${copy.body}</div>
                <div class="auth-modal-footer">
                    <button class="auth-modal-btn" id="authModalOkBtn" type="button">${copy.button}</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const close = () => {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('modal-open');
        };

        modal.querySelector('#authModalCloseBtn')?.addEventListener('click', close);
        modal.querySelector('#authModalOkBtn')?.addEventListener('click', close);
        modal.querySelector('#authNoticeBackdrop')?.addEventListener('click', close);
    } else {
        const titleEl = modal.querySelector('#authModalTitle');
        const bodyEl = modal.querySelector('#authModalBody');
        if (titleEl) titleEl.textContent = copy.title;
        if (bodyEl) bodyEl.innerHTML = copy.body;
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
        });
    });
}
