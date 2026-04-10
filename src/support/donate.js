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
        topDesc: '',
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
        topDesc: '',
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
        topDesc: '',
        supportersTitle: 'Підтримали нас',
        supportersEmpty: 'Поки ніхто не підтримав проєкт. Картки зʼявляться тут після перших донатів.',
        buttonsEmpty: 'Незабаром тут зʼявляться доступні способи підтримки.',
    },
});

const TIER_COPY = Object.freeze({
    ru: {
        premium: 'Premium',
        gold: 'Gold',
        royalGold: 'Royal Gold',
        mythicGold: 'Mythic Gold',
        platinum: 'Темная Платина',
    },
    en: {
        premium: 'Premium',
        gold: 'Gold',
        royalGold: 'Royal Gold',
        mythicGold: 'Mythic Gold',
        platinum: 'Dark Platinum',
    },
    ua: {
        premium: 'Premium',
        gold: 'Gold',
        royalGold: 'Royal Gold',
        mythicGold: 'Mythic Gold',
        platinum: 'Темна Платина',
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

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getTierCopy(locale) {
    return TIER_COPY[locale] || TIER_COPY.ru;
}

function hueFromName(name) {
    let hue = 0;
    for (let index = 0; index < String(name || '').length; index += 1) {
        hue = (hue * 31 + String(name).charCodeAt(index)) & 0xffffffff;
    }
    return Math.abs(hue) % 360;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function lerp(start, end, progress) {
    return start + (end - start) * progress;
}

function mapRange(value, inputMin, inputMax, outputMin, outputMax) {
    const progress = clamp((value - inputMin) / (inputMax - inputMin), 0, 1);
    return lerp(outputMin, outputMax, progress);
}

function roundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
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

function getDonorStyle(amount, locale) {
    const tierCopy = getTierCopy(locale);

    if (amount >= 1000) {
        return {
            kind: 'platinum',
            title: tierCopy.platinum,
            icon: 'diamond',
            glow: 1,
            aura: 1,
            cometCount: Math.round(mapRange(amount, 1000, 5000, 5, 12)),
            starCount: Math.round(mapRange(amount, 1000, 5000, 18, 42)),
            ring: true,
            goldCount: 0,
            sparkCount: 0,
            showMark: true,
        };
    }

    if (amount < 100) {
        return {
            kind: 'standard',
            title: tierCopy.premium,
            icon: 'workspace_premium',
            glow: 0,
            aura: 0,
            goldCount: 0,
            sparkCount: 0,
            ring: false,
            showMark: amount >= 10,
        };
    }

    const glow = Math.pow(clamp((amount - 100) / 900, 0, 1), 0.78);
    return {
        kind: 'gold',
        title: amount >= 500 ? tierCopy.mythicGold : amount >= 250 ? tierCopy.royalGold : tierCopy.gold,
        icon: amount >= 500 ? 'auto_awesome' : 'workspace_premium',
        glow,
        aura: mapRange(amount, 100, 999, 0.025, 0.14),
        goldCount: Math.round(mapRange(amount, 100, 999, 3, 26)),
        sparkCount: Math.round(mapRange(amount, 100, 999, 2, 14)),
        ring: amount >= 500,
        showMark: true,
    };
}

function drawGlowSparkle(context, x, y, radius, alpha, palette = 'gold') {
    context.save();
    context.translate(x, y);
    context.globalAlpha = alpha;

    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius * 3.8);
    if (palette === 'platinum') {
        gradient.addColorStop(0, 'rgba(228,242,255,0.98)');
        gradient.addColorStop(0.25, 'rgba(172,214,255,0.52)');
        gradient.addColorStop(1, 'rgba(120,170,255,0)');
    } else {
        gradient.addColorStop(0, 'rgba(255,248,220,0.95)');
        gradient.addColorStop(0.35, 'rgba(255,224,140,0.55)');
        gradient.addColorStop(1, 'rgba(255,224,140,0)');
    }
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(0, 0, radius * 3.8, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

function createCanvasSizer(canvas) {
    const context = canvas.getContext('2d');
    if (!context) return null;

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.scale(dpr, dpr);
        return { width, height };
    };

    return { context, resize };
}

function spawnGoldFX(canvas, amount, tier) {
    const sizedCanvas = createCanvasSizer(canvas);
    if (!sizedCanvas) return;

    const { context, resize } = sizedCanvas;
    let frameId = 0;
    let active = true;
    let angle = 0;
    let size = resize();

    const ingots = Array.from({ length: tier.goldCount }, (_, index) => {
        const depth = 0.68 + Math.random() * 1.1;
        return {
            x: Math.random() * size.width,
            y: -Math.random() * size.height - index * 10,
            width: (13 + Math.random() * 8) * depth,
            height: (7.5 + Math.random() * 4.5) * depth,
            velocityY: 0.2 + Math.random() * 0.22 + depth * 0.15,
            drift: (Math.random() - 0.5) * (0.07 + depth * 0.11),
            rotation: Math.random() * Math.PI * 2,
            velocityRotation: (Math.random() - 0.5) * (0.012 + Math.random() * 0.02),
            alpha: 0.16 + Math.random() * (0.1 + tier.glow * 0.22),
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.008 + Math.random() * 0.02,
            shine: Math.random() * Math.PI * 2,
            shineSpeed: 0.02 + Math.random() * 0.03,
            depth,
        };
    });

    const sparkles = Array.from({ length: tier.sparkCount }, () => ({
        x: Math.random() * size.width,
        y: Math.random() * size.height,
        radius: 0.8 + Math.random() * 1.7,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04,
        alpha: 0.05 + Math.random() * 0.1,
    }));

    const drawRing = () => {
        if (!tier.ring) return;

        const centerX = size.width / 2;
        const centerY = size.height / 2 + 8;
        const radius = Math.min(size.width, size.height) * 0.32;

        context.save();
        context.translate(centerX, centerY);
        context.rotate(angle * 0.25);
        context.globalAlpha = 0.12 + tier.glow * 0.14;

        const ringGradient = context.createLinearGradient(-radius, -radius, radius, radius);
        ringGradient.addColorStop(0, 'rgba(255,245,200,0.7)');
        ringGradient.addColorStop(0.5, 'rgba(210,170,80,0.24)');
        ringGradient.addColorStop(1, 'rgba(255,240,190,0.62)');

        context.strokeStyle = ringGradient;
        context.lineWidth = 1.2;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.stroke();

        for (let index = 0; index < 6; index += 1) {
            const sparkleAngle = angle + (Math.PI * 2 / 6) * index;
            drawGlowSparkle(context, Math.cos(sparkleAngle) * radius, Math.sin(sparkleAngle) * radius, 0.9, 0.12 + tier.glow * 0.08);
        }

        context.restore();
    };

    const drawIngot = (ingot) => {
        context.save();
        context.translate(ingot.x, ingot.y);
        context.rotate(ingot.rotation);
        context.globalAlpha = ingot.alpha;

        const halfWidth = ingot.width / 2;
        const halfHeight = ingot.height / 2;
        const depth = ingot.height * 0.52;
        const skew = depth * 0.72;
        const radius = Math.max(2, Math.min(ingot.width, ingot.height) * 0.23);

        const halo = context.createRadialGradient(0, 0, 0, 0, 0, ingot.width * 1.8);
        halo.addColorStop(0, 'rgba(255,220,120,0.16)');
        halo.addColorStop(0.5, 'rgba(201,168,76,0.07)');
        halo.addColorStop(1, 'rgba(201,168,76,0)');
        context.fillStyle = halo;
        context.beginPath();
        context.arc(0, 0, ingot.width * 1.8, 0, Math.PI * 2);
        context.fill();

        context.save();
        context.translate(depth * 0.35, depth * 0.75);
        context.scale(1.15, 0.7);
        const shadow = context.createRadialGradient(0, 0, 0, 0, 0, ingot.width * 0.95);
        shadow.addColorStop(0, 'rgba(0,0,0,0.22)');
        shadow.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = shadow;
        context.beginPath();
        context.arc(0, 0, ingot.width * 0.95, 0, Math.PI * 2);
        context.fill();
        context.restore();

        context.beginPath();
        context.moveTo(-halfWidth, -halfHeight);
        context.lineTo(halfWidth, -halfHeight);
        context.lineTo(halfWidth + skew, -halfHeight - depth);
        context.lineTo(-halfWidth + skew, -halfHeight - depth);
        context.closePath();
        const topGradient = context.createLinearGradient(-halfWidth, -halfHeight - depth, halfWidth + skew, -halfHeight);
        topGradient.addColorStop(0, '#fff3ba');
        topGradient.addColorStop(0.22, '#f6de92');
        topGradient.addColorStop(0.58, '#ddb75c');
        topGradient.addColorStop(1, '#af7f2b');
        context.fillStyle = topGradient;
        context.fill();

        context.beginPath();
        context.moveTo(halfWidth, -halfHeight);
        context.lineTo(halfWidth + skew, -halfHeight - depth);
        context.lineTo(halfWidth + skew, halfHeight - depth);
        context.lineTo(halfWidth, halfHeight);
        context.closePath();
        const sideGradient = context.createLinearGradient(halfWidth, -halfHeight, halfWidth + skew, halfHeight);
        sideGradient.addColorStop(0, '#d6a946');
        sideGradient.addColorStop(0.45, '#b07d28');
        sideGradient.addColorStop(1, '#7e591f');
        context.fillStyle = sideGradient;
        context.fill();

        roundedRect(context, -halfWidth, -halfHeight, ingot.width, ingot.height, radius);
        const frontGradient = context.createLinearGradient(-halfWidth, -halfHeight, halfWidth, halfHeight);
        frontGradient.addColorStop(0, '#f6df8e');
        frontGradient.addColorStop(0.18, '#ebca6f');
        frontGradient.addColorStop(0.52, '#ca9b3f');
        frontGradient.addColorStop(0.82, '#a77524');
        frontGradient.addColorStop(1, '#8b601e');
        context.fillStyle = frontGradient;
        context.fill();

        roundedRect(context, -halfWidth + 1.2, -halfHeight + 1.2, ingot.width - 2.4, ingot.height - 2.4, Math.max(1.5, radius * 0.7));
        const bevelGradient = context.createLinearGradient(-halfWidth, -halfHeight, halfWidth, halfHeight);
        bevelGradient.addColorStop(0, 'rgba(255,247,210,0.28)');
        bevelGradient.addColorStop(0.25, 'rgba(255,230,155,0.14)');
        bevelGradient.addColorStop(0.7, 'rgba(140,90,15,0.05)');
        bevelGradient.addColorStop(1, 'rgba(65,35,0,0.16)');
        context.fillStyle = bevelGradient;
        context.fill();

        const shineX = Math.sin(ingot.shine) * (ingot.width * 0.55);
        const sweep = context.createLinearGradient(shineX - ingot.width * 0.45, -halfHeight, shineX + ingot.width * 0.15, halfHeight);
        sweep.addColorStop(0, 'rgba(255,255,255,0)');
        sweep.addColorStop(0.46, 'rgba(255,250,230,0)');
        sweep.addColorStop(0.52, 'rgba(255,250,230,0.26)');
        sweep.addColorStop(0.6, 'rgba(255,240,190,0)');
        sweep.addColorStop(1, 'rgba(255,255,255,0)');
        roundedRect(context, -halfWidth, -halfHeight, ingot.width, ingot.height, radius);
        context.fillStyle = sweep;
        context.fill();

        context.strokeStyle = 'rgba(95,60,10,0.35)';
        context.lineWidth = 0.9;
        roundedRect(context, -halfWidth, -halfHeight, ingot.width, ingot.height, radius);
        context.stroke();

        if (Math.sin(ingot.shine * 1.2) > 0.92) {
            drawGlowSparkle(context, halfWidth * 0.12, -halfHeight * 0.25, 0.9 + ingot.depth * 0.8, 0.22);
        }

        context.restore();
    };

    const renderFrame = () => {
        if (!active) return;

        angle += 0.012;
        context.clearRect(0, 0, size.width, size.height);

        const aura = context.createRadialGradient(size.width * 0.5, size.height * 0.18, 0, size.width * 0.5, size.height * 0.18, size.height);
        aura.addColorStop(0, `rgba(255,220,120,${tier.aura})`);
        aura.addColorStop(1, 'rgba(255,220,120,0)');
        context.fillStyle = aura;
        context.fillRect(0, 0, size.width, size.height);

        drawRing();

        sparkles.forEach((sparkle) => {
            sparkle.pulse += sparkle.speed;
            const alpha = sparkle.alpha * (0.55 + (Math.sin(sparkle.pulse) + 1) * 0.45);
            drawGlowSparkle(context, sparkle.x, sparkle.y, sparkle.radius, alpha);
        });

        ingots.sort((left, right) => left.depth - right.depth);
        ingots.forEach((ingot) => {
            ingot.wobble += ingot.wobbleSpeed;
            ingot.shine += ingot.shineSpeed;
            ingot.x += ingot.drift + Math.sin(ingot.wobble) * (0.08 + ingot.depth * 0.16);
            ingot.y += ingot.velocityY;
            ingot.rotation += ingot.velocityRotation;

            if (ingot.y > size.height + 35) {
                ingot.y = -20 - Math.random() * 40;
                ingot.x = Math.random() * size.width;
                ingot.rotation = Math.random() * Math.PI * 2;
            }

            drawIngot(ingot);
        });

        frameId = requestAnimationFrame(renderFrame);
    };

    const handleResize = () => {
        size = resize();
    };

    const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting) {
            if (!active) {
                active = true;
                renderFrame();
            }
            return;
        }

        active = false;
        cancelAnimationFrame(frameId);
    }, { threshold: 0.02 });

    observer.observe(canvas.closest('.card-donor') || canvas);
    window.addEventListener('resize', handleResize);
    renderFrame();

    canvas._destroyFX = () => {
        active = false;
        cancelAnimationFrame(frameId);
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
    };
}

function spawnPlatinumFX(canvas, amount, tier) {
    const sizedCanvas = createCanvasSizer(canvas);
    if (!sizedCanvas) return;

    const { context, resize } = sizedCanvas;
    let frameId = 0;
    let active = true;
    let angle = 0;
    let size = resize();

    const stars = Array.from({ length: tier.starCount }, () => ({
        x: Math.random() * size.width,
        y: Math.random() * size.height,
        radius: 0.5 + Math.random() * 1.8,
        pulse: Math.random() * Math.PI * 2,
        speed: 0.015 + Math.random() * 0.035,
        alpha: 0.05 + Math.random() * 0.18,
    }));

    const comets = Array.from({ length: tier.cometCount }, (_, index) => ({
        x: Math.random() * size.width - 80,
        y: Math.random() * size.height - size.height * 0.35,
        velocityX: 1.4 + Math.random() * 1.9 + index * 0.03,
        velocityY: 0.75 + Math.random() * 1.2,
        length: 18 + Math.random() * 38,
        width: 1 + Math.random() * 1.7,
        alpha: 0.14 + Math.random() * 0.24,
    }));

    const drawComet = (comet) => {
        context.save();
        context.globalAlpha = comet.alpha;

        const tailX = comet.x - comet.length;
        const tailY = comet.y - comet.length * 0.65;
        const gradient = context.createLinearGradient(tailX, tailY, comet.x, comet.y);
        gradient.addColorStop(0, 'rgba(110,165,255,0)');
        gradient.addColorStop(0.5, 'rgba(110,165,255,0.24)');
        gradient.addColorStop(0.82, 'rgba(170,215,255,0.72)');
        gradient.addColorStop(1, 'rgba(230,244,255,0.98)');

        context.strokeStyle = gradient;
        context.lineWidth = comet.width;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(comet.x, comet.y);
        context.stroke();

        drawGlowSparkle(context, comet.x, comet.y, 0.8 + comet.width * 0.5, comet.alpha * 0.85, 'platinum');
        context.restore();
    };

    const drawRing = () => {
        const centerX = size.width / 2;
        const centerY = size.height / 2 + 4;
        const radius = Math.min(size.width, size.height) * 0.34;

        context.save();
        context.translate(centerX, centerY);
        context.rotate(angle * 0.18);
        context.globalAlpha = 0.22;

        const ringGradient = context.createLinearGradient(-radius, -radius, radius, radius);
        ringGradient.addColorStop(0, 'rgba(230,242,255,0.82)');
        ringGradient.addColorStop(0.26, 'rgba(145,190,255,0.55)');
        ringGradient.addColorStop(0.7, 'rgba(96,145,235,0.18)');
        ringGradient.addColorStop(1, 'rgba(220,240,255,0.74)');

        context.strokeStyle = ringGradient;
        context.lineWidth = 1.35;
        context.beginPath();
        context.arc(0, 0, radius, 0, Math.PI * 2);
        context.stroke();

        context.beginPath();
        context.arc(0, 0, radius * 0.78, 0, Math.PI * 2);
        context.strokeStyle = 'rgba(130,180,255,0.11)';
        context.lineWidth = 0.8;
        context.stroke();

        for (let index = 0; index < 8; index += 1) {
            const sparkleAngle = angle * 1.3 + (Math.PI * 2 / 8) * index;
            drawGlowSparkle(context, Math.cos(sparkleAngle) * radius, Math.sin(sparkleAngle) * radius, 0.85, 0.18, 'platinum');
        }

        context.restore();
    };

    const renderFrame = () => {
        if (!active) return;

        angle += 0.012;
        context.clearRect(0, 0, size.width, size.height);

        const glow = context.createRadialGradient(size.width * 0.5, size.height * 0.15, 0, size.width * 0.5, size.height * 0.15, size.height);
        glow.addColorStop(0, 'rgba(120,170,255,0.16)');
        glow.addColorStop(0.55, 'rgba(60,90,150,0.09)');
        glow.addColorStop(1, 'rgba(40,60,120,0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, size.width, size.height);

        const sheen = context.createLinearGradient(0, 0, size.width, size.height);
        sheen.addColorStop(0, 'rgba(20,30,50,0.18)');
        sheen.addColorStop(0.5, 'rgba(10,16,28,0.05)');
        sheen.addColorStop(1, 'rgba(70,110,190,0.08)');
        context.fillStyle = sheen;
        context.fillRect(0, 0, size.width, size.height);

        drawRing();

        stars.forEach((star) => {
            star.pulse += star.speed;
            const alpha = star.alpha * (0.45 + (Math.sin(star.pulse) + 1) * 0.55);
            drawGlowSparkle(context, star.x, star.y, star.radius, alpha, 'platinum');
        });

        comets.forEach((comet) => {
            comet.x += comet.velocityX;
            comet.y += comet.velocityY;

            if (comet.x > size.width + 90 || comet.y > size.height + 60) {
                comet.x = -40 - Math.random() * 90;
                comet.y = -30 - Math.random() * 90;
            }

            drawComet(comet);
        });

        frameId = requestAnimationFrame(renderFrame);
    };

    const handleResize = () => {
        size = resize();
    };

    const observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (!entry) return;

        if (entry.isIntersecting) {
            if (!active) {
                active = true;
                renderFrame();
            }
            return;
        }

        active = false;
        cancelAnimationFrame(frameId);
    }, { threshold: 0.02 });

    observer.observe(canvas.closest('.card-donor') || canvas);
    window.addEventListener('resize', handleResize);
    renderFrame();

    canvas._destroyFX = () => {
        active = false;
        cancelAnimationFrame(frameId);
        observer.disconnect();
        window.removeEventListener('resize', handleResize);
    };
}

function destroySupportEffects(container) {
    if (!(container instanceof HTMLElement)) return;

    container.querySelectorAll('.fx-canvas').forEach((canvas) => {
        if (canvas instanceof HTMLCanvasElement && typeof canvas._destroyFX === 'function') {
            canvas._destroyFX();
        }
    });
}

function createAvatar(supporter, tier, fallbackHue) {
    const avatar = createElement('div', { className: 'donor-avatar' });
    const src = resolveAsset(supporter.avatarUrl || '');

    if (src) {
        avatar.append(createElement('img', {
            src,
            alt: supporter.name || 'Supporter avatar',
            loading: 'lazy',
        }));
    } else {
        const fallback = createElement('div', { className: 'donor-avatar-default' });
        if (tier.kind !== 'platinum') {
            fallback.style.background = `hsl(${fallbackHue},18%,22%)`;
        } else {
            fallback.classList.add('is-platinum');
        }
        fallback.textContent = initials(supporter.name);
        avatar.append(fallback);
    }

    return avatar;
}

function createTierMark(tier) {
    if (!tier.showMark) return null;

    return createElement(
        'div',
        { className: `tier-mark ${tier.kind === 'platinum' ? 'platinum' : 'gold'}` },
        createElement('span', { className: 'material-icons', textContent: tier.icon }),
    );
}

function createSupportCard(supporter, { rank = 0, top = false, locale = 'ru' } = {}) {
    const amount = Number(supporter.amountUsd || 0);
    const tier = getDonorStyle(amount, locale);
    const hue = hueFromName(supporter.name || supporter.id || 'supporter');
    const card = createElement('article', {
        className: `card-donor${tier.kind === 'platinum' ? ' is-platinum' : ''}`,
    });

    let borderAlpha;
    let boxShadow;
    let ringWidth;
    let ringAlpha;
    let ringGlow;
    let backgroundAlpha;

    if (tier.kind === 'platinum') {
        borderAlpha = 0.34;
        boxShadow = [
            '0 0 16px rgba(110,165,255,0.18)',
            '0 0 34px rgba(110,165,255,0.16)',
            '0 0 70px rgba(70,120,230,0.16)',
            'inset 0 0 20px rgba(190,225,255,0.06)',
        ].join(',');
        ringWidth = 2.6;
        ringAlpha = 0.92;
        ringGlow = '0 0 18px rgba(145,190,255,0.55), 0 0 34px rgba(90,145,245,0.26)';
        backgroundAlpha = 0.12;
        card.style.cssText = `
            --g-alpha: .88;
            border-color: rgba(130,180,255,${borderAlpha});
            box-shadow: ${boxShadow};
            background:
              radial-gradient(circle at 50% 0%, rgba(110,165,255,0.16), transparent 58%),
              linear-gradient(135deg, rgba(18,24,38,0.96), rgba(10,14,24,0.98) 55%, rgba(18,34,66,0.92));
        `;
    } else if (tier.kind === 'gold') {
        borderAlpha = 0.12 + tier.glow * 0.78;
        boxShadow = [
            `0 0 ${8 + tier.glow * 24}px rgba(201,168,76,${0.05 + tier.glow * 0.2})`,
            `0 0 ${16 + tier.glow * 36}px rgba(201,168,76,${0.03 + tier.glow * 0.12})`,
            `0 0 ${24 + tier.glow * 58}px rgba(201,168,76,${0.02 + tier.glow * 0.07})`,
            `inset 0 0 ${6 + tier.glow * 16}px rgba(242,210,130,${tier.glow * 0.08})`,
        ].join(',');
        ringWidth = 1 + tier.glow * 2.5;
        ringAlpha = 0.15 + tier.glow * 0.85;
        ringGlow = `0 0 ${4 + tier.glow * 14}px rgba(201,168,76,${tier.glow * 0.7})`;
        backgroundAlpha = tier.aura * 0.55;
        card.style.cssText = `
            --g-alpha: ${(0.15 + tier.glow * 0.85).toFixed(3)};
            border-color: rgba(201,168,76,${borderAlpha.toFixed(3)});
            box-shadow: ${boxShadow};
            background: rgba(201,168,76,${backgroundAlpha.toFixed(4)});
        `;
    } else {
        ringWidth = 1;
        ringAlpha = 0.15;
        ringGlow = 'none';
        card.style.cssText = '--g-alpha: 0;';
    }

    const effectCanvas = !prefersReducedMotion() && ((tier.kind === 'gold' && tier.goldCount) || tier.kind === 'platinum')
        ? createElement('canvas', { className: 'fx-canvas', 'aria-hidden': 'true' })
        : null;

    if (effectCanvas) {
        card.append(effectCanvas);
    }

    const tierMark = createTierMark(tier);
    if (tierMark) {
        card.append(tierMark);
    }

    void rank;
    void top;

    const avatar = createAvatar(supporter, tier, hue);
    avatar.append(
        createElement('div', {
            className: 'donor-avatar-ring',
            style: `box-shadow:${ringGlow};border:${ringWidth.toFixed(1)}px solid ${tier.kind === 'platinum' ? `rgba(190,225,255,${ringAlpha.toFixed(3)})` : `rgba(201,168,76,${ringAlpha.toFixed(3)})`};`,
            'aria-hidden': 'true',
        }),
    );

    card.append(
        avatar,
        createElement('span', { className: 'donor-name', textContent: supporter.name || 'Supporter' }),
        createElement('span', { className: 'donor-badge', textContent: tier.title }),
        createElement('span', { className: 'donor-amount', textContent: formatUsd(amount) }),
    );

    if (effectCanvas instanceof HTMLCanvasElement) {
        requestAnimationFrame(() => {
            if (!card.isConnected) return;
            if (tier.kind === 'platinum') {
                spawnPlatinumFX(effectCanvas, amount, tier);
            } else if (tier.kind === 'gold') {
                spawnGoldFX(effectCanvas, amount, tier);
            }
        });
    }

    return card;
}

function renderSupporters(elements, supporters, copy, locale) {
    const sorted = sortSupporters(supporters, locale);

    if (elements.supporterCount) {
        elements.supporterCount.textContent = String(sorted.length);
    }

    if (!elements.supportersGrid) return;
    destroySupportEffects(elements.supportersGrid);
    elements.supportersGrid.textContent = '';

    if (!sorted.length) {
        elements.supportersGrid.append(createEmptyState(copy.supportersEmpty));
        if (elements.topSupportersSection) elements.topSupportersSection.hidden = true;
        return;
    }

    sorted.forEach((supporter) => {
        elements.supportersGrid.append(createSupportCard(supporter, { locale }));
    });

    if (!elements.topSupportersSection || !elements.topSupportersGrid) return;

    const topThree = sorted.slice(0, 3);
    if (!topThree.length) {
        elements.topSupportersSection.hidden = true;
        return;
    }

    elements.topSupportersSection.hidden = false;
    destroySupportEffects(elements.topSupportersGrid);
    elements.topSupportersGrid.textContent = '';
    topThree.forEach((supporter, index) => {
        elements.topSupportersGrid.append(createSupportCard(supporter, {
            rank: index + 1,
            top: true,
            locale,
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
    if (elements.topSupportersDesc) {
        const hasTopDescription = Boolean(String(copy.topDesc || '').trim());
        elements.topSupportersDesc.textContent = copy.topDesc || '';
        elements.topSupportersDesc.hidden = !hasTopDescription;
    }
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
