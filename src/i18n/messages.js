/**
 * @fileoverview All UI translation strings, keyed by locale.
 * Only static shell copy lives here — admin-managed content stays in site-data.
 * @module i18n/messages
 */

export const MESSAGES = Object.freeze({
    /* ── Russian ─────────────────────────────────────────── */
    ru: {
        meta: {
            title: 'Aleph Studio',
            description:
                'Aleph Studio — моды, игры, DLC и небольшие цифровые релизы с открытым исходным кодом, понятной установкой и быстрым доступом к актуальной версии.',
        },
        brand: { homeLabel: 'Aleph Studio — наверх' },
        skipLink: 'Перейти к основному содержимому',
        nav: {
            products: 'Продукты',
            manifesto: 'Принцип',
            team: 'Команда',
        },
        locale: {
            triggerLabel: 'Выбор языка',
            menuLabel: 'Сменить язык',
            openLabel: 'Открыть меню выбора языка',
            closeLabel: 'Закрыть меню выбора языка',
        },
        hero: {
            intro:
                'Игровые проекты с открытым исходным кодом. Моды, игры, DLC — всё, что мы делаем, ты можешь изучить, изменить и запустить сам.',
            ctaPrimary: 'Смотреть продукты',
            ctaSecondary: 'Наш принцип',
        },
        approach: {
            lead:
                'Aleph Studio исходит из того, что пользователь должен <strong>понимать что именно работает на его машине</strong>. Поэтому мы публикуем код под лицензией GPL — его можно изучить, развить, использовать в своих проектах.<br><br>Это не альтруизм. Это <strong>стандарт качества</strong>.',
        },
        products: {
            title: 'Главные релизы',
            catalogTitle: 'Остальные продукты и будущие релизы',
            catalogDesc: 'Сроки и даты являются предварительными.',
            download: 'Скачать',
            soon: 'Скоро',
            sourceCode: 'Исходный код ↗',
            detail: 'Подробнее',
            lifecycle: {
                active: 'Активно',
                frozen: 'Заморожено',
                abandoned: 'Заброшено',
            },
            flags: {
                alpha: 'Альфа',
                beta: 'Бета',
                release: 'Релиз',
            },
            noFeatured:
                'Откройте скрытый редактор и выведите хотя бы один продукт на витрину.',
        },
        productsPage: {
            metaTitle: 'Aleph Studio — Продукты',
            metaDescription: 'Полный каталог релизов Aleph Studio. Сортировка по статусу, лейблу и алфавиту.',
            backToHome: 'Назад на главную',
            heroEyebrow: 'Каталог',
            heroTitle: 'Все продукты',
            heroDesc: 'Все опубликованные релизы и будущие проекты Aleph Studio. Используй фильтры и сортировку чтобы найти нужный.',
            filterLabel: 'Фильтры',
            filterAll: 'Все',
            filterStatus: 'Статус',
            filterFlag: 'Лейбл',
            sortLabel: 'Сортировка',
            sortDefault: 'По умолчанию',
            sortAlpha: 'По алфавиту (A→Я)',
            sortAlphaDesc: 'По алфавиту (Я→A)',
            sortNewest: 'Сначала новые',
            sortOldest: 'Сначала старые',
            countLabel: 'Найдено',
            empty: 'По выбранным фильтрам ничего не нашлось.',
            emptyAction: 'Сбросить фильтры',
            cardOpen: 'Подробнее',
            cardDownload: 'Скачать',
            cardSoon: 'Скоро',
        },
        manifesto: {
            heading: 'Что важно',
            text: 'Открытый код — это не скидка на качество.<br>Это <em>уважение</em> к тому, кто запускает.',
            case1Title: 'Открытый код',
            case1Text: 'Репозиторий публикуется, структура не прячется за закрытой сборкой.',
            case2Title: 'Честный статус',
            case2Text: 'Alpha — это alpha. Beta — это beta. Без маркетинговых слов вместо правды.',
            case3Title: 'Прямой доступ',
            case3Text: 'Если файл готов — скачай сразу. Без лишних переходов и непрозрачных установщиков.',
        },
        team: {
            title: 'Люди за проектом',
            intro: 'Участники, которые ведут разработку, поддерживают релизы и держат в порядке публичную часть проекта.',
            avatarFallback: 'Участник команды',
            empty: 'Нет участников.',
        },
        footer: {
            desc: 'Дочерний проект WeTTeA. Игровые разработки с открытым исходным кодом.',
            navHeading: 'Навигация',
            wetteaHeading: 'Ссылки',
            tagline: 'Дочерний проект WeTTeA',
            navAria: 'Подвал — навигация',
            socialsAria: 'Социальные сети',
            donate: 'Поддержать',
            copyright: '© 2026 Aleph Studio',
            license: '',
        },
    },

    /* ── English ─────────────────────────────────────────── */
    en: {
        meta: {
            title: 'Aleph Studio',
            description:
                'Aleph Studio — mods, games, DLC and small digital releases with open source code, clear installation and quick access to the latest version.',
        },
        brand: { homeLabel: 'Aleph Studio — back to top' },
        skipLink: 'Skip to main content',
        nav: {
            products: 'Products',
            manifesto: 'Principle',
            team: 'Team',
        },
        locale: {
            triggerLabel: 'Language switcher',
            menuLabel: 'Choose language',
            openLabel: 'Open language menu',
            closeLabel: 'Close language menu',
        },
        hero: {
            intro:
                'Open source game projects. Mods, games, DLC — everything we make, you can study, modify and run yourself.',
            ctaPrimary: 'See products',
            ctaSecondary: 'Our principle',
        },
        approach: {
            lead:
                'Aleph Studio operates on the premise that users should <strong>understand exactly what is running on their machine</strong>. That\'s why we publish code under the GPL licence — you can study it, extend it, use it in your own projects.<br><br>This isn\'t altruism. It\'s a <strong>quality standard</strong>.',
        },
        products: {
            title: 'Main releases',
            catalogTitle: 'Other products and upcoming releases',
            catalogDesc: 'Dates and timelines are preliminary.',
            download: 'Download',
            soon: 'Soon',
            sourceCode: 'Source code ↗',
            detail: 'Details',
            lifecycle: {
                active: 'Active',
                frozen: 'Frozen',
                abandoned: 'Abandoned',
            },
            flags: {
                alpha: 'Alpha',
                beta: 'Beta',
                release: 'Release',
            },
            noFeatured:
                'Open the hidden editor and feature at least one product.',
        },
        productsPage: {
            metaTitle: 'Aleph Studio — Products',
            metaDescription: 'Full catalog of Aleph Studio releases. Sort by status, label and alphabet.',
            backToHome: 'Back to home',
            heroEyebrow: 'Catalog',
            heroTitle: 'All products',
            heroDesc: 'All published releases and upcoming projects from Aleph Studio. Use filters and sorting to find what you need.',
            filterLabel: 'Filters',
            filterAll: 'All',
            filterStatus: 'Status',
            filterFlag: 'Label',
            sortLabel: 'Sort',
            sortDefault: 'Default',
            sortAlpha: 'Alphabetical (A→Z)',
            sortAlphaDesc: 'Alphabetical (Z→A)',
            sortNewest: 'Newest first',
            sortOldest: 'Oldest first',
            countLabel: 'Found',
            empty: 'Nothing matches the current filters.',
            emptyAction: 'Reset filters',
            cardOpen: 'Open',
            cardDownload: 'Download',
            cardSoon: 'Soon',
        },
        manifesto: {
            heading: 'What matters',
            text: 'Open source is not a discount on quality.<br>It\'s <em>respect</em> for the person running it.',
            case1Title: 'Open code',
            case1Text: 'The repository is public, the structure isn\'t hidden behind a closed build.',
            case2Title: 'Honest status',
            case2Text: 'Alpha is alpha. Beta is beta. No marketing words instead of truth.',
            case3Title: 'Direct access',
            case3Text: 'If the file is ready — download it right away. No extra steps or opaque installers.',
        },
        team: {
            title: 'The people behind the project',
            intro: 'Members who lead development, maintain releases and keep the public side of the project in order.',
            avatarFallback: 'Team member avatar',
            empty: 'No team members.',
        },
        footer: {
            desc: 'A subsidiary project of WeTTeA. Open source game development.',
            navHeading: 'Navigation',
            wetteaHeading: 'Links',
            tagline: 'A subsidiary of WeTTeA',
            navAria: 'Footer — navigation',
            socialsAria: 'Social links',
            donate: 'Support',
            copyright: '© 2026 Aleph Studio',
            license: '',
        },
    },

    /* ── Ukrainian ───────────────────────────────────────── */
    ua: {
        meta: {
            title: 'Aleph Studio',
            description:
                'Aleph Studio — моди, ігри, DLC та невеликі цифрові релізи з відкритим вихідним кодом, зрозумілою установкою та швидким доступом до актуальної версії.',
        },
        brand: { homeLabel: 'Aleph Studio — нагору' },
        skipLink: 'Перейти до основного вмісту',
        nav: {
            products: 'Продукти',
            manifesto: 'Принцип',
            team: 'Команда',
        },
        locale: {
            triggerLabel: 'Перемикач мови',
            menuLabel: 'Оберіть мову',
            openLabel: 'Відкрити меню вибору мови',
            closeLabel: 'Закрити меню вибору мови',
        },
        hero: {
            intro:
                'Ігрові проєкти з відкритим вихідним кодом. Моди, ігри, DLC — все, що ми робимо, ти можеш вивчити, змінити і запустити сам.',
            ctaPrimary: 'Переглянути продукти',
            ctaSecondary: 'Наш принцип',
        },
        approach: {
            lead:
                'Aleph Studio виходить з того, що користувач повинен <strong>розуміти що саме працює на його машині</strong>. Тому ми публікуємо код під ліцензією GPL — його можна вивчити, розвинути, використати у власних проєктах.<br><br>Це не альтруїзм. Це <strong>стандарт якості</strong>.',
        },
        products: {
            title: 'Головні релізи',
            catalogTitle: 'Інші продукти та майбутні релізи',
            catalogDesc: 'Терміни та дати є попередніми.',
            download: 'Завантажити',
            soon: 'Скоро',
            sourceCode: 'Вихідний код ↗',
            detail: 'Детальніше',
            lifecycle: {
                active: 'Активно',
                frozen: 'Заморожено',
                abandoned: 'Покинуто',
            },
            flags: {
                alpha: 'Альфа',
                beta: 'Бета',
                release: 'Реліз',
            },
            noFeatured:
                'Відкрийте прихований редактор і виведіть хоча б один продукт на вітрину.',
        },
        productsPage: {
            metaTitle: 'Aleph Studio — Продукти',
            metaDescription: 'Повний каталог релізів Aleph Studio. Сортування за статусом, лейблом та алфавітом.',
            backToHome: 'Назад на головну',
            heroEyebrow: 'Каталог',
            heroTitle: 'Усі продукти',
            heroDesc: 'Усі опубліковані релізи та майбутні проєкти Aleph Studio. Скористайся фільтрами і сортуванням, щоб знайти потрібне.',
            filterLabel: 'Фільтри',
            filterAll: 'Усі',
            filterStatus: 'Статус',
            filterFlag: 'Лейбл',
            sortLabel: 'Сортування',
            sortDefault: 'За замовчуванням',
            sortAlpha: 'За алфавітом (A→Я)',
            sortAlphaDesc: 'За алфавітом (Я→A)',
            sortNewest: 'Спочатку нові',
            sortOldest: 'Спочатку старі',
            countLabel: 'Знайдено',
            empty: 'За обраними фільтрами нічого не знайдено.',
            emptyAction: 'Скинути фільтри',
            cardOpen: 'Детальніше',
            cardDownload: 'Завантажити',
            cardSoon: 'Скоро',
        },
        manifesto: {
            heading: 'Що важливо',
            text: 'Відкритий код — це не знижка на якість.<br>Це <em>повага</em> до того, хто запускає.',
            case1Title: 'Відкритий код',
            case1Text: 'Репозиторій публікується, структура не ховається за закритою збіркою.',
            case2Title: 'Чесний статус',
            case2Text: 'Alpha — це alpha. Beta — це beta. Без маркетингових слів замість правди.',
            case3Title: 'Прямий доступ',
            case3Text: 'Якщо файл готовий — скачай одразу. Без зайвих переходів і непрозорих інсталяторів.',
        },
        team: {
            title: 'Люди за проєктом',
            intro: 'Учасники, які ведуть розробку, підтримують релізи та тримають у порядку публічну частину проєкту.',
            avatarFallback: 'Учасник команди',
            empty: 'Немає учасників.',
        },
        footer: {
            desc: 'Дочірній проєкт WeTTeA. Ігрові розробки з відкритим вихідним кодом.',
            navHeading: 'Навігація',
            wetteaHeading: 'Посилання',
            tagline: 'Дочірній проєкт WeTTeA',
            navAria: 'Підвал — навігація',
            socialsAria: 'Соціальні мережі',
            donate: 'Підтримати',
            copyright: '© 2026 Aleph Studio',
            license: '',
        },
    },
});
