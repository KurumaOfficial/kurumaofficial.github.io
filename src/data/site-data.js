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
            "version": "1.6.0",
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
            "sourceUrl": "https://github.com/KurumaOfficial/1.21.8-Strange-Visuals-legacy",
            "downloadUrl": "./assets/files/strange-visuals-1.6.0.jar",
            "downloadName": "",
            "detailUrl": "products/strange-visuals/",
            "note": "Файл мода доступен по кнопке ниже.",
            "autoRouteRedirect": false,
            "routeModules": {
                "player": [
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    }
                ],
                "world": [
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    }
                ],
                "utils": [
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    }
                ],
                "other": [
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    }
                ],
                "interface": [
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": false
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
                        "enabled": true
                    },
                    {
                        "name": "test1",
                        "nameEn": "test1",
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
            },
            "media": [
                {
                    "type": "video",
                    "url": "https://www.youtube.com/watch?v=OvoJATIyCj4",
                    "dataUrl": "",
                    "alt": "",
                    "fileName": "",
                    "uploadKey": ""
                },
                {
                    "type": "image",
                    "url": "./assets/media/strange-visuals/1.webp",
                    "dataUrl": "",
                    "alt": "",
                    "fileName": "1.webp",
                    "uploadKey": "strange-visuals::media::assets/media/strange-visuals/1.webp"
                },
                {
                    "type": "image",
                    "url": "./assets/media/strange-visuals/2.webp",
                    "dataUrl": "",
                    "alt": "",
                    "fileName": "2.webp",
                    "uploadKey": "strange-visuals::media::assets/media/strange-visuals/2.webp"
                },
                {
                    "type": "image",
                    "url": "./assets/media/strange-visuals/3.webp",
                    "dataUrl": "",
                    "alt": "",
                    "fileName": "3.webp",
                    "uploadKey": "strange-visuals::media::assets/media/strange-visuals/3.webp"
                },
                {
                    "type": "image",
                    "url": "./assets/media/strange-visuals/4.webp",
                    "dataUrl": "",
                    "alt": "",
                    "fileName": "4.webp",
                    "uploadKey": "strange-visuals::media::assets/media/strange-visuals/4.webp"
                }
            ]
        },
        {
            "id": "aleph-minecraft-launcher",
            "title": "AMCLauncher",
            "version": "0.1.0",
            "tag": "active",
            "flag": "alpha",
            "status": "active",
            "featured": true,
            "featuredOrder": 2,
            "sortOrder": 2,
            "tone": "green",
            "summary": "Лаунчер для Minecraft от Aleph Studio. Открытый исходный код, бесплатно. В разработке.",
            "instructions": [],
            "sourceUrl": "https://github.com/KurumaOfficial",
            "downloadUrl": "",
            "downloadName": "",
            "detailUrl": "products/aleph-minecraft-launcher/",
            "note": "Лаунчер находится в разработке.",
            "autoRouteRedirect": false,
            "routeModules": {
                "player": [],
                "world": [],
                "utils": [],
                "other": [],
                "interface": [],
                "themes": []
            },
            "media": []
        },
        {
            "id": "aleph-trust",
            "title": "Aleph Trust",
            "version": "0.0.1",
            "tag": "active",
            "flag": "alpha",
            "status": "active",
            "featured": true,
            "featuredOrder": 3,
            "sortOrder": 3,
            "tone": "red",
            "summary": "Плагин для Minecraft-серверов от Aleph Studio. Подписочная модель, закрытый код. Ранний концепт.",
            "instructions": [],
            "sourceUrl": "",
            "downloadUrl": "",
            "downloadName": "",
            "detailUrl": "products/aleph-trust/",
            "note": "Ранний концепт. Подробности появятся позже.",
            "autoRouteRedirect": false,
            "routeModules": {
                "player": [],
                "world": [],
                "utils": [],
                "other": [],
                "interface": [],
                "themes": []
            },
            "media": []
        }
    ],
    "team": [
        {
            "id": "team-member-01",
            "name": "Kuruma",
            "role": "Основатель",
            "avatarUrl": "https://i.pinimg.com/736x/3d/22/0d/3d220dfb8d97629479c42ced6ebf3e9c.jpg",
            "description": "Плохой человек",
            "sortOrder": 1
        },
        {
            "id": "team-member-03",
            "name": "GARAKIL",
            "role": "Разработчик",
            "avatarUrl": "https://i.pinimg.com/736x/e0/3e/da/e03edad288f1412795ef88787ec2eb7b.jpg",
            "description": "просто есть",
            "sortOrder": 3
        },
        {
            "id": "team-member-1781008791243-1",
            "name": "FiyZzy",
            "role": "Персонал",
            "avatarUrl": "https://i.pinimg.com/736x/25/60/e1/2560e1cbf27a9cfa78faccde40971482.jpg",
            "description": "Всегда в сети",
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
