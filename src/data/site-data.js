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
            "version": "1.5.1",
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
            "autoRouteRedirect": true,
            "routeModules": {
                "player": [
                    {
                        "name": "Боксы",
                        "enabled": true
                    },
                    {
                        "name": "Китайская шляпа",
                        "enabled": true
                    },
                    {
                        "name": "Круги прыжка",
                        "enabled": true
                    },
                    {
                        "name": "Таргет рендер",
                        "enabled": true
                    },
                    {
                        "name": "Хит бабл",
                        "enabled": true
                    },
                    {
                        "name": "Частицы игрока",
                        "enabled": true
                    },
                    {
                        "name": "Шейдерная рука",
                        "enabled": true
                    },
                    {
                        "name": "Шлейф",
                        "enabled": true
                    },
                    {
                        "name": "Эффект убийства",
                        "enabled": true
                    }
                ],
                "world": [
                    {
                        "name": "Кубики",
                        "enabled": true
                    },
                    {
                        "name": "Обводка блока",
                        "enabled": true
                    },
                    {
                        "name": "Призрак",
                        "enabled": true
                    },
                    {
                        "name": "Частицы мира",
                        "enabled": true
                    },
                    {
                        "name": "Эффект прыжка",
                        "enabled": true
                    }
                ],
                "utils": [
                    {
                        "name": "GPS",
                        "enabled": true
                    },
                    {
                        "name": "Авто бег",
                        "enabled": true
                    },
                    {
                        "name": "Авто подключение (ST)",
                        "enabled": true
                    },
                    {
                        "name": "Авто респавн",
                        "enabled": true
                    },
                    {
                        "name": "Добавить друга",
                        "enabled": true
                    },
                    {
                        "name": "ПвП хелпер",
                        "enabled": true
                    },
                    {
                        "name": "Прокрутка предметов",
                        "enabled": true
                    },
                    {
                        "name": "Тейп маус",
                        "enabled": true
                    },
                    {
                        "name": "Фейк игрок",
                        "enabled": true
                    },
                    {
                        "name": "Фри лук",
                        "enabled": true
                    },
                    {
                        "name": "ФТ хелпер",
                        "enabled": true
                    },
                    {
                        "name": "Хит саунд",
                        "enabled": true
                    },
                    {
                        "name": "Чат хелпер",
                        "enabled": true
                    },
                    {
                        "name": "Шифт тап",
                        "enabled": true
                    }
                ],
                "other": [
                    {
                        "name": "Аспект ратион",
                        "enabled": true
                    },
                    {
                        "name": "АукХелпер",
                        "enabled": true
                    },
                    {
                        "name": "Без рендера",
                        "enabled": true
                    },
                    {
                        "name": "Время суток",
                        "enabled": true
                    },
                    {
                        "name": "Гамма",
                        "enabled": true
                    },
                    {
                        "name": "Звуки мода",
                        "enabled": true
                    },
                    {
                        "name": "Кастомный туман",
                        "enabled": true
                    },
                    {
                        "name": "Оптимизация",
                        "enabled": true
                    },
                    {
                        "name": "Физика предметов",
                        "enabled": true
                    },
                    {
                        "name": "Фильтры экрана",
                        "enabled": true
                    }
                ],
                "interface": [
                    {
                        "name": "Водяной знак",
                        "enabled": true
                    },
                    {
                        "name": "Кастомные руки",
                        "enabled": true
                    },
                    {
                        "name": "Кастомный прицел",
                        "enabled": true
                    },
                    {
                        "name": "Клик гуи",
                        "enabled": true
                    },
                    {
                        "name": "Плавный интерфейс",
                        "enabled": true
                    }
                ],
                "themes": [
                    {
                        "name": "Стандарт",
                        "enabled": true
                    },
                    {
                        "name": "Минимализм",
                        "enabled": false
                    },
                    {
                        "name": "Неон",
                        "enabled": false
                    },
                    {
                        "name": "Ретро",
                        "enabled": false
                    }
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
            "routeModules": {
                "player": [],
                "world": [],
                "utils": [],
                "other": [],
                "interface": [],
                "themes": []
            }
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
            "routeModules": {
                "player": [],
                "world": [],
                "utils": [],
                "other": [],
                "interface": [],
                "themes": []
            }
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
        "roleName": "@Premium",
        "buttons": [
            {
                "id": "support-fanpay",
                "label": "Поддержать",
                "title": "FanPay",
                "note": "Visa / Mastercard / СБП",
                "url": "https://funpay.com/lots/offer?id=66282874",
                "sortOrder": 2
            },
            {
                "id": "support-donationalerts",
                "label": "Donation Alerts",
                "title": "Donation Alerts",
                "note": "Visa / Mastercard / МИР / СБП / SberPay / ЮMoney / QIWI / WebMoney / PayPal / Apple Pay / Google Pay / Крипта / Мобильные платежи",
                "url": "https://www.donationalerts.com/r/kuruma_official",
                "sortOrder": 1
            }
        ],
        "supporters": [
            {
                "id": "supporter-1775687891992",
                "name": "Новый поддержавший",
                "avatarUrl": "",
                "amountUsd": 0,
                "sortOrder": 1
            },
            {
                "id": "supporter-1775687892184",
                "name": "Новый поддержавший",
                "avatarUrl": "",
                "amountUsd": 0,
                "sortOrder": 2
            },
            {
                "id": "supporter-1775687892356",
                "name": "Новый поддержавший",
                "avatarUrl": "",
                "amountUsd": 0,
                "sortOrder": 3
            }
        ]
    },
    "socials": {
        "youtube": "https://www.youtube.com/@KurumaBestWaify",
        "discord": "https://discord.gg/3YxB2R6eqQ",
        "telegram": "https://t.me/AlephStudio_Official"
    }
};
/*__ALEPH_SITE_DATA_END__*/
