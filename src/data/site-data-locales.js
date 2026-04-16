/**
 * @fileoverview Locale overlays for bundled default site data.
 * These strings are applied only when current stored values still match
 * the original Russian defaults, so admin edits keep precedence.
 * @module data/site-data-locales
 */

export const SITE_DATA_LOCALE_OVERRIDES = Object.freeze({
    en: Object.freeze({
        products: Object.freeze({
            'strange-visuals': Object.freeze({
                tag: 'active',
                status: 'active',
                summary: 'Strange Visuals focuses on visual enhancements that do not violate server rules.',
                instructions: Object.freeze([
                    'Install Minecraft Fabric 1.21.8 in your launcher.',
                    'Download Fabric API: https://modrinth.com/mod/fabric-api and place the file into the mods folder.',
                    'Then download our mod and place it into the mods folder as well.',
                    'Done — you can launch it.',
                ]),
                note: 'The mod file is available via the button below.',
                routeModules: Object.freeze({
                    player: Object.freeze(['Boxes', 'Jump Circles', 'China Hat', 'Target Render', 'Hit Bubble']),
                    world: Object.freeze(['Chams', 'Tracers', 'Projectiles', 'Particles', 'Block Overlay', 'Item Drop Render', 'Skeleton']),
                    utils: Object.freeze(['Auto Sprint', 'Auto Tool', 'Fullbright', 'No Overlay', 'Coordinates', 'Timer']),
                    other: Object.freeze(['Anti-Bot', 'Proxy', 'Debug Mode', 'Name Hider']),
                    interface: Object.freeze(['Array List', 'Watermark', 'Keybinds', 'Notifications', 'Hotbar', 'Scoreboard', 'Tab List', 'Crosshair']),
                    themes: Object.freeze(['White', 'Black', 'Transparent White', 'Transparent Black', 'Pink', 'Violet']),
                }),
            }),
            'next-release': Object.freeze({
                title: 'Unknown',
                tag: 'frozen',
                status: 'frozen',
                summary: 'This slot is reserved for the next public Aleph Studio release.',
                note: 'Details will appear later.',
            }),
            'third-project': Object.freeze({
                title: 'Unknown',
                tag: 'abandoned',
                status: 'abandoned',
                summary: 'This slot is reserved for the next public Aleph Studio release.',
                note: 'Details will appear later.',
            }),
        }),
        team: Object.freeze({
            'team-member-01': Object.freeze({
                role: 'Founder',
                description: 'Sets the studio direction, owns key decisions and keeps the project moving as a whole.',
            }),
            'team-member-02': Object.freeze({
                role: 'Administrator',
                description: 'Playboy, billionaire, philanthropist',
            }),
            'team-member-03': Object.freeze({
                role: 'Developer',
                description: 'Keeps the project in order, understands the bigger picture and closes the hardest tasks. Tech lead.',
            }),
            'team-member-04': Object.freeze({
                role: 'Junior Developer',
                description: 'Helps with bugs, support and smaller fixes. Watches issues and breaks down errors.',
            }),
        }),
        supportPage: Object.freeze({
            buttons: Object.freeze({
                'support-funpay': Object.freeze({
                    label: 'Support',
                    note: 'Visa / Mastercard / SBP',
                }),
                'support-donationalerts': Object.freeze({
                    label: 'Support',
                    note: 'Visa / Mastercard / MIR / SBP / SberPay / YooMoney / QIWI / WebMoney / PayPal / Apple Pay / Google Pay / Crypto / Mobile payments',
                }),
            }),
        }),
    }),
    ua: Object.freeze({
        products: Object.freeze({
            'strange-visuals': Object.freeze({
                tag: 'active',
                status: 'active',
                summary: 'Strange Visuals зосереджений на візуальних покращеннях, які не порушують правила серверів.',
                instructions: Object.freeze([
                    'Встановіть Minecraft Fabric 1.21.8 у своєму лаунчері.',
                    'Завантажте Fabric API: https://modrinth.com/mod/fabric-api і покладіть файл у папку mods.',
                    'Після цього завантажте наш мод і також покладіть його у папку mods.',
                    'Готово — можна запускати.',
                ]),
                note: 'Файл мода доступний за кнопкою нижче.',
                routeModules: Object.freeze({
                    player: Object.freeze(['Бокси', 'Кола стрибка', 'Китайський капелюх', 'Рендер цілі', 'Хіт-бабл']),
                    world: Object.freeze(['Чамси', 'Трейсери', 'Снаряди', 'Частинки', 'Блок-оверлей', 'Рендер дропу', 'Скелетон']),
                    utils: Object.freeze(['Авто спринт', 'Авто тул', 'Фулбрайт', 'Ноу оверлей', 'Координати', 'Таймер']),
                    other: Object.freeze(['Антибот', 'Проксі', 'Дебаг-режим', 'Приховувач ніку']),
                    interface: Object.freeze(['Масив лист', 'Вотермарка', 'Кейбінди', 'Сповіщення', 'Хотбар', 'Скорборд', 'Таблист', 'Приціл']),
                    themes: Object.freeze(['Біла', 'Чорна', 'Прозора біла', 'Прозора чорна', 'Рожева', 'Фіолетова']),
                }),
            }),
            'next-release': Object.freeze({
                title: 'Невідомо',
                tag: 'frozen',
                status: 'frozen',
                summary: 'Цей слот зарезервовано під наступний публічний реліз Aleph Studio.',
                note: 'Подробиці зʼявляться пізніше.',
            }),
            'third-project': Object.freeze({
                title: 'Невідомо',
                tag: 'abandoned',
                status: 'abandoned',
                summary: 'Цей слот зарезервовано під наступний публічний реліз Aleph Studio.',
                note: 'Подробиці зʼявляться пізніше.',
            }),
        }),
        team: Object.freeze({
            'team-member-01': Object.freeze({
                role: 'Засновник',
                description: 'Формує напрям студії, відповідає за ключові рішення та загальний вектор розвитку проєкту.',
            }),
            'team-member-02': Object.freeze({
                role: 'Адміністратор',
                description: 'Плейбой, мільярдер, філантроп',
            }),
            'team-member-03': Object.freeze({
                role: 'Розробник',
                description: 'Тримає проєкт у порядку, бачить загальну картину й закриває найскладніші задачі. Техлід.',
            }),
            'team-member-04': Object.freeze({
                role: 'Молодший розробник',
                description: 'Допомагає з багами, підтримкою та дрібними правками. Стежить за проблемами й розбирає помилки.',
            }),
        }),
        supportPage: Object.freeze({
            buttons: Object.freeze({
                'support-funpay': Object.freeze({
                    label: 'Підтримати',
                    note: 'Visa / Mastercard / СБП',
                }),
                'support-donationalerts': Object.freeze({
                    label: 'Підтримати',
                    note: 'Visa / Mastercard / МИР / СБП / SberPay / YooMoney / QIWI / WebMoney / PayPal / Apple Pay / Google Pay / Крипта / Мобільні платежі',
                }),
            }),
        }),
    }),
});
