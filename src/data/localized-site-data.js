import { deepClone } from '../core/data-utils.js';
import { normalizeLocale } from '../i18n/config.js';

const PRODUCT_OVERRIDES = Object.freeze({
    en: Object.freeze({
        'strange-visuals': Object.freeze({
            tag: 'Active',
            status: 'active',
            summary:
                'A fork of a visual mod for Minecraft Fabric 1.21.8. Ready for direct installation with the source code available in the public repository.',
            instructions: Object.freeze([
                'Install Minecraft Fabric 1.21.8 in your launcher.',
                'Download Fabric API from https://modrinth.com/mod/fabric-api and place the file into the mods folder.',
                'After that, download our mod and place it into the mods folder as well.',
                'Done — you can launch the game.',
            ]),
            note: 'The mod file is available from the download button below.',
            routeModules: Object.freeze({
                player: Object.freeze([
                    { name: 'Boxes', enabled: true },
                    { name: 'Jump Circles', enabled: true },
                    { name: 'Chinese Hat', enabled: true },
                    { name: 'Target Render', enabled: true },
                    { name: 'Hit Bubble', enabled: false },
                ]),
                world: Object.freeze([
                    { name: 'Chams', enabled: true },
                    { name: 'Tracers', enabled: false },
                    { name: 'Projectiles', enabled: true },
                    { name: 'Particles', enabled: true },
                    { name: 'Block Overlay', enabled: false },
                    { name: 'Drop Render', enabled: true },
                    { name: 'Skeleton', enabled: false },
                ]),
                utils: Object.freeze([
                    { name: 'Auto Sprint', enabled: true },
                    { name: 'Auto Tool', enabled: false },
                    { name: 'Fullbright', enabled: true },
                    { name: 'No Overlay', enabled: true },
                    { name: 'Coordinates', enabled: true },
                    { name: 'Timer', enabled: false },
                ]),
                other: Object.freeze([
                    { name: 'Anti Bot', enabled: false },
                    { name: 'Proxy', enabled: false },
                    { name: 'Debug Mode', enabled: true },
                    { name: 'Nick Hider', enabled: true },
                ]),
                interface: Object.freeze([
                    { name: 'Array List', enabled: true },
                    { name: 'Watermark', enabled: true },
                    { name: 'Keybinds', enabled: false },
                    { name: 'Notifications', enabled: true },
                    { name: 'Hotbar', enabled: true },
                    { name: 'Scoreboard', enabled: false },
                    { name: 'Tab List', enabled: true },
                    { name: 'Crosshair', enabled: true },
                ]),
                themes: Object.freeze([
                    { name: 'Default', enabled: true },
                    { name: 'Minimal', enabled: false },
                    { name: 'Neon', enabled: false },
                    { name: 'Retro', enabled: false },
                ]),
            }),
        }),
        'next-release': Object.freeze({
            title: 'Unknown',
            tag: 'Unknown',
            status: 'in development',
            summary: 'This slot is reserved for the next public Aleph Studio release.',
            note: 'Details will appear later.',
        }),
        'third-project': Object.freeze({
            title: 'Unknown',
            tag: 'Unknown',
            status: 'planned',
            summary: 'This slot is reserved for the next public Aleph Studio release.',
            note: 'Details will appear later.',
        }),
    }),
    ua: Object.freeze({
        'strange-visuals': Object.freeze({
            tag: 'Активно',
            status: 'активно',
            summary:
                'Форк візуального мода для Minecraft Fabric 1.21.8. Доступний для прямого встановлення, а вихідний код відкритий у публічному репозиторії.',
            instructions: Object.freeze([
                'Встановіть Minecraft Fabric 1.21.8 у своєму лаунчері.',
                'Завантажте Fabric API з https://modrinth.com/mod/fabric-api і покладіть файл у папку mods.',
                'Після цього завантажте наш мод і також покладіть його у папку mods.',
                'Готово — можна запускати гру.',
            ]),
            note: 'Файл мода доступний за кнопкою нижче.',
            routeModules: Object.freeze({
                player: Object.freeze([
                    { name: 'Бокси', enabled: true },
                    { name: 'Джампіки', enabled: true },
                    { name: 'Китайський капелюх', enabled: true },
                    { name: 'Таргет рендер', enabled: true },
                    { name: 'Хіт бабл', enabled: false },
                ]),
                world: Object.freeze([
                    { name: 'Чамси', enabled: true },
                    { name: 'Трейсери', enabled: false },
                    { name: 'Снаряди', enabled: true },
                    { name: 'Частинки', enabled: true },
                    { name: 'Блок оверлей', enabled: false },
                    { name: 'Дроп рендер', enabled: true },
                    { name: 'Скелетон', enabled: false },
                ]),
                utils: Object.freeze([
                    { name: 'Авто спринт', enabled: true },
                    { name: 'Авто тул', enabled: false },
                    { name: 'Фуллбрайт', enabled: true },
                    { name: 'Ноу оверлей', enabled: true },
                    { name: 'Координати', enabled: true },
                    { name: 'Таймер', enabled: false },
                ]),
                other: Object.freeze([
                    { name: 'Антибот', enabled: false },
                    { name: 'Проксі', enabled: false },
                    { name: 'Дебаг мод', enabled: true },
                    { name: 'Нік хайдер', enabled: true },
                ]),
                interface: Object.freeze([
                    { name: 'Масив ліст', enabled: true },
                    { name: 'Ватермарка', enabled: true },
                    { name: 'Кейбінди', enabled: false },
                    { name: 'Нотифікації', enabled: true },
                    { name: 'Хотбар', enabled: true },
                    { name: 'Скорборд', enabled: false },
                    { name: 'Табуліст', enabled: true },
                    { name: 'Кроссхейр', enabled: true },
                ]),
                themes: Object.freeze([
                    { name: 'Стандарт', enabled: true },
                    { name: 'Мінімалізм', enabled: false },
                    { name: 'Неон', enabled: false },
                    { name: 'Ретро', enabled: false },
                ]),
            }),
        }),
        'next-release': Object.freeze({
            title: 'Невідомо',
            tag: 'Невідомо',
            status: 'в розробці',
            summary: 'Цей слот зарезервований під наступний публічний реліз Aleph Studio.',
            note: 'Подробиці зʼявляться пізніше.',
        }),
        'third-project': Object.freeze({
            title: 'Невідомо',
            tag: 'Невідомо',
            status: 'планується',
            summary: 'Цей слот зарезервований під наступний публічний реліз Aleph Studio.',
            note: 'Подробиці зʼявляться пізніше.',
        }),
    }),
});

const TEAM_OVERRIDES = Object.freeze({
    en: Object.freeze({
        'team-member-01': Object.freeze({
            role: 'Founder',
            description: 'Butt',
        }),
        'team-member-02': Object.freeze({
            role: 'Administrator',
            description: 'Playboy, billionaire, philanthropist',
        }),
        'team-member-03': Object.freeze({
            role: 'Developer',
            description: 'Keeps the project in shape, understands the bigger picture and closes the hardest tasks. Tech lead.',
        }),
        'team-member-04': Object.freeze({
            role: 'Junior Developer',
            description: 'Helps with bugs, support and smaller fixes. Watches incoming issues and breaks down errors.',
        }),
    }),
    ua: Object.freeze({
        'team-member-01': Object.freeze({
            role: 'Засновник',
            description: 'Дупа',
        }),
        'team-member-02': Object.freeze({
            role: 'Адміністратор',
            description: 'Плейбой, мільярдер, філантроп',
        }),
        'team-member-03': Object.freeze({
            role: 'Розробник',
            description: 'Тримає проєкт у порядку, розуміє загальну картину та закриває найскладніші задачі. Техлід.',
        }),
        'team-member-04': Object.freeze({
            role: 'Молодший розробник',
            description: 'Допомагає з багами, підтримкою та дрібними правками. Стежить за проблемами й розбирає помилки.',
        }),
    }),
});

const SUPPORT_PAGE_OVERRIDES = Object.freeze({
    en: Object.freeze({
        buttons: Object.freeze({
            'support-fanpay': Object.freeze({
                label: 'Pay by card',
                title: 'FanPay',
                note: 'Visa / Mastercard / SBP',
            }),
            'support-donationalerts': Object.freeze({
                label: 'Donation Alerts',
                title: 'Donate',
                note: 'Fast support from streams',
            }),
        }),
    }),
    ua: Object.freeze({
        buttons: Object.freeze({
            'support-fanpay': Object.freeze({
                label: 'Оплата карткою',
                title: 'FanPay',
                note: 'Visa / Mastercard / СБП',
            }),
            'support-donationalerts': Object.freeze({
                label: 'Donation Alerts',
                title: 'Донат',
                note: 'Швидка підтримка зі стримів',
            }),
        }),
    }),
});

function mergeRouteModules(baseModules, overrideModules = {}) {
    const nextModules = { ...baseModules };
    Object.entries(overrideModules).forEach(([key, items]) => {
        nextModules[key] = Array.isArray(items) ? items.map((item) => ({ ...item })) : nextModules[key];
    });
    return nextModules;
}

function localizeProducts(products, locale) {
    const overrides = PRODUCT_OVERRIDES[locale] || {};
    return products.map((product) => {
        const override = overrides[product.id];
        if (!override) return product;
        return {
            ...product,
            ...override,
            routeModules: mergeRouteModules(product.routeModules, override.routeModules),
        };
    });
}

function localizeTeam(team, locale) {
    const overrides = TEAM_OVERRIDES[locale] || {};
    return team.map((member) => ({
        ...member,
        ...(overrides[member.id] || {}),
    }));
}

function localizeSupportPage(supportPage, locale) {
    const overrides = SUPPORT_PAGE_OVERRIDES[locale];
    if (!overrides) return supportPage;

    return {
        ...supportPage,
        buttons: supportPage.buttons.map((button) => ({
            ...button,
            ...((overrides.buttons && overrides.buttons[button.id]) || {}),
        })),
    };
}

export function localizeSiteData(siteData, locale) {
    const normalizedLocale = normalizeLocale(locale);
    const localized = deepClone(siteData);

    if (normalizedLocale === 'ru') return localized;

    localized.products = localizeProducts(localized.products || [], normalizedLocale);
    localized.team = localizeTeam(localized.team || [], normalizedLocale);
    localized.supportPage = localizeSupportPage(localized.supportPage || { minimumAmountUsd: 2, roleName: '@Premium', buttons: [], supporters: [] }, normalizedLocale);

    return localized;
}
