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
                'Aleph Studio — разработка игр, модификаций и DLC для пользователей. Мы ценим культуру открытого кода и создаем качественные продукты.',
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
                'Игровые проекты, моды и DLC. Мы создаем качественный контент для любимых игр, ценим культуру открытого кода и даем пользователям реальную свободу.',
            ctaPrimary: 'Смотреть продукты',
            ctaSecondary: 'Наш принцип',
        },
        approach: {
            lead:
                'В Aleph Studio мы создаем игры, модификации и DLC, основывая всю разработку на трех столпах: <strong>качество</strong>, <strong>удобство</strong> и <strong>честность</strong>. Пользователь должен <strong>понимать, что именно работает на его машине</strong>, поэтому мы стремимся открывать исходный код везде, где это возможно.<br><br>При этом мы остаемся реалистами: <strong>мы не благотворительная организация</strong>. Сложная разработка и поддержка инфраструктуры требуют ресурсов. Мы никогда не берем деньги из воздуха, но если содержание продукта стоит денег — продукт будет платным. Это честный подход.<br><br>Мы даем пользователям реальную свободу влиять на продукт. Любой может скопировать наш открытый проект <strong>на GitHub</strong>, дописать свою фичу и отправить <strong>Pull Request</strong> — чистый и безопасный код обязательно станет частью релиза. Нам обидно видеть, как тонны мертвого кода лежат на просторах сети у авторов, которые пытались делать всё в одиночку ради статуса "главного", но чьи мечты разбились о реальность. Объединяя усилия сообщества, мы строим работающие продукты и создаем <strong>реальную конкуренцию жадным студиям</strong>.',
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
            case1Text: 'Исходный код наших проектов публикуется на GitHub. Вы можете свободно изучить структуру, предложить новые фичи или отправить Pull Request.',
            case2Title: 'Честный подход',
            case2Text: 'Мы не обещаем невозможного и не скрываем проблемы. Продукты становятся платными только тогда, когда их поддержка требует реальных ресурсов, а не ради наживы.',
            case3Title: 'Удобство и простота',
            case3Text: 'Никакого мусорного софта, навязчивой рекламы или лишних переходов. Вы получаете чистый рабочий инструмент в пару кликов.',
        },
        team: {
            title: 'Персонал проекта',
            intro: 'Участники, которые ведут разработку, поддерживают релизы и держат в порядке публичную часть проекта.',
            avatarFallback: 'Участник команды',
            empty: 'Нет участников.',
        },
        footer: {
            desc: 'Дочерний проект WeTTeA. Разработка игр, модификаций и DLC для пользователей.',
            navHeading: 'Навигация',
            wetteaHeading: 'Ссылки',
            tagline: 'Дочерний проект WeTTeA',
            navAria: 'Подвал — навигация',
            socialsAria: 'Социальные сети',
            donate: 'Поддержать',
            copyright: '© 2026. Все права защищены.',
        },
    },

    /* ── English ─────────────────────────────────────────── */
    en: {
        meta: {
            title: 'Aleph Studio',
            description:
                'Aleph Studio — developing games, mods, and DLC for users. We value the open source culture and create high-quality products.',
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
                'Game projects, mods, and DLC. We create quality content for our favorite games, value the open source culture, and give users true freedom.',
            ctaPrimary: 'See products',
            ctaSecondary: 'Our principle',
        },
        approach: {
            lead:
                'At Aleph Studio, we create games, mods, and DLC, basing all our development on three pillars: <strong>quality</strong>, <strong>convenience</strong>, and <strong>honesty</strong>. Users should <strong>understand exactly what is running on their machine</strong>, which is why we strive to keep our source code open wherever possible.<br><br>However, we remain realistic: <strong>we are not a charity</strong>. Complex development and infrastructure support require resources. We never take money out of thin air, but if hosting or maintaining a project costs money, the product will be paid. That is a fair approach.<br><br>We give users true freedom to shape our products. Anyone can fork our public repositories <strong>on GitHub</strong>, add their own features, and submit a <strong>Pull Request</strong> — clean and secure code will always be merged into the release. We hate seeing tons of dead code rotting on the internet from developers who tried to build everything alone just to be the "boss" but saw their dreams shattered by reality. By pooling the community\'s efforts, we build functioning products and offer <strong>real competition to greedy studios</strong>.',
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
            case1Title: 'Open source',
            case1Text: 'Our project source code is published on GitHub. Feel free to study the structure, suggest features, or submit a Pull Request.',
            case2Title: 'Honest approach',
            case2Text: 'We do not promise the impossible or hide issues. Products only become paid when their maintenance requires real resources, not for greed.',
            case3Title: 'Convenience & simplicity',
            case3Text: 'No junk software, intrusive ads, or extra steps. You get a clean, working tool in just a couple of clicks.',
        },
        team: {
            title: 'Project staff',
            intro: 'Members who lead development, maintain releases and keep the public side of the project in order.',
            avatarFallback: 'Team member avatar',
            empty: 'No team members.',
        },
        footer: {
            desc: 'A subsidiary project of WeTTeA. Developing games, mods, and DLC for users.',
            navHeading: 'Navigation',
            wetteaHeading: 'Links',
            tagline: 'A subsidiary of WeTTeA',
            navAria: 'Footer — navigation',
            socialsAria: 'Social links',
            donate: 'Support',
            copyright: '© 2026. All rights reserved.',
        },
    },

    /* ── Ukrainian ───────────────────────────────────────── */
    ua: {
        meta: {
            title: 'Aleph Studio',
            description:
                'Aleph Studio — розробка ігор, модифікацій та DLC для користувачів. Ми цінуємо культуру відкритого коду та створюємо якісні продукти.',
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
                'Ігрові проєкти, моди та DLC. Ми створюємо якісний контент для улюблених ігор, цінуємо культуру відкритого коду та даємо користувачам реальну свободу.',
            ctaPrimary: 'Переглянути продукти',
            ctaSecondary: 'Наш принцип',
        },
        approach: {
            lead:
                'В Aleph Studio ми створюємо ігри, модифікації та DLC, засновуючи всю розробку на трьох стовпах: <strong>якість</strong>, <strong>зручність</strong> та <strong>чесність</strong>. Користувач повинен <strong>розуміти, що саме працює на його машині</strong>, тому ми прагнемо відкривати вихідний код скрізь, де це можливо.<br><br>При цьому ми залишаємося реалістами: <strong>ми не благодійна організація</strong>. Складна розробка та підтримка інфраструктури потребують ресурсів. Ми ніколи не беремо гроші з повітря, але якщо утримання продукту коштує грошей — продукт буде платним. Це чесний підхід.<br><br>Ми даємо користувачам реальну свободу впливати на продукт. Кожен може скопіювати наш відкритий проєкт <strong>на GitHub</strong>, дописати свою фічу та надіслати <strong>Pull Request</strong> — чистий та безпечний код обов\'язково стане частиною релізу. Нам прикро бачити, як тонни мертвого коду лежать на просторах мережі у авторів, які намагалися робити все самотужки заради статусу "головного", але чиї мрії розбилися об реальність. Об\'єднуючи зусилля спільноти, ми будуємо працюючі продукти та створюємо <strong>реальну конкуренцію жадібним студіям</strong>.',
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
            case1Text: 'Вихідний код наших проєктів публікується на GitHub. Ви можете вільно вивчити структуру, запропонувати нові фічі або надіслати Pull Request.',
            case2Title: 'Чесний підхід',
            case2Text: 'Ми не обіцяємо неможливого і не приховуємо проблеми. Продукти стають платними лише тоді, коли їх підтримка потребує реальних ресурсів, а не заради наживи.',
            case3Title: 'Зручність та простота',
            case3Text: 'Жодного сміттєвого софту, нав\'язливої реклами чи зайвих переходів. Ви отримуєте чистий робочий інструмент у кілька кліків.',
        },
        team: {
            title: 'Персонал проєкту',
            intro: 'Учасники, які ведуть розробку, підтримують релізи та тримають у порядку публічну частину проєкту.',
            avatarFallback: 'Учасник команди',
            empty: 'Немає учасників.',
        },
        footer: {
            desc: 'Дочірній проєкт WeTTeA. Розробка ігор, модифікацій та DLC для користувачів.',
            navHeading: 'Навігація',
            wetteaHeading: 'Посилання',
            tagline: 'Дочірній проєкт WeTTeA',
            navAria: 'Підвал — навігація',
            socialsAria: 'Соціальні мережі',
            donate: 'Підтримати',
            copyright: '© 2026. Усі права захищено.',
        },
    },
});
