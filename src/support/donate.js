import { initReveal } from '../components/reveal.js';
import { $, createElement } from '../core/dom.js';
import { localizeSiteData } from '../data/localized-site-data.js';
import { createLocaleController } from '../i18n/controller.js';
import {
    getAdminHref,
    getEffectiveSiteData,
    initAdminRouteAccess,
    initSharedThemeToggle,
    initSmoothRouteTransitions,
} from '../core/site-shell.js';

const COPY = Object.freeze({
    ru: {
        metaTitle: 'Strange Visuals — Поддержать',
        backLabel: 'Назад к Strange Visuals',
        eyebrow: 'Поддержать проект',
        titleHtml: 'Поддержка<br><em>проекта</em>',
        introLead: 'Поддерживая нас от ',
        introMiddle: 'вы получаете роль ',
        introAfterRole: 'на нашем ',
        discordLabel: 'Discord-сервере',
        introTail: ' и ваш профиль появится на сайте — достаточно указать свой Discord-логин при покупке или донате.',
        paymentsTitle: 'Способы поддержки',
        paymentsDesc: 'Выберите удобный способ поддержки проекта и команды.',
        topTitle: 'Общий топ 3',
        topDesc: 'Чем выше сумма, тем сильнее золотое сияние карточки.',
        supportersTitle: 'Поддержали нас',
        supportersEmpty: 'Пока никто не поддержал проект. Когда появятся первые донаты, карточки покажутся здесь.',
        buttonsEmpty: 'Скоро здесь появятся доступные способы поддержки.',
    },
    en: {
        metaTitle: 'Strange Visuals — Support',
        backLabel: 'Back to Strange Visuals',
        eyebrow: 'Support the project',
        titleHtml: 'Support<br><em>the project</em>',
        introLead: 'By supporting us from ',
        introMiddle: 'you get the ',
        introAfterRole: 'role on our ',
        discordLabel: 'Discord server',
        introTail: ' and your profile will appear on the site — just specify your Discord login when donating or buying support.',
        paymentsTitle: 'Support methods',
        paymentsDesc: 'Choose a convenient way to support the project and the team.',
        topTitle: 'Overall top 3',
        topDesc: 'The higher the amount, the stronger the golden glow of the card.',
        supportersTitle: 'Supported us',
        supportersEmpty: 'Nobody has supported the project yet. Cards will appear here once the first donations are added.',
        buttonsEmpty: 'Available support methods will appear here soon.',
    },
    ua: {
        metaTitle: 'Strange Visuals — Підтримати',
        backLabel: 'Назад до Strange Visuals',
        eyebrow: 'Підтримати проєкт',
        titleHtml: 'Підтримка<br><em>проєкту</em>',
        introLead: 'Підтримуючи нас від ',
        introMiddle: 'ви отримуєте роль ',
        introAfterRole: 'на нашому ',
        discordLabel: 'Discord-сервері',
        introTail: ' і ваш профіль зʼявиться на сайті — достатньо вказати свій Discord-логін під час покупки або донату.',
        paymentsTitle: 'Способи підтримки',
        paymentsDesc: 'Оберіть зручний спосіб підтримати проєкт і команду.',
        topTitle: 'Загальний топ 3',
        topDesc: 'Що більша сума, то сильніше золотаве сяйво картки.',
        supportersTitle: 'Підтримали нас',
        supportersEmpty: 'Поки ніхто не підтримав проєкт. Картки зʼявляться тут після перших донатів.',
        buttonsEmpty: 'Незабаром тут зʼявляться доступні способи підтримки.',
    },
});

function getCopy(locale) {
    return COPY[locale] || COPY.ru;
}

function getElements() {
    return {
        donateBackLabel: $('donateBackLabel'),
        donateEyebrow: $('donateEyebrow'),
        donateTitle: $('donateTitle'),
        donateDesc: $('donateDesc'),
        paymentsTitle: $('paymentsTitle'),
        paymentsDesc: $('paymentsDesc'),
        supportButtonsGrid: $('supportButtonsGrid'),
        topSupportersSection: $('topSupportersSection'),
        topSupportersTitle: $('topSupportersTitle'),
        topSupportersDesc: $('topSupportersDesc'),
        topSupportersGrid: $('topSupportersGrid'),
        supportersTitle: $('supportersTitle'),
        supporterCount: $('supporterCount'),
        supportersGrid: $('supportersGrid'),
    };
}

function resolveAsset(path) {
    const value = String(path || '').trim();
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
    const cleaned = value.replace(/^\.\//, '').replace(/^\/+/, '');
    return new URL(`../../../../${cleaned}`, window.location.href).toString();
}

function resolveButtonUrl(path) {
    const value = String(path || '').trim();
    if (!value) return '';
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(value)) return value;
    if (/^(?:\/|\.{1,2}\/)/.test(value)) return new URL(value, window.location.href).toString();
    return `https://${value.replace(/^\/+/, '')}`;
}

function initials(name) {
    return String(name || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'A';
}

function formatUsd(value) {
    const amount = Number(value) || 0;
    const fixed = Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    return `$${fixed}`;
}

function sortButtons(buttons, locale) {
    return [...(Array.isArray(buttons) ? buttons : [])].sort((a, b) => {
        const bySort = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        if (bySort !== 0) return bySort;
        return String(a.title || '').localeCompare(String(b.title || ''), locale === 'ua' ? 'uk' : locale);
    });
}

function sortSupporters(supporters, locale) {
    return [...(Array.isArray(supporters) ? supporters : [])].sort((a, b) => {
        const byAmount = Number(b.amountUsd || 0) - Number(a.amountUsd || 0);
        if (byAmount !== 0) return byAmount;
        const bySort = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
        if (bySort !== 0) return bySort;
        return String(a.name || '').localeCompare(String(b.name || ''), locale === 'ua' ? 'uk' : locale);
    });
}

function createEmptyState(text) {
    return createElement('div', { className: 'empty-state' }, text);
}

function buildIntro(container, copy, minimumAmountUsd, roleName, discordUrl) {
    if (!container) return;
    container.textContent = '';

    container.append(
        document.createTextNode(copy.introLead),
        createElement('strong', { textContent: `${formatUsd(minimumAmountUsd)} ` }),
        document.createTextNode(copy.introMiddle),
        createElement('strong', { textContent: `${roleName || '@Premium'} ` }),
        document.createTextNode(copy.introAfterRole),
    );

    if (discordUrl) {
        container.append(
            createElement('a', {
                href: discordUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
                textContent: copy.discordLabel,
            }),
        );
    } else {
        container.append(document.createTextNode(copy.discordLabel));
    }

    container.append(document.createTextNode(copy.introTail));
}

function createPaymentCard(button) {
    const href = resolveButtonUrl(button.url);
    if (!href) return null;

    const tag = 'a';
    const attrs = {
        className: 'pay-btn',
    };

    attrs.href = href;
    if (/^(?:https?:)?\/\//i.test(href)) {
        attrs.target = '_blank';
        attrs.rel = 'noopener noreferrer';
    }

    const card = createElement(tag, attrs);
    card.append(
        createElement('span', { className: 'pay-btn-label', textContent: button.label || 'Support' }),
        createElement('span', { className: 'pay-btn-name', textContent: button.title || 'Support' }),
        createElement('span', { className: 'pay-btn-note', textContent: button.note || '' }),
        createElement(
            'span',
            { className: 'pay-btn-arrow' },
            createElement('span', { className: 'material-icons', textContent: 'arrow_outward' }),
        ),
    );
    return card;
}

function renderPaymentButtons(container, buttons, copy, locale) {
    if (!container) return;
    container.textContent = '';

    const sorted = sortButtons(buttons, locale).filter((button) => Boolean(resolveButtonUrl(button.url)));
    if (!sorted.length) {
        container.append(createEmptyState(copy.buttonsEmpty));
        return;
    }

    sorted.forEach((button) => {
        const card = createPaymentCard(button);
        if (card) container.append(card);
    });
}

function createAvatar(supporter) {
    const avatar = createElement('div', { className: 'support-avatar' });
    const src = resolveAsset(supporter.avatarUrl || '');
    if (src) {
        avatar.append(createElement('img', {
            src,
            alt: supporter.name || 'Supporter avatar',
            loading: 'lazy',
        }));
        return avatar;
    }
    avatar.textContent = initials(supporter.name);
    return avatar;
}

function createSupportCard(supporter, { rank = 0, maxAmount = 0, top = false } = {}) {
    const amount = Number(supporter.amountUsd || 0);
    const normalized = maxAmount > 0 ? amount / maxAmount : 0;
    const card = createElement('article', {
        className: `support-card${top ? ' is-top' : ''}`,
    });

    card.style.setProperty('--support-glow', String((0.06 + normalized * 0.26).toFixed(2)));
    card.style.setProperty('--support-border', String((0.18 + normalized * 0.48).toFixed(2)));
    card.style.setProperty('--support-line', String((0.08 + normalized * 0.24).toFixed(2)));

    if (rank > 0) {
        card.append(createElement('div', { className: 'support-rank' }, `#${rank}`));
    }

    card.append(
        createAvatar(supporter),
        createElement('div', { className: 'support-name', textContent: supporter.name || 'Supporter' }),
        createElement('div', { className: 'support-amount', textContent: formatUsd(amount) }),
    );

    return card;
}

function renderSupporters(elements, supporters, copy, locale) {
    const sorted = sortSupporters(supporters, locale);
    const maxAmount = sorted.reduce((max, item) => Math.max(max, Number(item.amountUsd || 0)), 0);

    if (elements.supporterCount) {
        elements.supporterCount.textContent = String(sorted.length);
    }

    if (!elements.supportersGrid) return;
    elements.supportersGrid.textContent = '';

    if (!sorted.length) {
        elements.supportersGrid.append(createEmptyState(copy.supportersEmpty));
        if (elements.topSupportersSection) elements.topSupportersSection.hidden = true;
        return;
    }

    sorted.forEach((supporter, index) => {
        elements.supportersGrid.append(createSupportCard(supporter, {
            rank: index < 3 ? index + 1 : 0,
            maxAmount,
        }));
    });

    if (!elements.topSupportersSection || !elements.topSupportersGrid) return;

    const topThree = sorted.slice(0, 3);
    if (!topThree.length) {
        elements.topSupportersSection.hidden = true;
        return;
    }

    elements.topSupportersSection.hidden = false;
    elements.topSupportersGrid.textContent = '';
    topThree.forEach((supporter, index) => {
        elements.topSupportersGrid.append(createSupportCard(supporter, {
            rank: index + 1,
            maxAmount,
            top: true,
        }));
    });
}

function applyStaticCopy(elements, copy) {
    document.title = copy.metaTitle;
    if (elements.donateBackLabel) elements.donateBackLabel.textContent = copy.backLabel;
    if (elements.donateEyebrow) elements.donateEyebrow.textContent = copy.eyebrow;
    if (elements.donateTitle) elements.donateTitle.innerHTML = copy.titleHtml;
    if (elements.paymentsTitle) elements.paymentsTitle.textContent = copy.paymentsTitle;
    if (elements.paymentsDesc) elements.paymentsDesc.textContent = copy.paymentsDesc;
    if (elements.topSupportersTitle) elements.topSupportersTitle.textContent = copy.topTitle;
    if (elements.topSupportersDesc) elements.topSupportersDesc.textContent = copy.topDesc;
    if (elements.supportersTitle) elements.supportersTitle.textContent = copy.supportersTitle;
}

function boot() {
    const localeController = createLocaleController();
    const locale = localeController.locale;
    const copy = getCopy(locale);
    const siteData = localizeSiteData(getEffectiveSiteData(), locale);
    const elements = getElements();
    const supportPage = siteData.supportPage || { minimumAmountUsd: 2, roleName: '@Premium', buttons: [], supporters: [] };

    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();
    initAdminRouteAccess({ adminHref: getAdminHref() });
    initSmoothRouteTransitions();

    applyStaticCopy(elements, copy);
    buildIntro(elements.donateDesc, copy, Number(supportPage.minimumAmountUsd || 2), supportPage.roleName || '@Premium', resolveButtonUrl(siteData.socials?.discord || ''));
    renderPaymentButtons(elements.supportButtonsGrid, supportPage.buttons, copy, locale);
    renderSupporters(elements, supportPage.supporters, copy, locale);
    initReveal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
