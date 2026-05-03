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
            "tag": "active",
            "flag": "release",
            "status": "active",
            "featured": true,
            "featuredOrder": 1,
            "sortOrder": 1,
            "tone": "green",
            "summary": "Strange Visuals сфокусирован на визуальных улучшениях, которые не нарушают правила серверов.",
            "instructions": [
                "Установите Minecraft Fabric 1.21.8 в вашем лаунчере.",
                "Скачайте Fabric API: https://modrinth.com/mod/fabric-api и закиньте файл в папку mods.",
                "После этого скачайте наш мод и тоже закиньте его в папку mods.",
                "Готово — можно запускать."
            ],
            "sourceUrl": "",
            "downloadUrl": "./assets/files/strange-visuals.jar",
            "downloadName": "",
            "detailUrl": "products/strange-visuals/",
            "note": "Файл мода доступен по кнопке ниже.",
            "autoRouteRedirect": true,
            "routeModules": {
                "player": [
                    {
                        "name": "Боксы",
                        "nameEn": "Boxes",
                        "enabled": true
                    },
                    {
                        "name": "Джампики",
                        "nameEn": "Jump Circles",
                        "enabled": true
                    },
                    {
                        "name": "Китайская шляпа",
                        "nameEn": "China Hat",
                        "enabled": true
                    },
                    {
                        "name": "Таргет рендер",
                        "nameEn": "Target Render",
                        "enabled": true
                    },
                    {
                        "name": "Хит бабл",
                        "nameEn": "Hit Bubble",
                        "enabled": false
                    }
                ],
                "world": [
                    {
                        "name": "Чамсы",
                        "nameEn": "Chams",
                        "enabled": true
                    },
                    {
                        "name": "Трейсеры",
                        "nameEn": "Tracers",
                        "enabled": false
                    },
                    {
                        "name": "Снаряды",
                        "nameEn": "Projectiles",
                        "enabled": true
                    },
                    {
                        "name": "Частицы",
                        "nameEn": "Particles",
                        "enabled": true
                    },
                    {
                        "name": "Блок оверлей",
                        "nameEn": "Block Overlay",
                        "enabled": false
                    },
                    {
                        "name": "Дроп рендер",
                        "nameEn": "Item Drop Render",
                        "enabled": true
                    },
                    {
                        "name": "Скелетон",
                        "nameEn": "Skeleton",
                        "enabled": false
                    }
                ],
                "utils": [
                    {
                        "name": "Авто спринт",
                        "nameEn": "Auto Sprint",
                        "enabled": true
                    },
                    {
                        "name": "Авто тул",
                        "nameEn": "Auto Tool",
                        "enabled": false
                    },
                    {
                        "name": "Фуллбрайт",
                        "nameEn": "Fullbright",
                        "enabled": true
                    },
                    {
                        "name": "Ноу оверлей",
                        "nameEn": "No Overlay",
                        "enabled": true
                    },
                    {
                        "name": "Координаты",
                        "nameEn": "Coordinates",
                        "enabled": true
                    },
                    {
                        "name": "Таймер",
                        "nameEn": "Timer",
                        "enabled": false
                    }
                ],
                "other": [
                    {
                        "name": "Антибот",
                        "nameEn": "Anti-Bot",
                        "enabled": false
                    },
                    {
                        "name": "Прокси",
                        "nameEn": "Proxy",
                        "enabled": false
                    },
                    {
                        "name": "Дебаг режим",
                        "nameEn": "Debug Mode",
                        "enabled": true
                    },
                    {
                        "name": "Ник хайдер",
                        "nameEn": "Name Hider",
                        "enabled": true
                    }
                ],
                "interface": [
                    {
                        "name": "Массив лист",
                        "nameEn": "Array List",
                        "enabled": true
                    },
                    {
                        "name": "Ватермарка",
                        "nameEn": "Watermark",
                        "enabled": true
                    },
                    {
                        "name": "Кейбинды",
                        "nameEn": "Keybinds",
                        "enabled": false
                    },
                    {
                        "name": "Нотификации",
                        "nameEn": "Notifications",
                        "enabled": true
                    },
                    {
                        "name": "Хотбар",
                        "nameEn": "Hotbar",
                        "enabled": true
                    },
                    {
                        "name": "Скорборд",
                        "nameEn": "Scoreboard",
                        "enabled": false
                    },
                    {
                        "name": "Табулист",
                        "nameEn": "Tab List",
                        "enabled": true
                    },
                    {
                        "name": "Кроссхейр",
                        "nameEn": "Crosshair",
                        "enabled": true
                    }
                ],
                "themes": [
                    {
                        "name": "Белая",
                        "nameEn": "White",
                        "enabled": true
                    },
                    {
                        "name": "Черная",
                        "nameEn": "Black",
                        "enabled": true
                    },
                    {
                        "name": "Прозрачная белая",
                        "nameEn": "Transparent White",
                        "enabled": true
                    },
                    {
                        "name": "Прозрачная черная",
                        "nameEn": "Transparent Black",
                        "enabled": true
                    },
                    {
                        "name": "Розовая",
                        "nameEn": "Pink",
                        "enabled": true
                    },
                    {
                        "name": "Фиолетовая",
                        "nameEn": "Violet",
                        "enabled": true
                    }
                ]
            }
        },
        {
            "id": "next-release",
            "title": "Неизвестно",
            "version": "0.0.0",
            "tag": "frozen",
            "flag": "",
            "status": "frozen",
            "featured": true,
            "featuredOrder": 2,
            "sortOrder": 2,
            "tone": "red",
            "summary": "Этот слот зарезервирован под следующий публичный релиз Aleph Studio.",
            "instructions": [],
            "sourceUrl": "",
            "downloadUrl": "",
            "downloadName": "",
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
            "tag": "abandoned",
            "flag": "",
            "status": "abandoned",
            "featured": true,
            "featuredOrder": 3,
            "sortOrder": 3,
            "tone": "red",
            "summary": "Этот слот зарезервирован под следующий публичный релиз Aleph Studio.",
            "instructions": [],
            "sourceUrl": "",
            "downloadUrl": "",
            "downloadName": "",
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
            "description": "Формирует направление студии, отвечает за ключевые решения и общий вектор развития проекта.",
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
                "id": "support-funpay",
                "label": "Поддержать",
                "title": "FunPay",
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
                "id": "supporter-567713040351494174",
                "name": "ᴡᴇʟᴡᴇʀ_ɢᴀɴ",
                "avatarUrl": "https://cdn.discordapp.com/avatars/567713040351494174/35df3dbca620b7f1dfbad1b84f97998b.png?size=256",
                "amountUsd": 3,
                "sortOrder": 1
            },
            {
                "id": "supporter-727201783625285672",
                "name": "Dobccer",
                "avatarUrl": "https://cdn.discordapp.com/avatars/727201783625285672/a206722acd404152bdf94d6d2a4f6761.png?size=256",
                "amountUsd": 2,
                "sortOrder": 2
            },
            {
                "id": "supporter-733668671779766313",
                "name": "АЛЕКСЕЙ",
                "avatarUrl": "https://cdn.discordapp.com/avatars/733668671779766313/679677d9f2afd78198438378ae76b2f1.png?size=256",
                "amountUsd": 2,
                "sortOrder": 3
            },
            {
                "id": "supporter-891539316474527744",
                "name": "Draff3434",
                "avatarUrl": "",
                "amountUsd": 2,
                "sortOrder": 4
            },
            {
                "id": "supporter-1051504786203222117",
                "name": "AD | James Grace | 5913",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1051504786203222117/622c1ed4fd81b36214f83750c85c664d.png?size=256",
                "amountUsd": 2,
                "sortOrder": 5
            },
            {
                "id": "supporter-1053002738922962945",
                "name": "S42949",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1053002738922962945/f50e98cf31dc72d81eb4e2384c666eda.png?size=256",
                "amountUsd": 2,
                "sortOrder": 6
            },
            {
                "id": "supporter-1079398032803643503",
                "name": "♡ sodochkaオタク♡",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1079398032803643503/a81f481e69a7881168bd8e7bc6c3acca.png?size=256",
                "amountUsd": 2,
                "sortOrder": 7
            },
            {
                "id": "supporter-1124269248190103665",
                "name": "cerdise",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1124269248190103665/d6e5037776dfceb729c8c06fb28d3f0a.png?size=256",
                "amountUsd": 4,
                "sortOrder": 9
            },
            {
                "id": "supporter-1132709226167402586",
                "name": "kalry",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1132709226167402586/40c06db5b2acc39d711e256d07235c9f.png?size=256",
                "amountUsd": 2,
                "sortOrder": 10
            },
            {
                "id": "supporter-1133014224659021895",
                "name": "koti4kaa",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1133014224659021895/076f886783635ab4d40ae4228bb6e3f9.png?size=256",
                "amountUsd": 2,
                "sortOrder": 11
            },
            {
                "id": "supporter-1170330309208842250",
                "name": "точно пон",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1170330309208842250/b19cca45168ad33f5902302feade8129.png?size=256",
                "amountUsd": 2,
                "sortOrder": 12
            },
            {
                "id": "supporter-1184124930573475864",
                "name": "Nomadvorga",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1184124930573475864/04b2e0a482c16dcc801e9db1c804c461.png?size=256",
                "amountUsd": 3,
                "sortOrder": 13
            },
            {
                "id": "supporter-1185734375183237180",
                "name": "Коть",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1185734375183237180/6f6bab857fbaff53f8a64aa4e75facdd.png?size=256",
                "amountUsd": 2,
                "sortOrder": 14
            },
            {
                "id": "supporter-1218209881098555472",
                "name": "(Whyy?) qw0wq",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1218209881098555472/48fd28872798ec69fbb15e7ec2348f6c.png?size=256",
                "amountUsd": 2,
                "sortOrder": 15
            },
            {
                "id": "supporter-1255609844623212736",
                "name": "Молочный зубик",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1255609844623212736/91a04d6100f87e3035b38073fc395d2b.png?size=256",
                "amountUsd": 2,
                "sortOrder": 17
            },
            {
                "id": "supporter-1291298249033908396",
                "name": "Водяной",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1291298249033908396/bc611dc5e58917006765fddc63e947ff.png?size=256",
                "amountUsd": 7,
                "sortOrder": 18
            },
            {
                "id": "supporter-1317475563312644178",
                "name": "𝗱𝗿𝗲𝗸𝘃𝗲𝘁",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1317475563312644178/2a2cd23be66d5058b2c3c9685db543cc.png?size=256",
                "amountUsd": 2,
                "sortOrder": 19
            },
            {
                "id": "supporter-1342916631671738430",
                "name": "Папка хоумлендер",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1342916631671738430/9b3a93b2d0ce6304d20284cc79cdb0b7.png?size=256",
                "amountUsd": 2,
                "sortOrder": 21
            },
            {
                "id": "supporter-1352212012414795827",
                "name": "alusiss",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1352212012414795827/0cf360373f4d7df391e792a29cccacb3.png?size=256",
                "amountUsd": 2,
                "sortOrder": 22
            },
            {
                "id": "supporter-1355667776336957551",
                "name": "! .𝙛𝙡𝙤𝙨𝙨.",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1355667776336957551/c695d9a7bad598527f768b8ad40740dc.png?size=256",
                "amountUsd": 2,
                "sortOrder": 23
            },
            {
                "id": "supporter-1356568559026966654",
                "name": "logintojoin",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1356568559026966654/06508aeb5e8bc35b0b3ab2dff44bfc00.png?size=256",
                "amountUsd": 2,
                "sortOrder": 24
            },
            {
                "id": "supporter-1359596143129919651",
                "name": "грустни криперочек 2",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1359596143129919651/e695876cae455611a6e51146e2046e7d.png?size=256",
                "amountUsd": 2,
                "sortOrder": 25
            },
            {
                "id": "supporter-1366124388490940528",
                "name": "Sade",
                "avatarUrl": "https://i.pinimg.com/736x/4d/b2/6f/4db26f7ccd5cf70cc605a2ab25344257.jpg",
                "amountUsd": 2,
                "sortOrder": 26
            },
            {
                "id": "supporter-1384921447176343632",
                "name": "rusl1k",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1384921447176343632/1663567d0c32d208093ab38697143940.png?size=256",
                "amountUsd": 2,
                "sortOrder": 27
            },
            {
                "id": "supporter-1389546320502722592",
                "name": "DemoSystem // Брат Барсика // DM",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1389546320502722592/9fafa5a6eca1a9e6c90be4203f2cb638.png?size=256",
                "amountUsd": 2,
                "sortOrder": 28
            },
            {
                "id": "supporter-1393592010279227463",
                "name": "out144fjhs😎",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1393592010279227463/3513c947ee6b49dccf6fffe40a313293.png?size=256",
                "amountUsd": 2,
                "sortOrder": 29
            },
            {
                "id": "supporter-1401909153299038318",
                "name": "AlexanderCruel | uncle.wtf",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1401909153299038318/cbc8f076ac6bf80cb8ae9c61cf579641.png?size=256",
                "amountUsd": 2,
                "sortOrder": 30
            },
            {
                "id": "supporter-1442856717959299113",
                "name": "br4d0ik",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1442856717959299113/15cb2a5079c98049e016d5921a1c1e4f.png?size=256",
                "amountUsd": 2,
                "sortOrder": 31
            },
            {
                "id": "supporter-1453404424616804549",
                "name": "Пloxaya_Devo4ka",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1453404424616804549/e90ef9024b61a2d74621f0a8d2412f90.png?size=256",
                "amountUsd": 2,
                "sortOrder": 32
            },
            {
                "id": "supporter-1470031159600615618",
                "name": "Neverlifer",
                "avatarUrl": "https://cdn.discordapp.com/avatars/1470031159600615618/aee44bb0c86384cb3c9b1005b80e1cf0.png?size=256",
                "amountUsd": 2,
                "sortOrder": 34
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
