import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { deepClone, normalizeData } from '../core/site-utils.js';

const BASELINE_SITE_DATA = normalizeData(DEFAULT_SITE_DATA);
const BASELINE_PRODUCT_MAP = new Map(BASELINE_SITE_DATA.products.map((item) => [item.id, item]));
const BASELINE_TEAM_MAP = new Map(BASELINE_SITE_DATA.team.map((item) => [item.id, item]));

const SITE_DATA_TRANSLATIONS = Object.freeze({
    en: {
        products: {
            'strange-visuals': {
                tag: 'Live release',
                status: 'active',
                summary: 'A legacy visual mod for Minecraft Fabric 1.21.8. It is available as a direct download and the source code is open in a public repository.',
                instructions: [
                    'Install Minecraft Fabric 1.21.8 in your launcher.',
                    'Download Fabric API from https://modrinth.com/mod/fabric-api and place the file into the mods folder.',
                    'Then download our mod and place it into the same mods folder.',
                    'Done — you can launch the game.'
                ],
                note: 'The mod file is available through the button below.'
            },
            'next-release': {
                title: 'Unknown',
                tag: 'Unknown',
                status: 'in development',
                summary: 'This slot is reserved for the next public Aleph Studio release.',
                note: 'More details will appear later.'
            },
            'third-project': {
                title: 'Unknown',
                tag: 'Unknown',
                status: 'planned',
                summary: 'This slot is reserved for another future mod, game or experimental release by Aleph Studio.',
                note: 'More details will appear later.'
            }
        },
        team: {
            'team-member-01': {
                role: 'Founder',
                description: 'Something is broken?\nThen you probably need more intelligence.'
            },
            'team-member-02': {
                role: 'Administrator',
                description: 'Playboy, billionaire, philanthropist.'
            },
            'team-member-03': {
                role: 'Community',
                description: 'Cool.'
            },
            'team-member-1773860077218': {
                name: 'New member',
                role: 'Role',
                description: 'Add a description for this team member from the “Misc” section.'
            }
        }
    },
    ua: {
        products: {
            'strange-visuals': {
                tag: 'Активно',
                status: 'активно',
                summary: 'Легасі-візуальний мод для Minecraft Fabric 1.21.8. Доступний для прямого встановлення, а вихідний код відкритий у публічному репозиторії.',
                instructions: [
                    'Встанови Minecraft Fabric 1.21.8 у своєму лаунчері.',
                    'Завантаж Fabric API з https://modrinth.com/mod/fabric-api і поклади файл у папку mods.',
                    'Після цього завантаж наш мод і також поклади його в папку mods.',
                    'Готово — можна запускати.'
                ],
                note: 'Файл мода доступний за кнопкою нижче.'
            },
            'next-release': {
                title: 'Невідомо',
                tag: 'Невідомо',
                status: 'у розробці',
                summary: 'Цей слот зарезервований під наступний публічний реліз Aleph Studio.',
                note: 'Подробиці з’являться пізніше.'
            },
            'third-project': {
                title: 'Невідомо',
                tag: 'Невідомо',
                status: 'планується',
                summary: 'Цей слот зарезервований під майбутній мод, гру або експериментальний реліз Aleph Studio.',
                note: 'Подробиці з’являться пізніше.'
            }
        },
        team: {
            'team-member-01': {
                role: 'Засновник',
                description: 'Щось не працює?\nТоді тобі, мабуть, бракує інтелекту.'
            },
            'team-member-02': {
                role: 'Адміністратор',
                description: 'Плейбой, мільярдер, філантроп.'
            },
            'team-member-03': {
                role: 'Ком’юніті',
                description: 'Крутий.'
            },
            'team-member-1773860077218': {
                name: 'Новий учасник',
                role: 'Роль',
                description: 'Додай опис учасника через розділ «Прочее».'
            }
        }
    }
});

function isSameValue(currentValue, baselineValue) {
    if (Array.isArray(currentValue) || Array.isArray(baselineValue)) {
        return JSON.stringify(currentValue || []) === JSON.stringify(baselineValue || []);
    }
    return String(currentValue ?? '').trim() === String(baselineValue ?? '').trim();
}

function cloneTranslatedValue(value) {
    return Array.isArray(value) ? [...value] : value;
}

function applyEntityTranslations(entity, baselineEntity, translations) {
    if (!entity || !baselineEntity || !translations) return;

    Object.entries(translations).forEach(([field, translatedValue]) => {
        if (!Object.prototype.hasOwnProperty.call(entity, field)) return;
        if (!isSameValue(entity[field], baselineEntity[field])) return;
        entity[field] = cloneTranslatedValue(translatedValue);
    });
}

export function localizeSiteData(data, locale) {
    const normalizedData = normalizeData(data);
    if (locale === 'ru') {
        return normalizedData;
    }

    const localized = deepClone(normalizedData);
    const translationBundle = SITE_DATA_TRANSLATIONS[locale];
    if (!translationBundle) {
        return localized;
    }

    localized.products.forEach((product) => {
        applyEntityTranslations(
            product,
            BASELINE_PRODUCT_MAP.get(product.id),
            translationBundle.products?.[product.id]
        );
    });

    localized.team.forEach((member) => {
        applyEntityTranslations(
            member,
            BASELINE_TEAM_MAP.get(member.id),
            translationBundle.team?.[member.id]
        );
    });

    return localized;
}
