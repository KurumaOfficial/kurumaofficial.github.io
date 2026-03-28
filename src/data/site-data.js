/**
 * @fileoverview Default site content — products, team, socials.
 * This block is the single source of truth for the public site.
 * Admin tools read / write between the DATA markers below.
 * @module data/site-data
 */

/*__ALEPH_SITE_DATA_START__*/
export const DEFAULT_SITE_DATA = {
    "products": [
        {
            "id": "strange-visuals",
            "title": "Strange Visuals",
            "version": "1.1.0",
            "tag": "Активно",
            "flag": "release",
            "status": "активно",
            "featured": true,
            "featuredOrder": 1,
            "sortOrder": 1,
            "tone": "green",
            "summary": "Форк визуального мода для Minecraft Fabric 1.21.8. Доступен для прямой установки, а исходный код открыт в публичном репозитории.",
            "instructions": [
                "Установите Minecraft Fabric 1.21.8 в вашем лаунчере.",
                "Скачайте Fabric API: https://modrinth.com/mod/fabric-api и закиньте файл в папку mods.",
                "После этого скачайте наш мод и тоже закиньте его в папку mods.",
                "Готово — можно запускать."
            ],
            "sourceUrl": "https://github.com/KurumaOfficial/1.21.8-Strange-Visuals-legacy",
            "downloadUrl": "./assets/files/strange-visuals-1.1.0-strange-visuals-v1.jar",
            "detailUrl": "products/strange-visuals/",
            "note": "Файл мода доступен по кнопке ниже.",
            "autoRouteRedirect": false,
            "routeModules": {
                "player": [
                    { "name": "Боксы", "enabled": true },
                    { "name": "Джампики", "enabled": true },
                    { "name": "Китайская шляпа", "enabled": true },
                    { "name": "Таргет рендер", "enabled": true },
                    { "name": "Хит бабл", "enabled": false }
                ],
                "world": [
                    { "name": "Чамсы", "enabled": true },
                    { "name": "Трейсеры", "enabled": false },
                    { "name": "Снаряды", "enabled": true },
                    { "name": "Частицы", "enabled": true },
                    { "name": "Блок оверлей", "enabled": false },
                    { "name": "Дроп рендер", "enabled": true },
                    { "name": "Скелетон", "enabled": false }
                ],
                "utils": [
                    { "name": "Авто спринт", "enabled": true },
                    { "name": "Авто тул", "enabled": false },
                    { "name": "Фуллбрайт", "enabled": true },
                    { "name": "Ноу оверлей", "enabled": true },
                    { "name": "Координаты", "enabled": true },
                    { "name": "Таймер", "enabled": false }
                ],
                "other": [
                    { "name": "Антибот", "enabled": false },
                    { "name": "Прокси", "enabled": false },
                    { "name": "Дебаг мод", "enabled": true },
                    { "name": "Ник хайдер", "enabled": true }
                ],
                "interface": [
                    { "name": "Массив лист", "enabled": true },
                    { "name": "Ватермарка", "enabled": true },
                    { "name": "Кейбинды", "enabled": false },
                    { "name": "Нотификации", "enabled": true },
                    { "name": "Хотбар", "enabled": true },
                    { "name": "Скорборд", "enabled": false },
                    { "name": "Табулист", "enabled": true },
                    { "name": "Кроссхейр", "enabled": true }
                ],
                "themes": [
                    { "name": "Стандарт", "enabled": true },
                    { "name": "Минимализм", "enabled": false },
                    { "name": "Неон", "enabled": false },
                    { "name": "Ретро", "enabled": false }
                ]
            }
        },
        {
            "id": "next-release",
            "title": "Неизвестно",
            "version": "0.0.0",
            "tag": "Неизвестно",
            "flag": "",
            "status": "в разработке",
            "featured": true,
            "featuredOrder": 2,
            "sortOrder": 2,
            "tone": "red",
            "summary": "Этот слот зарезервирован под следующий публичный релиз Aleph Studio.",
            "instructions": [],
            "sourceUrl": "",
            "downloadUrl": "",
            "detailUrl": "",
            "note": "Подробности появятся позже.",
            "autoRouteRedirect": false,
            "routeModules": {}
        },
        {
            "id": "third-project",
            "title": "Неизвестно",
            "version": "x",
            "tag": "Неизвестно",
            "flag": "",
            "status": "планируется",
            "featured": true,
            "featuredOrder": 3,
            "sortOrder": 3,
            "tone": "red",
            "summary": "Этот слот зарезервирован под следующий публичный релиз Aleph Studio.",
            "instructions": [],
            "sourceUrl": "",
            "downloadUrl": "",
            "detailUrl": "",
            "note": "Подробности появятся позже.",
            "autoRouteRedirect": false,
            "routeModules": {}
        }
    ],
    "team": [
        {
            "id": "team-member-01",
            "name": "Kuruma",
            "role": "Основатель",
            "avatarUrl": "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcm45aXN6cnFnY2toMzc3dHFucml2czYwa3licHd4OHBpd2JkazBxMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/12swa4UfSd6Viw/giphy.gif",
            "description": "Попа",
            "sortOrder": 1
        },
        {
            "id": "team-member-02",
            "name": "notyx",
            "role": "Администратор",
            "avatarUrl": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdmF6eGxqaWtxcXNwbWU0cGZodGZsbWxhOXY4amE3cDNva2h0N3B2dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EvpaQ7YVPCZvG/giphy.gif",
            "description": "Плейбой, миллиардер, филантроп",
            "sortOrder": 2
        },
        {
            "id": "team-member-03",
            "name": "GARAKIL",
            "role": "Разработчик",
            "avatarUrl": "",
            "description": "Держит проект в порядке, понимает общую картину и закрывает самые сложные задачи. Техлид.",
            "sortOrder": 3
        },
        {
            "id": "team-member-04",
            "name": "El LetRak",
            "role": "Мл. Разработчик",
            "avatarUrl": "",
            "description": "Помогает с багами, поддержкой и мелкими правками. Следит за проблемами, разбирает ошибки.",
            "sortOrder": 4
        }
    ],
    "supportPage": {
        "minimumAmountUsd": 2,
        "buttons": [
            {
                "id": "support-fanpay",
                "label": "Оплата картой",
                "title": "FanPay",
                "note": "Visa / Mastercard / СБП",
                "url": "",
                "sortOrder": 1
            },
            {
                "id": "support-donationalerts",
                "label": "Donation Alerts",
                "title": "Donate",
                "note": "Быстрый донат со стримов",
                "url": "",
                "sortOrder": 2
            }
        ],
        "supporters": []
    },
    "socials": {
        "youtube": "https://www.youtube.com/@KurumaBestWaify",
        "discord": "https://discord.gg/3YxB2R6eqQ",
        "telegram": "https://t.me/AlephStudio_Official"
    }
};
/*__ALEPH_SITE_DATA_END__*/
