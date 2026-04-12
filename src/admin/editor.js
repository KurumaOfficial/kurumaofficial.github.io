import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { LOCAL_DATA_KEY, SECRET_SEQUENCE, SOCIAL_PLATFORMS, SOCIAL_ICON_SVG } from '../core/constants.js';
import {
    deepClone,
    formatBytes,
    getFlagMeta,
    makeUniqueId,
    normalizeData,
    normalizeProduct,
    normalizeRouteModules,
    normalizeSupportButton,
    normalizeSupporter,
    normalizeTeamMember,
    ROUTE_MODULE_KEYS,
    toNumber,
} from '../core/data-utils.js';
import { cleanUrl, escapeHtml, optimizeDiscordAvatarUrl } from '../core/dom.js';
import { navigateWithRouteTransition } from '../core/site-shell.js';
import { createGitHubPublisher } from '../github/publisher.js';

const GITHUB_CONTENTS_MAX_FILE_BYTES = 100 * 1024 * 1024;
const PREVIEW_DISCORD_IMAGE_SIZE = 256;
const ROUTE_MODULE_LABELS = Object.freeze({
    ru: { player: 'Player (На игроке)', world: 'World (В мире)', utils: 'Utilities (Утилиты)', other: 'Other (Остальное)', interface: 'Interface (Интерфейс)', themes: 'Themes (Темы)' },
    en: { player: 'Player', world: 'World', utils: 'Utilities', other: 'Other', interface: 'Interface', themes: 'Themes' },
    ua: { player: 'Player (На гравці)', world: 'World (У світі)', utils: 'Utilities (Утиліти)', other: 'Other (Інше)', interface: 'Interface (Інтерфейс)', themes: 'Themes (Теми)' },
});

const ADMIN_VIEW_COPY = Object.freeze({
    ru: {
        home: { title: 'Главная', subtitle: 'Центр управления черновиком, публикацией и быстрыми переходами по админке.' },
        products: { title: 'Продукты', subtitle: 'Управление карточками, ссылками, порядком и публикацией релизов.' },
        support: { title: 'Поддержка', subtitle: 'Управление страницей donate, способами оплаты и карточками поддержавших.' },
        misc: { title: 'Прочее', subtitle: 'Команда, социальные ссылки и дополнительные настройки витрины.' },
        nav: { section: 'Навигация', ariaLabel: 'Разделы админки', brandLabel: 'Открыть витрину Aleph Studio' },
        header: { json: 'JSON', import: 'Импорт', discard: 'Откатить', apply: 'Применить', closeLabel: 'Закрыть', themeLabel: 'Переключить тему' },
    },
    en: {
        home: { title: 'Home', subtitle: 'Control draft state, publication and quick admin navigation.' },
        products: { title: 'Products', subtitle: 'Manage cards, links, order and publication state for releases.' },
        support: { title: 'Support', subtitle: 'Manage the donate route, support buttons and supporter cards.' },
        misc: { title: 'Misc', subtitle: 'Team, social links and additional showcase settings.' },
        nav: { section: 'Navigation', ariaLabel: 'Admin sections', brandLabel: 'Open Aleph Studio showcase' },
        header: { json: 'JSON', import: 'Import', discard: 'Discard', apply: 'Apply', closeLabel: 'Close', themeLabel: 'Toggle theme' },
    },
    ua: {
        home: { title: 'Головна', subtitle: 'Центр керування чернеткою, публікацією та швидкими переходами в адмінці.' },
        products: { title: 'Продукти', subtitle: 'Керування картками, посиланнями, порядком та публікацією релізів.' },
        support: { title: 'Підтримка', subtitle: 'Керування donate-сторінкою, способами підтримки та картками тих, хто підтримав.' },
        misc: { title: 'Інше', subtitle: 'Команда, соціальні посилання та додаткові налаштування вітрини.' },
        nav: { section: 'Навігація', ariaLabel: 'Розділи адмінки', brandLabel: 'Відкрити вітрину Aleph Studio' },
        header: { json: 'JSON', import: 'Імпорт', discard: 'Відкотити', apply: 'Застосувати', closeLabel: 'Закрити', themeLabel: 'Перемкнути тему' },
    },
});

const ADMIN_MESSAGES = Object.freeze({
    ru: {
        editing: 'Редактирование',
        editingMember: 'Редактирование участника',
        noDescription: 'Нет описания',
        draft: 'Черновик',
        showcase: 'Витрина',
        enabled: 'Включено',
        draftClean: 'Без изменений',
        draftDirty: 'Нужен apply',
        draftReadyPublish: 'Готов к публикации',
        draftReadySave: 'Готов к сохранению',
        filesCount: '{0} файлов',
        prepared: 'Подготовлено',
        fileNoProduct: 'Выбери товар, чтобы привязать файл к его кнопке download.',
        fileNone: 'Файл не выбран. Можно оставить ручную ссылку выше.',
        selectProduct: 'Выбери продукт слева, чтобы открыть его рабочую область редактирования.',
        searchEmpty: 'По вашему запросу ничего не найдено.',
        noTeamCards: 'Пока нет карточек команды. Нажми «+ Участник» и собери блок «Наша команда». ',
        noSupportMethods: 'Пока нет способов поддержки. Добавь хотя бы одну кнопку для donate-страницы.',
        noSupporters: 'Пока нет карточек поддержавших. Добавь записи, чтобы собрать публичный список и топ-3.',
        selectRouteProduct: 'Выбери продукт, чтобы редактировать route-модули.',
        noRouteModules: 'В этой категории пока нет функций.',
        newProduct: 'Новый продукт',
        statusLater: 'позже',
        newMember: 'Новый участник',
        roleDefault: 'Роль',
        newSupporter: 'Новый поддержавший',
        supportLabel: 'Поддержать',
        methodN: 'Способ {0}',
        newFunction: 'Новая функция',
        dashPreviewBehind: 'Preview отстаёт от формы',
        dashPreviewSynced: 'Preview синхронизирован с черновиком',
        dashLocalUnsaved: 'Есть локальные изменения, которые ещё не сохранены',
        dashLocalFixed: 'Локальное состояние уже зафиксировано',
        dashGithubPending: 'Публикация в GitHub ожидает запуска',
        dashGithubNotRequired: 'Публикация в GitHub сейчас не требуется',
        dashFilesQueued: 'Файлы в очереди на загрузку',
        toastProductAdded: 'Новый продукт добавлен.',
        toastProductRemoved: 'Товар удалён из редактора.',
        toastTeamAdded: 'Новый участник добавлен.',
        toastTeamRemoved: 'Участник удалён.',
        toastDraftApplied: 'Черновик применён к странице.',
        toastDraftDiscarded: 'Черновик отменён.',
        toastJsonImported: 'JSON импортирован в редактор.',
        toastJsonExported: 'JSON выгружен.',
        toastJsonImportFailed: 'Не удалось импортировать JSON.',
        toastFileTooLarge: 'GitHub Contents API не принимает файлы больше 100 MB.',
        toastFileQueued: 'Файл добавлен в очередь GitHub sync.',
        toastFileRemoved: 'Файл убран из очереди GitHub sync.',
        toastGithubSaved: 'Сохранено для всех. Данные и файлы отправлены в GitHub, сайт обновится после публикации GitHub Pages.',
        toastGithubFailed: 'Не удалось сохранить в GitHub.',
        githubTokenRequired: 'Для публикации нужен пароль.',
        githubTargetMissing: 'Не удалось определить GitHub-репозиторий для публикации.',
        toastSavedLocalWithFiles: 'Локально сохранено. Файлы не опубликованы и останутся в очереди только до перезагрузки страницы; для релиза в GitHub нажмите «Сохранить Глобально» в этой сессии.',
        toastSavedLocal: 'Локально сохранено. Изменения уже видны в этом браузере и в preview-вкладках с Главной.',
        toastSavedNoStorage: 'Изменения применены, но localStorage недоступен в этом браузере.',
        toastLocalCleared: 'Локальный черновик очищен. В этом браузере снова активна встроенная версия сайта.',
        toastLocalClearFailed: 'Не удалось очистить localStorage в этом браузере.',
        promptSelectFirst: 'Сначала выбери товар, потом прикрепляй файл.',
        confirmDeleteProduct: 'Удалить товар?',
        confirmDeleteTeamMember: 'Удалить участника команды?',
        confirmDiscard: 'Отменить все неприменённые изменения и вернуться к сохранённой версии?',
        confirmCloseUnsaved: 'Есть несохранённые изменения. Закрыть панель и потерять их?',
        confirmClearLocal: 'Очистить локальный черновик и вернуть этот браузер к встроенной версии сайта?',
        labelName: 'Имя',
        labelSortOrder: 'Порядок',
        ariaRemoveSupportMethod: 'Удалить способ поддержки',
        ariaRemoveSupporter: 'Удалить карточку поддержавшего',
        ariaRouteModuleName: 'Название функции: {0} #{1}',
        ariaRouteModuleEnabled: 'Состояние функции: {0} #{1}',
        ariaRemoveRouteModule: 'Удалить функцию: {0} #{1}',
    },
    en: {
        editing: 'Editing',
        editingMember: 'Editing member',
        noDescription: 'No description',
        draft: 'Draft',
        showcase: 'Showcase',
        enabled: 'Enabled',
        draftClean: 'No changes',
        draftDirty: 'Apply required',
        draftReadyPublish: 'Ready to publish',
        draftReadySave: 'Ready to save',
        filesCount: '{0} files',
        prepared: 'Prepared',
        fileNoProduct: 'Select a product to attach a file to its download button.',
        fileNone: 'No file selected. You can keep a manual link above.',
        selectProduct: 'Select a product on the left to open its editing workspace.',
        searchEmpty: 'Nothing matches your search.',
        noTeamCards: 'No team cards yet. Add a member to build the team section.',
        noSupportMethods: 'No support methods yet. Add at least one button for the donate route.',
        noSupporters: 'No supporters yet. Add cards to build the public list and top-3 block.',
        selectRouteProduct: 'Select a product to edit route modules.',
        noRouteModules: 'No functions in this category yet.',
        newProduct: 'New product',
        statusLater: 'later',
        newMember: 'New member',
        roleDefault: 'Role',
        newSupporter: 'New supporter',
        supportLabel: 'Support',
        methodN: 'Method {0}',
        newFunction: 'New function',
        dashPreviewBehind: 'Preview is behind the form state',
        dashPreviewSynced: 'Preview is synced with the draft',
        dashLocalUnsaved: 'There are local changes not saved yet',
        dashLocalFixed: 'Local state is already fixed',
        dashGithubPending: 'GitHub publication is pending',
        dashGithubNotRequired: 'GitHub publication is not required right now',
        dashFilesQueued: 'Files queued for upload',
        toastProductAdded: 'Product added.',
        toastProductRemoved: 'Product removed.',
        toastTeamAdded: 'Team member added.',
        toastTeamRemoved: 'Team member removed.',
        toastDraftApplied: 'Draft applied to the page.',
        toastDraftDiscarded: 'Draft discarded.',
        toastJsonImported: 'JSON imported into the editor.',
        toastJsonExported: 'JSON exported.',
        toastJsonImportFailed: 'Could not import JSON.',
        toastFileTooLarge: 'GitHub Contents API does not accept files larger than 100 MB.',
        toastFileQueued: 'File added to GitHub upload queue.',
        toastFileRemoved: 'File removed from the GitHub queue.',
        toastGithubSaved: 'Saved for everyone. Content and files were pushed to GitHub.',
        toastGithubFailed: 'Could not save to GitHub.',
        githubTokenRequired: 'A password is required to publish.',
        githubTargetMissing: 'Could not determine the GitHub repository for publishing.',
        toastSavedLocalWithFiles: 'Saved locally. Files were not published and stay queued only until this page is reloaded; use Save Global in this session to publish them to GitHub.',
        toastSavedLocal: 'Saved locally. Changes are now visible in this browser and in preview tabs opened from Home.',
        toastSavedNoStorage: 'Changes were applied but localStorage is unavailable in this browser.',
        toastLocalCleared: 'Local draft cleared. The embedded site version is active again in this browser.',
        toastLocalClearFailed: 'Could not clear localStorage in this browser.',
        promptSelectFirst: 'Select a product first, then attach a file.',
        confirmDeleteProduct: 'Delete this product?',
        confirmDeleteTeamMember: 'Delete this team member?',
        confirmDiscard: 'Discard all unsaved changes and return to the saved version?',
        confirmCloseUnsaved: 'There are unsaved changes. Close the panel and lose them?',
        confirmClearLocal: 'Clear the local draft and return this browser to the embedded site version?',
        labelName: 'Name',
        labelSortOrder: 'Sort order',
        ariaRemoveSupportMethod: 'Remove support method',
        ariaRemoveSupporter: 'Remove supporter card',
        ariaRouteModuleName: 'Function name: {0} #{1}',
        ariaRouteModuleEnabled: 'Function state: {0} #{1}',
        ariaRemoveRouteModule: 'Remove function: {0} #{1}',
    },
    ua: {
        editing: 'Редагування',
        editingMember: 'Редагування учасника',
        noDescription: 'Немає опису',
        draft: 'Чернетка',
        showcase: 'Вітрина',
        enabled: 'Увімкнено',
        draftClean: 'Без змін',
        draftDirty: 'Потрібно застосувати',
        draftReadyPublish: 'Готово до публікації',
        draftReadySave: 'Готово до збереження',
        filesCount: '{0} файлів',
        prepared: 'Підготовлено',
        fileNoProduct: 'Вибери продукт, щоб прив\u2019язати файл до його кнопки download.',
        fileNone: 'Файл не вибрано. Можна залишити ручне посилання вище.',
        selectProduct: 'Вибери продукт ліворуч, щоб відкрити його робочу область редагування.',
        searchEmpty: 'За запитом нічого не знайдено.',
        noTeamCards: 'Поки немає карток команди. Додай учасника, щоб зібрати блок команди.',
        noSupportMethods: 'Поки немає способів підтримки. Додай хоча б одну кнопку для donate-сторінки.',
        noSupporters: 'Поки немає карток підтримувачів. Додай записи, щоб зібрати публічний список і топ-3.',
        selectRouteProduct: 'Оберіть продукт, щоб редагувати route-модулі.',
        noRouteModules: 'У цій категорії ще немає функцій.',
        newProduct: 'Новий продукт',
        statusLater: 'пізніше',
        newMember: 'Новий учасник',
        roleDefault: 'Роль',
        newSupporter: 'Новий підтримувач',
        supportLabel: 'Підтримати',
        methodN: 'Спосіб {0}',
        newFunction: 'Нова функція',
        dashPreviewBehind: 'Preview відстає від форми',
        dashPreviewSynced: 'Preview синхронізований із чернеткою',
        dashLocalUnsaved: 'Є локальні зміни, які ще не збережені',
        dashLocalFixed: 'Локальний стан уже зафіксований',
        dashGithubPending: 'Публікація в GitHub очікує запуску',
        dashGithubNotRequired: 'Публікація в GitHub зараз не потрібна',
        dashFilesQueued: 'Файли в черзі на завантаження',
        toastProductAdded: 'Продукт додано.',
        toastProductRemoved: 'Продукт видалено.',
        toastTeamAdded: 'Учасника додано.',
        toastTeamRemoved: 'Учасника видалено.',
        toastDraftApplied: 'Чернетку застосовано до сторінки.',
        toastDraftDiscarded: 'Чернетку скасовано.',
        toastJsonImported: 'JSON імпортовано в редактор.',
        toastJsonExported: 'JSON експортовано.',
        toastJsonImportFailed: 'Не вдалося імпортувати JSON.',
        toastFileTooLarge: 'GitHub Contents API не приймає файли більше 100 MB.',
        toastFileQueued: 'Файл додано до черги GitHub sync.',
        toastFileRemoved: 'Файл прибрано з черги GitHub sync.',
        toastGithubSaved: 'Збережено для всіх. Дані та файли відправлено в GitHub.',
        toastGithubFailed: 'Не вдалося зберегти в GitHub.',
        githubTokenRequired: 'Для публікації потрібен пароль.',
        githubTargetMissing: 'Не вдалося визначити GitHub-репозиторій для публікації.',
        toastSavedLocalWithFiles: 'Збережено локально. Файли не опубліковані й залишаться в черзі лише до перезавантаження сторінки; для релізу в GitHub натисніть «Зберегти Глобально» в цій сесії.',
        toastSavedLocal: 'Збережено локально. Зміни вже видно в цьому браузері та у preview-вкладках з Головної.',
        toastSavedNoStorage: 'Зміни застосовані, але localStorage недоступний у цьому браузері.',
        toastLocalCleared: 'Локальну чернетку очищено. У цьому браузері знову активна вбудована версія сайту.',
        toastLocalClearFailed: 'Не вдалося очистити localStorage у цьому браузері.',
        promptSelectFirst: 'Спочатку вибери продукт, а потім прикріплюй файл.',
        confirmDeleteProduct: 'Видалити цей продукт?',
        confirmDeleteTeamMember: 'Видалити цього учасника команди?',
        confirmDiscard: 'Скасувати всі незбережені зміни й повернутися до збереженої версії?',
        confirmCloseUnsaved: 'Є незбережені зміни. Закрити панель і втратити їх?',
        confirmClearLocal: 'Очистити локальну чернетку та повернути цей браузер до вбудованої версії сайту?',
        labelName: 'Ім\'я',
        labelSortOrder: 'Порядок',
        ariaRemoveSupportMethod: 'Видалити спосіб підтримки',
        ariaRemoveSupporter: 'Видалити картку підтримувача',
        ariaRouteModuleName: 'Назва функції: {0} #{1}',
        ariaRouteModuleEnabled: 'Стан функції: {0} #{1}',
        ariaRemoveRouteModule: 'Видалити функцію: {0} #{1}',
    },
});

/** Look up an admin UI message by key, with optional `{0}`, `{1}` placeholders. */
function getMsg(locale, key, ...args) {
    const text = (ADMIN_MESSAGES[locale] || ADMIN_MESSAGES.ru)[key] || ADMIN_MESSAGES.ru[key] || key;
    return args.length ? text.replace(/\{(\d+)}/g, (_, i) => args[+i] ?? '') : text;
}

function storageGet(key) {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function storageSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch {
        return false;
    }
}

function storageRemove(key) {
    try {
        window.localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

function serializeData(value) {
    return JSON.stringify(normalizeData(value));
}

let _editorIdSeq = 0;

function sanitizeFileSegment(value, fallback = 'file') {
    const safe = String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    return safe || fallback;
}

function buildProductUploadRelativePath(product, fileName) {
    const safeId = sanitizeFileSegment(product.id || product.title, 'product');
    const safeVersion = sanitizeFileSegment(product.version, '');
    const safeFileName = sanitizeFileSegment(fileName, 'download.bin');
    const extIndex = safeFileName.lastIndexOf('.');
    const baseName = extIndex > 0 ? safeFileName.slice(0, extIndex) : safeFileName;
    const extension = extIndex > 0 ? safeFileName.slice(extIndex) : '';
    const versionPart = safeVersion ? `-${safeVersion}` : '';
    return `assets/files/${safeId}${versionPart}-${baseName}${extension}`.replace(/--+/g, '-');
}

function isValidListIndex(list, index) {
    return Array.isArray(list) && Number.isInteger(index) && index >= 0 && index < list.length;
}

function removeIndexedItem(list, index) {
    if (!isValidListIndex(list, index)) return false;
    list.splice(index, 1);
    return true;
}

function clampDiscordPreviewImageSize(urlText) {
    return optimizeDiscordAvatarUrl(urlText, PREVIEW_DISCORD_IMAGE_SIZE);
}

function resolvePreviewImageUrl(value) {
    const text = String(value || '').trim();
    if (!text) return '';

    const externalUrl = cleanUrl(text);
    if (externalUrl) {
        return clampDiscordPreviewImageSize(externalUrl);
    }

    if (text.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(text)) {
        return '';
    }

    const siteBaseUrl = new URL('../', window.location.href);
    const normalizedPath = text.replace(/^\.\//, '');

    try {
        return clampDiscordPreviewImageSize(new URL(normalizedPath, siteBaseUrl).toString());
    } catch {
        return '';
    }
}

function normalizeSocials(raw, fallback = DEFAULT_SITE_DATA.socials) {
    return {
        youtube: cleanUrl(raw?.youtube || fallback?.youtube || ''),
        discord: cleanUrl(raw?.discord || fallback?.discord || ''),
        telegram: cleanUrl(raw?.telegram || fallback?.telegram || ''),
    };
}

function getTeamInitials(name) {
    return String(name || '')
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'TM';
}

function renderTeamAvatar(member, className) {
    const avatarSrc = resolvePreviewImageUrl(member.avatarUrl);
    if (avatarSrc) {
        return `<div class="${className}" aria-hidden="true"><img src="${escapeHtml(avatarSrc)}" alt="" loading="lazy" decoding="async" width="44" height="44"></div>`;
    }
    return `<div class="${className}" aria-hidden="true">${escapeHtml(getTeamInitials(member.name))}</div>`;
}

function renderSocialIcon(kind) {
    return SOCIAL_ICON_SVG[kind] || SOCIAL_ICON_SVG.telegram;
}

function getAdminCopy(locale) {
    return ADMIN_VIEW_COPY[locale] || ADMIN_VIEW_COPY.ru;
}

export function createEditorController({ renderSite, showToast, locale = 'ru' }) {
    const copy = getAdminCopy(locale);
    const msg = (key, ...args) => getMsg(locale, key, ...args);
    const isStandaloneAdminPage = document.body.dataset.adminPage === 'true';
    const adminPageHref = new URL('../admin/', window.location.href).toString();
    const adminHomeHref = `../${locale}/`;

    const editorOverlayEl = document.getElementById('editorOverlay');
    const editorAccessTriggerEl = document.getElementById('editorAccessTrigger') || document.getElementById('logoLink');
    const editorAdminTitleEl = document.getElementById('editorAdminTitle');
    const editorAdminSubtitleEl = document.getElementById('editorAdminSubtitle');
    const homeViewEl = document.getElementById('homeView');
    const productsViewEl = document.getElementById('productsView');
    const supportViewEl = document.getElementById('supportView');
    const miscViewEl = document.getElementById('miscView');
    const homeDraftSummaryEl = document.getElementById('homeDraftSummary');
    const homeProductsCountEl = document.getElementById('homeProductsCount');
    const homeFeaturedCountEl = document.getElementById('homeFeaturedCount');
    const homeTeamCountEl = document.getElementById('homeTeamCount');
    const homeSocialCountEl = document.getElementById('homeSocialCount');
    const homeUploadsCountEl = document.getElementById('homeUploadsCount');
    const editorProductGridEl = document.getElementById('editorProductGrid');
    const editorEmptyStateEl = document.getElementById('editorEmptyState');
    const editorPanelEl = document.getElementById('editor');
    const editorTitleEl = document.getElementById('editorTitle');
    const editorSearchEl = document.getElementById('editorSearchInput');
    const editorTotalCountEl = document.getElementById('editorTotalCount');
    const editorShowcaseCountEl = document.getElementById('editorShowcaseCount');
    const addProductBtnEl = document.getElementById('addProductBtn');
    const addTeamMemberBtnEl = document.getElementById('addTeamMemberBtn');
    const draftStateChipEl = document.getElementById('draftStateChip');
    const draftStateTextEl = document.getElementById('draftStateText');
    const applyDraftBtnEl = document.getElementById('applyDraftBtn');
    const discardDraftBtnEl = document.getElementById('discardDraftBtn');
    const homeApplyDraftBtnEl = document.getElementById('homeApplyDraftBtn');
    const homeDiscardDraftBtnEl = document.getElementById('homeDiscardDraftBtn');
    const closeProductEditorBtnEl = document.getElementById('closeProductEditorBtn');
    const deleteProductBtnEl = document.getElementById('deleteProductBtn');
    const editorFieldNameEl = document.getElementById('f-name');
    const editorFieldSlugEl = document.getElementById('f-slug');
    const editorFieldTagEl = document.getElementById('f-tag');
    const editorFieldVersionEl = document.getElementById('f-version');
    const editorFieldOrderEl = document.getElementById('f-order');
    const editorFieldStageEl = document.getElementById('f-stage');
    const editorFieldToneEl = document.getElementById('f-tone');
    const editorFieldStatusEl = document.getElementById('f-status');
    const editorFieldDescEl = document.getElementById('f-desc');
    const editorFieldInstructionsEl = document.getElementById('f-instructions');
    const editorFieldNoteEl = document.getElementById('f-note');
    const editorFieldShowcaseEl = document.getElementById('f-showcase');
    const editorFieldShowcaseOrderEl = document.getElementById('f-showcase-order');
    const editorFieldDownloadEl = document.getElementById('f-download');
    const editorFieldDownloadFileEl = document.getElementById('f-download-file');
    const editorFieldDownloadFileMetaEl = document.getElementById('f-download-file-meta');
    const clearDownloadFileBtnEl = document.getElementById('clearDownloadFileBtn');
    const editorFieldSourceEl = document.getElementById('f-source');
    const editorFieldAutoRouteRedirectEl = document.getElementById('f-auto-route-redirect');
    const routeModuleCategoryEl = document.getElementById('route-module-category');
    const routeModuleListEl = document.getElementById('routeModuleList');
    const addRouteModuleBtnEl = document.getElementById('addRouteModuleBtn');
    const supportMinAmountEl = document.getElementById('supportMinAmount');
    const supportRoleNameEl = document.getElementById('supportRoleName');
    const supportButtonsListEl = document.getElementById('supportButtonsList');
    const addSupportButtonBtnEl = document.getElementById('addSupportButtonBtn');
    const supportersAdminListEl = document.getElementById('supportersAdminList');
    const addSupporterBtnEl = document.getElementById('addSupporterBtn');
    const supportSummaryMinAmountEl = document.getElementById('supportSummaryMinAmount');
    const supportSummaryRoleNameEl = document.getElementById('supportSummaryRoleName');
    const supportButtonsCountEl = document.getElementById('supportButtonsCount');
    const supportSupportersCountEl = document.getElementById('supportSupportersCount');
    const socialYoutubeEl = document.getElementById('socialYoutube');
    const socialDiscordEl = document.getElementById('socialDiscord');
    const socialTelegramEl = document.getElementById('socialTelegram');
    const editorSocialPreviewEl = document.getElementById('editorSocialPreview');
    const teamMemberCountEl = document.getElementById('teamMemberCount');
    const teamGridEl = document.getElementById('teamGrid');
    const teamEditorEl = document.getElementById('teamEditor');
    const teamEditorEmptyEl = document.getElementById('teamEditorEmpty');
    const teamEditorTitleEl = document.getElementById('teamEditorTitle');
    const closeTeamEditorBtnEl = document.getElementById('closeTeamEditorBtn');
    const deleteTeamMemberBtnEl = document.getElementById('deleteTeamMemberBtn');
    const teamFieldNameEl = document.getElementById('team-name');
    const teamFieldRoleEl = document.getElementById('team-role');
    const teamFieldAvatarEl = document.getElementById('team-avatar');
    const teamFieldOrderEl = document.getElementById('team-order');
    const teamFieldBioEl = document.getElementById('team-bio');
    const exportJsonBtnEl = document.getElementById('exportJsonBtn');
    const importJsonBtnEl = document.getElementById('importJsonBtn');
    const importJsonInputEl = document.getElementById('importJsonInput');
    const clearLocalBtnEl = document.getElementById('clearLocalBtn');
    const saveLocalBtnEl = document.getElementById('saveLocalBtn');
    const saveGithubBtnEl = document.getElementById('saveGithubBtn');

    if (!editorOverlayEl || !editorAdminTitleEl || !editorAdminSubtitleEl || !editorProductGridEl || !editorPanelEl) {
        return {
            async initialize() {},
        };
    }

    let savedSiteData = deepClone(DEFAULT_SITE_DATA);
    let siteData = deepClone(DEFAULT_SITE_DATA);
    let editorData = deepClone(DEFAULT_SITE_DATA);
    let editorSelectedIndex = -1;
    let teamSelectedIndex = -1;
    let editorActiveTab = 'tab-main';
    let editorActiveView = 'home';
    let editorSearchQuery = '';
    let sequenceBuffer = [];
    let editorAccessArmed = false;
    let editorAccessTimer = null;
    const pendingProductUploads = new Map();
    const adminViewLinks = Array.from(document.querySelectorAll('[data-admin-view]'));
    let editorGridRenderFrame = 0;
    let teamGridRenderFrame = 0;

    if (editorEmptyStateEl) {
        editorEmptyStateEl.textContent = msg('selectProduct');
    }

    /* ── Apply locale to static admin HTML elements ────────── */
    (function applyAdminStaticCopy() {
        document.documentElement.lang = locale === 'ua' ? 'uk' : locale;

        /* Sidebar nav labels — reuse view titles from ADMIN_VIEW_COPY */
        adminViewLinks.forEach((link) => {
            const view = link.dataset.adminView;
            const label = link.querySelector('.dash-nav-label');
            if (label && copy[view]) label.textContent = copy[view].title;
        });

        /* Nav section heading & aria */
        const navSection = document.querySelector('.dash-nav-section');
        if (navSection) navSection.textContent = copy.nav.section;
        const navEl = document.querySelector('.dash-nav');
        if (navEl) navEl.setAttribute('aria-label', copy.nav.ariaLabel);

        /* Brand link locale */
        const brandLink = document.querySelector('.dash-brand');
        if (brandLink?.tagName === 'A') {
            brandLink.href = adminHomeHref;
            brandLink.setAttribute('aria-label', copy.nav.brandLabel);
        }

        /* Header action buttons */
        const btnTextMap = {
            exportJsonBtn:  copy.header.json,
            importJsonBtn:  copy.header.import,
            discardDraftBtn: copy.header.discard,
            applyDraftBtn:  copy.header.apply,
        };
        for (const [id, text] of Object.entries(btnTextMap)) {
            const btn = document.getElementById(id);
            if (!btn) continue;
            const textNode = [...btn.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).pop();
            if (textNode) textNode.textContent = ` ${text} `;
        }

        /* Close button aria */
        const closeBtn = document.querySelector('.dash-btn-icon[data-close-editor]');
        if (closeBtn) closeBtn.setAttribute('aria-label', copy.header.closeLabel);

        /* Theme toggle aria */
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) themeBtn.setAttribute('aria-label', copy.header.themeLabel);
    })();

    function emitToast(message, kind = 'info') {
        if (typeof showToast === 'function') showToast(message, kind);
    }

    function scheduleEditorGridRender() {
        if (editorGridRenderFrame) return;
        editorGridRenderFrame = window.requestAnimationFrame(() => {
            editorGridRenderFrame = 0;
            renderEditorGrid();
        });
    }

    function scheduleTeamGridRender() {
        if (teamGridRenderFrame) return;
        teamGridRenderFrame = window.requestAnimationFrame(() => {
            teamGridRenderFrame = 0;
            renderTeamGrid();
        });
    }

    function hasStagedUploads() {
        return pendingProductUploads.size > 0;
    }

    let _draftStateCache = null;
    let _draftStateCacheRaf = 0;
    let _syncDraftRaf = 0;

    function scheduleSyncDraftControls() {
        if (!_syncDraftRaf) {
            _syncDraftRaf = requestAnimationFrame(() => {
                _syncDraftRaf = 0;
                syncDraftControls();
            });
        }
    }

    function invalidateDraftState() {
        _draftStateCache = null;
        if (_draftStateCacheRaf) {
            cancelAnimationFrame(_draftStateCacheRaf);
            _draftStateCacheRaf = 0;
        }
    }

    function computeDraftState() {
        if (_draftStateCache) return _draftStateCache;
        const editorSerialized = serializeData(editorData);
        const siteSerialized = serializeData(siteData);
        const savedSerialized = serializeData(savedSiteData);
        _draftStateCache = {
            hasPreviewDiff: editorSerialized !== siteSerialized,
            hasSavedDiff: hasStagedUploads()
                || editorSerialized !== savedSerialized
                || siteSerialized !== savedSerialized,
        };
        if (!_draftStateCacheRaf) {
            _draftStateCacheRaf = requestAnimationFrame(() => {
                _draftStateCache = null;
                _draftStateCacheRaf = 0;
            });
        }
        return _draftStateCache;
    }

    function hasUnappliedDraftChanges() {
        return computeDraftState().hasPreviewDiff;
    }

    function hasUnsavedDraftChanges() {
        return computeDraftState().hasSavedDiff;
    }

    function countEnabledSocials() {
        return Object.values(editorData.socials || {}).filter(Boolean).length;
    }

    function renderHomeDashboard(draftState) {
        if (homeProductsCountEl) homeProductsCountEl.textContent = String(editorData.products.length);
        if (homeFeaturedCountEl) homeFeaturedCountEl.textContent = String(editorData.products.filter((item) => item.featured).length);
        if (homeTeamCountEl) homeTeamCountEl.textContent = String(editorData.team.length);
        if (homeSocialCountEl) homeSocialCountEl.textContent = String(countEnabledSocials());
        if (homeUploadsCountEl) homeUploadsCountEl.textContent = String(pendingProductUploads.size);
        if (!homeDraftSummaryEl) return;

        const { hasPreviewDiff, hasSavedDiff } = draftState || computeDraftState();
        const uploadCount = pendingProductUploads.size;

        const rows = [
            {
                dotClass: hasPreviewDiff ? 'is-warn' : 'is-ok',
                label: hasPreviewDiff ? msg('dashPreviewBehind') : msg('dashPreviewSynced'),
                tagClass: hasPreviewDiff ? 'is-warn' : 'is-success',
                tag: hasPreviewDiff ? 'APPLY' : 'OK',
            },
            {
                dotClass: hasSavedDiff ? 'is-warn' : 'is-ok',
                label: hasSavedDiff ? msg('dashLocalUnsaved') : msg('dashLocalFixed'),
                tagClass: hasSavedDiff ? 'is-warn' : 'is-success',
                tag: hasSavedDiff ? 'SAVE' : 'SYNC',
            },
            {
                dotClass: hasSavedDiff || uploadCount ? 'is-warn' : 'is-ok',
                label: (hasSavedDiff || uploadCount) ? msg('dashGithubPending') : msg('dashGithubNotRequired'),
                tagClass: hasSavedDiff || uploadCount ? 'is-warn' : 'is-muted',
                tag: hasSavedDiff || uploadCount ? 'PUSH' : 'IDLE',
            },
            {
                dotClass: uploadCount ? 'is-warn' : 'is-ok',
                label: msg('dashFilesQueued'),
                tagClass: uploadCount ? 'is-warn' : 'is-muted',
                tag: uploadCount ? msg('filesCount', uploadCount) : '0',
            },
        ];

        homeDraftSummaryEl.innerHTML = rows.map((row) => `
            <div class="dash-status-row">
                <span class="dash-status-dot ${row.dotClass}"></span>
                <span class="dash-status-label">${escapeHtml(row.label)}</span>
                <span class="dash-status-tag ${row.tagClass}">${escapeHtml(row.tag)}</span>
            </div>
        `).join('');
    }

    function syncDraftControls() {
        invalidateDraftState();
        const draftState = computeDraftState();
        const { hasPreviewDiff, hasSavedDiff } = draftState;
        const hasUploads = hasStagedUploads();

        if (draftStateChipEl) {
            let stateClass = 'is-clean';
            let stateLabel = msg('draftClean');

            if (hasPreviewDiff) {
                stateClass = 'is-dirty';
                stateLabel = msg('draftDirty');
            } else if (hasSavedDiff || hasUploads) {
                stateClass = 'is-ready';
                stateLabel = hasUploads ? msg('draftReadyPublish') : msg('draftReadySave');
            }

            draftStateChipEl.className = `dash-draft-chip ${stateClass}`;
            if (draftStateTextEl) {
                draftStateTextEl.textContent = stateLabel;
            } else {
                draftStateChipEl.textContent = stateLabel;
            }
        }

        if (applyDraftBtnEl) applyDraftBtnEl.disabled = !hasPreviewDiff;
        if (discardDraftBtnEl) discardDraftBtnEl.disabled = !hasSavedDiff;
        if (homeApplyDraftBtnEl) homeApplyDraftBtnEl.disabled = !hasPreviewDiff;
        if (homeDiscardDraftBtnEl) homeDiscardDraftBtnEl.disabled = !hasSavedDiff;
        renderHomeDashboard(draftState);
    }

    function loadLocalData() {
        try {
            const raw = storageGet(LOCAL_DATA_KEY);
            if (!raw) return null;
            return normalizeData(JSON.parse(raw));
        } catch {
            return null;
        }
    }

    async function initializeData() {
        const localData = loadLocalData();
        savedSiteData = localData || normalizeData(DEFAULT_SITE_DATA);
        siteData = deepClone(savedSiteData);
        editorData = deepClone(savedSiteData);
        renderSite(siteData);
        syncDraftControls();
    }

    function applyEditorDataToPreview() {
        const normalized = normalizeData(editorData);
        siteData = deepClone(normalized);
        renderSite(siteData);
        syncDraftControls();
        return normalized;
    }

    function persistEditorData(normalizedData) {
        const normalized = normalizeData(normalizedData);
        savedSiteData = deepClone(normalized);
        siteData = deepClone(normalized);
        editorData = deepClone(normalized);
        const stored = storageSet(LOCAL_DATA_KEY, JSON.stringify(normalized));
        renderSite(siteData);
        syncDraftControls();
        return stored;
    }

    function getPendingProductUpload(productId) {
        return pendingProductUploads.get(String(productId || '')) || null;
    }

    function getPendingUploadHref(upload) {
        return upload ? `./${upload.relativePath}` : '';
    }

    function isProductUsingPendingUpload(product, upload) {
        return Boolean(upload && String(product?.downloadUrl || '').trim() === getPendingUploadHref(upload));
    }

    function stripPendingUploadLinks(data) {
        const normalized = normalizeData(data);
        normalized.products = normalized.products.map((product) => {
            const upload = getPendingProductUpload(product.id);
            if (!isProductUsingPendingUpload(product, upload)) return product;
            return {
                ...product,
                downloadUrl: upload.previousDownloadUrl || '',
            };
        });
        return normalized;
    }

    function renderProductUploadMeta() {
        if (!editorFieldDownloadFileMetaEl) return;

        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) {
            editorFieldDownloadFileMetaEl.textContent = msg('fileNoProduct');
            if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = true;
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        const product = editorData.products[editorSelectedIndex];
        const upload = getPendingProductUpload(product.id);
        if (!upload) {
            editorFieldDownloadFileMetaEl.textContent = msg('fileNone');
            if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = true;
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        editorFieldDownloadFileMetaEl.textContent = `${msg('prepared')}: ${upload.originalName} (${formatBytes(upload.file.size)}) -> ./${upload.relativePath}`;
        if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = false;
    }

    function syncPendingUploadForProduct(previousProduct, nextProduct, currentDownloadValue) {
        const upload = getPendingProductUpload(previousProduct.id);
        if (!upload) return nextProduct;

        if (upload.isManualPath) {
            pendingProductUploads.delete(previousProduct.id);
            pendingProductUploads.set(nextProduct.id, { ...upload });
            return nextProduct;
        }

        const nextRelativePath = buildProductUploadRelativePath(nextProduct, upload.originalName);
        const previousAutoUrl = getPendingUploadHref(upload);
        const shouldRewriteDownload = currentDownloadValue === previousAutoUrl || previousProduct.downloadUrl === previousAutoUrl;
        const nextUpload = { ...upload, relativePath: nextRelativePath };

        pendingProductUploads.delete(previousProduct.id);
        pendingProductUploads.set(nextProduct.id, nextUpload);

        if (shouldRewriteDownload && editorFieldDownloadEl) {
            nextProduct.downloadUrl = getPendingUploadHref(nextUpload);
            editorFieldDownloadEl.value = nextProduct.downloadUrl;
        }

        return nextProduct;
    }

    function clearStagedProductDownloadFile({ preserveUrl = false } = {}) {
        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) {
            renderProductUploadMeta();
            return;
        }

        const product = editorData.products[editorSelectedIndex];
        const upload = getPendingProductUpload(product.id);
        if (!upload) {
            renderProductUploadMeta();
            syncDraftControls();
            return;
        }

        pendingProductUploads.delete(product.id);
        if (!preserveUrl) {
            const expectedUrl = getPendingUploadHref(upload);
            if (editorFieldDownloadEl && editorFieldDownloadEl.value.trim() === expectedUrl) {
                editorFieldDownloadEl.value = upload.previousDownloadUrl || '';
            }
            syncSelectedProductFromForm();
        } else if (editorFieldDownloadFileEl) {
            editorFieldDownloadFileEl.value = '';
        }

        renderProductUploadMeta();
        renderEditorGrid();
        syncDraftControls();
    }

    function stageProductDownloadFile(file) {
        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) {
            emitToast(msg('promptSelectFirst'), 'error');
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        if (!file) {
            clearStagedProductDownloadFile();
            return;
        }

        if (file.size > GITHUB_CONTENTS_MAX_FILE_BYTES) {
            emitToast(msg('toastFileTooLarge'), 'error');
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        syncSelectedProductFromForm();
        const product = editorData.products[editorSelectedIndex];
        const currentDownloadUrl = String(product.downloadUrl || '').trim();
        const isLocalPath = currentDownloadUrl.startsWith('./') &&
            !currentDownloadUrl.includes('://') &&
            !currentDownloadUrl.includes('/../') &&
            !currentDownloadUrl.startsWith('./..');
        const isManualPath = isLocalPath;
        const relativePath = isManualPath
            ? currentDownloadUrl.slice(2)
            : buildProductUploadRelativePath(product, file.name);
        const existingUpload = getPendingProductUpload(product.id);
        const previousDownloadUrl = existingUpload?.previousDownloadUrl ?? String(product.downloadUrl || '').trim();
        pendingProductUploads.set(product.id, { file, originalName: file.name, relativePath, isManualPath, previousDownloadUrl });
        if (editorFieldDownloadEl) editorFieldDownloadEl.value = `./${relativePath}`;
        syncSelectedProductFromForm();
        renderProductUploadMeta();
        renderEditorGrid();
        syncDraftControls();
        emitToast(msg('toastFileQueued'), 'success');
    }

    function getProductInitials(name) {
        return String(name || '')
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'PR';
    }

    function getEditorCardSummary(product) {
        const source = String(product.summary || product.note || '').replace(/\s+/g, ' ').trim();
        if (!source) return msg('noDescription');
        return source.length > 120 ? `${source.slice(0, 117).trimEnd()}...` : source;
    }

    function getEditorEntries(query = editorSearchQuery) {
        const normalizedQuery = String(query || '').trim().toLowerCase();
        return editorData.products
            .map((product, index) => ({ product, index }))
            .sort((a, b) => {
                const bySort = toNumber(a.product.sortOrder, a.index + 1) - toNumber(b.product.sortOrder, b.index + 1);
                if (bySort !== 0) return bySort;
                return a.product.title.localeCompare(b.product.title, locale === 'ua' ? 'uk' : locale);
            })
            .filter(({ product }) => {
                if (!normalizedQuery) return true;
                return [product.title, product.id, product.tag, product.status, product.summary, product.note]
                    .some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
            });
    }

    function renderEditorStageBadge(flag) {
        const meta = getFlagMeta(flag);
        if (!meta) return `<span class="dash-badge">${msg('draft')}</span>`;
        return `<span class="dash-badge ${flag}">${meta.label}</span>`;
    }

    function clearEditorForm() {
        if (editorFieldNameEl) editorFieldNameEl.value = '';
        if (editorFieldSlugEl) editorFieldSlugEl.value = '';
        if (editorFieldTagEl) editorFieldTagEl.value = '';
        if (editorFieldVersionEl) editorFieldVersionEl.value = '';
        if (editorFieldOrderEl) editorFieldOrderEl.value = '';
        if (editorFieldStageEl) editorFieldStageEl.value = '';
        if (editorFieldToneEl) editorFieldToneEl.value = 'red';
        if (editorFieldStatusEl) editorFieldStatusEl.value = '';
        if (editorFieldDescEl) editorFieldDescEl.value = '';
        if (editorFieldInstructionsEl) editorFieldInstructionsEl.value = '';
        if (editorFieldNoteEl) editorFieldNoteEl.value = '';
        if (editorFieldShowcaseEl) editorFieldShowcaseEl.checked = false;
        if (editorFieldShowcaseOrderEl) editorFieldShowcaseOrderEl.value = '';
        if (editorFieldDownloadEl) editorFieldDownloadEl.value = '';
        if (editorFieldSourceEl) editorFieldSourceEl.value = '';
        if (editorFieldAutoRouteRedirectEl) editorFieldAutoRouteRedirectEl.checked = false;
        if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
        if (routeModuleCategoryEl) routeModuleCategoryEl.value = 'player';
        renderRouteModuleEditor();
        renderProductUploadMeta();
    }

    function syncProductEditorState() {
        const hasSelectedProduct = editorSelectedIndex >= 0 && Boolean(editorData.products[editorSelectedIndex]);
        if (editorPanelEl) editorPanelEl.classList.toggle('open', hasSelectedProduct);
        if (editorPanelEl) editorPanelEl.setAttribute('aria-hidden', hasSelectedProduct ? 'false' : 'true');
        if (editorEmptyStateEl) {
            editorEmptyStateEl.hidden = hasSelectedProduct;
            editorEmptyStateEl.setAttribute('aria-hidden', hasSelectedProduct ? 'true' : 'false');
        }
    }

    function getRouteModuleLabel(key) {
        const labels = ROUTE_MODULE_LABELS[locale] || ROUTE_MODULE_LABELS.ru;
        return labels[key] || key;
    }

    function getSelectedRouteModuleKey() {
        const raw = String(routeModuleCategoryEl?.value || 'player');
        return ROUTE_MODULE_KEYS.includes(/** @type {any} */ (raw)) ? raw : 'player';
    }

    function ensureSelectedProductRouteModules() {
        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) return null;
        const product = editorData.products[editorSelectedIndex];
        product.routeModules = normalizeRouteModules(product.routeModules);
        return product.routeModules;
    }

    function renderRouteModuleEditor() {
        if (!routeModuleListEl) return;

        const routeModules = ensureSelectedProductRouteModules();
        if (!routeModules) {
            routeModuleListEl.innerHTML = `<div class="dash-route-empty">${escapeHtml(msg('selectRouteProduct'))}</div>`;
            return;
        }

        const activeKey = getSelectedRouteModuleKey();
        const items = routeModules[activeKey] || [];
        if (!items.length) {
            routeModuleListEl.innerHTML = `<div class="dash-route-empty">${escapeHtml(msg('noRouteModules'))}</div>`;
            return;
        }

        routeModuleListEl.innerHTML = items.map((item, index) => `
            <div class="dash-route-row" data-route-module-row="${index}">
                <input type="text" value="${escapeHtml(item.name)}" data-route-module-name="${index}" aria-label="${escapeHtml(msg('ariaRouteModuleName', getRouteModuleLabel(activeKey), index + 1))}">
                <label class="dash-route-toggle">
                    <input type="checkbox" data-route-module-enabled="${index}" aria-label="${escapeHtml(msg('ariaRouteModuleEnabled', getRouteModuleLabel(activeKey), index + 1))}" ${item.enabled ? 'checked' : ''}>
                    <span>${escapeHtml(msg('enabled'))}</span>
                </label>
                <button type="button" class="dash-btn dash-sm dash-route-remove" data-route-module-remove="${index}" aria-label="${escapeHtml(msg('ariaRemoveRouteModule', getRouteModuleLabel(activeKey), index + 1))}">✕</button>
            </div>
        `).join('');
    }

    function fillSocialInputs() {
        const socials = editorData.socials || normalizeSocials({});
        if (socialYoutubeEl) socialYoutubeEl.value = socials.youtube || '';
        if (socialDiscordEl) socialDiscordEl.value = socials.discord || '';
        if (socialTelegramEl) socialTelegramEl.value = socials.telegram || '';
        renderEditorSocialPreview();
    }

    function syncSocialsFromInputs() {
        editorData.socials = normalizeSocials({
            youtube: socialYoutubeEl?.value,
            discord: socialDiscordEl?.value,
            telegram: socialTelegramEl?.value,
        }, DEFAULT_SITE_DATA.socials);
        return editorData.socials;
    }

    function renderEditorSocialPreview() {
        if (!editorSocialPreviewEl) return;
        const socials = syncSocialsFromInputs();
        editorSocialPreviewEl.innerHTML = SOCIAL_PLATFORMS.map(({ key, label }) => {
            const href = socials[key] || '';
            const disabled = !href;
            const attrs = disabled
                ? 'aria-disabled="true" tabindex="-1"'
                : `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
            return `<a class="social-link ${disabled ? 'is-disabled' : ''}" ${attrs} aria-label="${escapeHtml(label)}">${renderSocialIcon(key)}</a>`;
        }).join('');
        renderHomeDashboard();
    }

    function ensureSupportDraft() {
        if (!editorData.supportPage || typeof editorData.supportPage !== 'object') {
            editorData.supportPage = { minimumAmountUsd: 2, roleName: '@Premium', buttons: [], supporters: [] };
        }

        if (!Array.isArray(editorData.supportPage.buttons)) editorData.supportPage.buttons = [];
        if (!Array.isArray(editorData.supportPage.supporters)) editorData.supportPage.supporters = [];
        if (!editorData.supportPage.roleName) editorData.supportPage.roleName = '@Premium';
        if (!Number.isFinite(Number(editorData.supportPage.minimumAmountUsd))) editorData.supportPage.minimumAmountUsd = 2;

        return editorData.supportPage;
    }

    function formatSupportUsd(value) {
        const amount = Number(value) || 0;
        if (Number.isInteger(amount)) return `$${amount}`;
        return `$${amount.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}`;
    }

    function renderSupportSummary() {
        const supportPage = ensureSupportDraft();
        if (supportSummaryMinAmountEl) supportSummaryMinAmountEl.textContent = formatSupportUsd(supportPage.minimumAmountUsd ?? 0);
        if (supportSummaryRoleNameEl) supportSummaryRoleNameEl.textContent = supportPage.roleName || '@Premium';
        if (supportButtonsCountEl) supportButtonsCountEl.textContent = String(supportPage.buttons.length);
        if (supportSupportersCountEl) supportSupportersCountEl.textContent = String(supportPage.supporters.length);
    }

    function createEmptySupportButton() {
        const supportPage = ensureSupportDraft();
        const index = supportPage.buttons.length;
        return normalizeSupportButton({
            id: `support-${Date.now()}-${++_editorIdSeq}`,
            label: msg('supportLabel'),
            title: msg('methodN', index + 1),
            note: '',
            url: '',
            sortOrder: index + 1,
        }, index);
    }

    function createEmptySupporter() {
        const supportPage = ensureSupportDraft();
        const index = supportPage.supporters.length;
        return normalizeSupporter({
            id: `supporter-${Date.now()}-${++_editorIdSeq}`,
            name: msg('newSupporter'),
            avatarUrl: '',
            amountUsd: 0,
            sortOrder: index + 1,
        }, index);
    }

    function renderSupporterAvatar(supporter) {
        const initials = escapeHtml(getTeamInitials(supporter.name));
        const avatarSrc = resolvePreviewImageUrl(supporter.avatarUrl);
        if (avatarSrc) {
            return `<div class="dash-supporter-avatar" aria-hidden="true"><img src="${escapeHtml(avatarSrc)}" alt="" loading="lazy" decoding="async" width="28" height="28"></div>`;
        }
        return `<div class="dash-supporter-avatar" aria-hidden="true">${initials}</div>`;
    }

    function renderSupportButtonsEditor() {
        if (!supportButtonsListEl) return;
        const supportPage = ensureSupportDraft();
        renderSupportSummary();

        if (!supportPage.buttons.length) {
            supportButtonsListEl.innerHTML = `<div class="dash-support-empty">${msg('noSupportMethods')}</div>`;
            return;
        }

        supportButtonsListEl.innerHTML = supportPage.buttons.map((button, index) => `
            <article class="dash-inline-form" data-support-button-row="${index}">
                <div class="dash-inline-form-head">
                    <span class="dash-inline-pill">${escapeHtml(button.id)}</span>
                    <span class="dash-inline-form-title">${escapeHtml(button.label || button.title || msg('methodN', index + 1))}</span>
                    <button type="button" class="dash-btn-icon dash-support-remove" data-remove-support-button="${index}" aria-label="${msg('ariaRemoveSupportMethod')}">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
                <div class="dash-inline-form-grid">
                    <div class="dash-field"><label>ID</label><input type="text" value="${escapeHtml(button.id)}" data-support-button-field="id" data-index="${index}"></div>
                    <div class="dash-field"><label>Label</label><input type="text" value="${escapeHtml(button.label)}" data-support-button-field="label" data-index="${index}"></div>
                    <div class="dash-field"><label>Title</label><input type="text" value="${escapeHtml(button.title)}" data-support-button-field="title" data-index="${index}"></div>
                    <div class="dash-field"><label>Note</label><input type="text" value="${escapeHtml(button.note)}" data-support-button-field="note" data-index="${index}"></div>
                    <div class="dash-field"><label>URL</label><input type="url" value="${escapeHtml(button.url)}" data-support-button-field="url" data-index="${index}" placeholder="https://..."></div>
                    <div class="dash-field"><label>${msg('labelSortOrder')}</label><input type="number" value="${escapeHtml(String(button.sortOrder))}" data-support-button-field="sortOrder" data-index="${index}"></div>
                </div>
            </article>
        `).join('');
    }

    function renderSupportersEditor() {
        if (!supportersAdminListEl) return;
        const supportPage = ensureSupportDraft();
        renderSupportSummary();

        if (!supportPage.supporters.length) {
            supportersAdminListEl.innerHTML = `<div class="dash-support-empty">${msg('noSupporters')}</div>`;
            return;
        }

        supportersAdminListEl.innerHTML = supportPage.supporters.map((supporter, index) => `
            <article class="dash-inline-form" data-supporter-row="${index}">
                <div class="dash-inline-form-head">
                    <div class="dash-supporter-preview">
                        ${renderSupporterAvatar(supporter)}
                        <span class="dash-supporter-name">${escapeHtml(supporter.name || msg('newSupporter'))}</span>
                        <span class="dash-supporter-amount">${escapeHtml(formatSupportUsd(supporter.amountUsd))}</span>
                    </div>
                    <button type="button" class="dash-btn-icon dash-support-remove" data-remove-supporter="${index}" aria-label="${msg('ariaRemoveSupporter')}">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
                <div class="dash-inline-form-grid">
                    <div class="dash-field"><label>ID</label><input type="text" value="${escapeHtml(supporter.id)}" data-supporter-field="id" data-index="${index}"></div>
                    <div class="dash-field"><label>${msg('labelName')}</label><input type="text" value="${escapeHtml(supporter.name)}" data-supporter-field="name" data-index="${index}"></div>
                    <div class="dash-field"><label>Avatar URL</label><input type="url" value="${escapeHtml(supporter.avatarUrl)}" data-supporter-field="avatarUrl" data-index="${index}" placeholder="https://..."></div>
                    <div class="dash-field"><label>USD</label><input type="number" min="0" step="0.01" value="${escapeHtml(String(supporter.amountUsd))}" data-supporter-field="amountUsd" data-index="${index}"></div>
                    <div class="dash-field"><label>${msg('labelSortOrder')}</label><input type="number" value="${escapeHtml(String(supporter.sortOrder))}" data-supporter-field="sortOrder" data-index="${index}"></div>
                </div>
            </article>
        `).join('');
    }

    function syncSupportButtonRowPreview(index) {
        if (!supportButtonsListEl) return;
        const row = supportButtonsListEl.querySelector(`[data-support-button-row="${index}"]`);
        if (!(row instanceof HTMLElement)) return;

        const supportPage = ensureSupportDraft();
        const button = supportPage.buttons[index];
        if (!button) return;

        const pillEl = row.querySelector('.dash-inline-pill');
        const titleEl = row.querySelector('.dash-inline-form-title');
        if (pillEl instanceof HTMLElement) pillEl.textContent = button.id;
        if (titleEl instanceof HTMLElement) {
            titleEl.textContent = button.label || button.title || msg('methodN', index + 1);
        }
    }

    function syncSupporterRowPreview(index) {
        if (!supportersAdminListEl) return;
        const row = supportersAdminListEl.querySelector(`[data-supporter-row="${index}"]`);
        if (!(row instanceof HTMLElement)) return;

        const supportPage = ensureSupportDraft();
        const supporter = supportPage.supporters[index];
        if (!supporter) return;

        const avatarEl = row.querySelector('.dash-supporter-avatar');
        const nameEl = row.querySelector('.dash-supporter-name');
        const amountEl = row.querySelector('.dash-supporter-amount');

        if (avatarEl instanceof HTMLElement) {
            avatarEl.outerHTML = renderSupporterAvatar(supporter);
        }
        if (nameEl instanceof HTMLElement) {
            nameEl.textContent = supporter.name || msg('newSupporter');
        }
        if (amountEl instanceof HTMLElement) {
            amountEl.textContent = formatSupportUsd(supporter.amountUsd);
        }
    }

    function fillSupportForm() {
        const supportPage = ensureSupportDraft();
        if (supportMinAmountEl) supportMinAmountEl.value = String(supportPage.minimumAmountUsd ?? 2);
        if (supportRoleNameEl) supportRoleNameEl.value = supportPage.roleName || '@Premium';
        renderSupportSummary();
        renderSupportButtonsEditor();
        renderSupportersEditor();
    }

    function syncSupportMetaDraft() {
        const supportPage = ensureSupportDraft();
        const parsedAmount = Number(supportMinAmountEl?.value);
        supportPage.minimumAmountUsd = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : (supportPage.minimumAmountUsd || 0);
        supportPage.roleName = String(supportRoleNameEl?.value || '@Premium').trim() || '@Premium';
        renderSupportSummary();
        syncDraftControls();
    }

    function updateSupportButtonField(index, field, value) {
        const supportPage = ensureSupportDraft();
        const button = supportPage.buttons[index];
        if (!button) return;

        if (field === 'sortOrder') {
            button.sortOrder = toNumber(value, index + 1);
        } else {
            button[field] = String(value || '').trim();
        }

        syncSupportButtonRowPreview(index);
        syncDraftControls();
    }

    function updateSupporterField(index, field, value) {
        const supportPage = ensureSupportDraft();
        const supporter = supportPage.supporters[index];
        if (!supporter) return;

        if (field === 'amountUsd') {
            const parsedAmount = Number(value);
            supporter.amountUsd = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : (supporter.amountUsd || 0);
        } else if (field === 'sortOrder') {
            supporter.sortOrder = toNumber(value, index + 1);
        } else {
            supporter[field] = String(value || '').trim();
        }

        syncSupporterRowPreview(index);
        syncDraftControls();
    }

    function renderAdminView() {
        const viewCopy = copy[editorActiveView] || copy.home;
        editorAdminTitleEl.textContent = viewCopy.title;
        editorAdminSubtitleEl.textContent = viewCopy.subtitle;
        if (homeViewEl) homeViewEl.classList.toggle('active', editorActiveView === 'home');
        if (productsViewEl) productsViewEl.classList.toggle('active', editorActiveView === 'products');
        if (supportViewEl) supportViewEl.classList.toggle('active', editorActiveView === 'support');
        if (miscViewEl) miscViewEl.classList.toggle('active', editorActiveView === 'misc');
        if (addProductBtnEl) addProductBtnEl.hidden = editorActiveView !== 'products';
        if (addTeamMemberBtnEl) addTeamMemberBtnEl.hidden = editorActiveView !== 'misc';
        if (editorActiveView === 'support') fillSupportForm();
        adminViewLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.adminView === editorActiveView);
        });
        syncProductEditorState();
        renderHomeDashboard();
    }

    function setAdminView(view) {
        if (!copy[view]) return;
        commitOpenProductForm(editorActiveView === 'products');
        commitOpenTeamForm(editorActiveView === 'misc');
        syncSocialsFromInputs();
        renderEditorSocialPreview();
        editorActiveView = view;
        renderAdminView();
    }

    function getTeamEntries() {
        return editorData.team
            .map((member, index) => ({ member, index }))
            .sort((a, b) => {
                const bySort = toNumber(a.member.sortOrder, a.index + 1) - toNumber(b.member.sortOrder, b.index + 1);
                if (bySort !== 0) return bySort;
                return a.member.name.localeCompare(b.member.name, locale === 'ua' ? 'uk' : locale);
            });
    }

    function getTeamCardSummary(member) {
        const source = String(member.description || '').replace(/\s+/g, ' ').trim();
        if (!source) return msg('noDescription');
        return source.length > 100 ? `${source.slice(0, 97).trimEnd()}...` : source;
    }

    function clearTeamForm() {
        if (teamFieldNameEl) teamFieldNameEl.value = '';
        if (teamFieldRoleEl) teamFieldRoleEl.value = '';
        if (teamFieldAvatarEl) teamFieldAvatarEl.value = '';
        if (teamFieldOrderEl) teamFieldOrderEl.value = '';
        if (teamFieldBioEl) teamFieldBioEl.value = '';
    }

    function fillTeamForm(member) {
        if (teamFieldNameEl) teamFieldNameEl.value = member.name;
        if (teamFieldRoleEl) teamFieldRoleEl.value = member.role;
        if (teamFieldAvatarEl) teamFieldAvatarEl.value = member.avatarUrl;
        if (teamFieldOrderEl) teamFieldOrderEl.value = member.sortOrder;
        if (teamFieldBioEl) teamFieldBioEl.value = member.description;
    }

    function renderTeamGrid() {
        if (teamGridRenderFrame) {
            cancelAnimationFrame(teamGridRenderFrame);
            teamGridRenderFrame = 0;
        }
        if (teamMemberCountEl) teamMemberCountEl.textContent = String(editorData.team.length);
        const entries = getTeamEntries();
        if (!teamGridEl) return;

        if (!entries.length) {
            teamGridEl.innerHTML = `<div class="dash-empty-state">${msg('noTeamCards')}</div>`;
            return;
        }

        teamGridEl.innerHTML = entries.map(({ member, index }) => `
            <article class="dash-team-card ${index === teamSelectedIndex ? 'selected' : ''}" data-select-team="${index}" tabindex="0" role="button" aria-pressed="${index === teamSelectedIndex ? 'true' : 'false'}">
                <div class="dash-team-card-head">
                    ${renderTeamAvatar(member, 'dash-team-avatar')}
                    <div class="dash-team-copy">
                        <h3>${escapeHtml(member.name)}</h3>
                        <p class="mono">${escapeHtml(member.role)}</p>
                    </div>
                </div>
                <div class="dash-team-desc">${escapeHtml(getTeamCardSummary(member))}</div>
                <div class="dash-team-actions">
                    <button type="button" class="dash-btn dash-sm" data-team-move-up="${index}">↑</button>
                    <button type="button" class="dash-btn dash-sm" data-team-move-down="${index}">↓</button>
                </div>
            </article>
        `).join('');
    }

    function openTeamEditor(index) {
        if (!editorData.team[index]) return;
        teamSelectedIndex = index;
        const member = editorData.team[index];
        if (teamEditorTitleEl) teamEditorTitleEl.textContent = `${msg('editing')} — ${member.name}`;
        fillTeamForm(member);
        if (teamEditorEl) {
            teamEditorEl.hidden = false;
            teamEditorEl.setAttribute('aria-hidden', 'false');
        }
        if (teamEditorEmptyEl) {
            teamEditorEmptyEl.hidden = true;
            teamEditorEmptyEl.setAttribute('aria-hidden', 'true');
        }
        renderTeamGrid();
    }

    function closeTeamEditor(renderGrid = true) {
        teamSelectedIndex = -1;
        if (teamEditorEl) {
            teamEditorEl.hidden = true;
            teamEditorEl.setAttribute('aria-hidden', 'true');
        }
        if (teamEditorEmptyEl) {
            teamEditorEmptyEl.hidden = false;
            teamEditorEmptyEl.setAttribute('aria-hidden', 'false');
        }
        if (teamEditorTitleEl) teamEditorTitleEl.textContent = msg('editingMember');
        clearTeamForm();
        if (renderGrid) renderTeamGrid();
    }

    function createEmptyTeamMember() {
        const count = editorData.team.length + 1;
        return normalizeTeamMember({
            id: `team-member-${Date.now()}-${++_editorIdSeq}`,
            name: msg('newMember'),
            role: msg('roleDefault'),
            avatarUrl: '',
            description: '',
            sortOrder: count,
        }, count - 1);
    }

    function syncSelectedTeamMemberFromForm() {
        if (teamSelectedIndex < 0 || !editorData.team[teamSelectedIndex]) return false;
        const current = editorData.team[teamSelectedIndex];
        editorData.team[teamSelectedIndex] = normalizeTeamMember({
            ...current,
            name: teamFieldNameEl?.value,
            role: teamFieldRoleEl?.value,
            avatarUrl: teamFieldAvatarEl?.value,
            description: teamFieldBioEl?.value,
            sortOrder: toNumber(teamFieldOrderEl?.value, current.sortOrder || teamSelectedIndex + 1),
        }, teamSelectedIndex);
        scheduleSyncDraftControls();
        return true;
    }

    function commitOpenTeamForm(refreshGrid = true) {
        if (!teamEditorEl || teamEditorEl.hidden) return false;
        if (!syncSelectedTeamMemberFromForm()) return false;
        const member = editorData.team[teamSelectedIndex];
        if (member && teamEditorTitleEl) {
            teamEditorTitleEl.textContent = `${msg('editing')} — ${member.name}`;
        }
        if (refreshGrid) renderTeamGrid();
        return true;
    }

    function syncTeamDraftFromInputs(refreshGrid = true) {
        if (!syncSelectedTeamMemberFromForm()) return false;
        const member = editorData.team[teamSelectedIndex];
        if (member && teamEditorTitleEl) {
            teamEditorTitleEl.textContent = `${msg('editing')} — ${member.name}`;
        }
        if (refreshGrid) renderTeamGrid();
        return true;
    }

    function selectTeamMember(index) {
        commitOpenTeamForm();
        openTeamEditor(index);
    }

    function moveTeamMember(index, direction) {
        commitOpenTeamForm(false);
        const ordered = getTeamEntries();
        const position = ordered.findIndex((item) => item.index === index);
        const swapItem = ordered[position + direction];
        if (position < 0 || !swapItem) return;

        const reordered = ordered.map((item) => item.index);
        [reordered[position], reordered[position + direction]] = [reordered[position + direction], reordered[position]];
        reordered.forEach((memberIndex, order) => {
            editorData.team[memberIndex].sortOrder = order + 1;
        });

        renderTeamGrid();
        if (teamSelectedIndex >= 0) openTeamEditor(teamSelectedIndex);
        syncDraftControls();
    }

    function addTeamMember() {
        commitOpenTeamForm(false);
        editorData.team.push(createEmptyTeamMember());
        openTeamEditor(editorData.team.length - 1);
        syncDraftControls();
        emitToast(msg('toastTeamAdded'), 'success');
    }

    function deleteTeamMember() {
        if (teamSelectedIndex < 0 || !editorData.team[teamSelectedIndex]) return;
        if (!window.confirm(msg('confirmDeleteTeamMember'))) return;

        editorData.team.splice(teamSelectedIndex, 1);
        if (!editorData.team.length) {
            closeTeamEditor(false);
            renderTeamGrid();
            syncDraftControls();
            emitToast(msg('toastTeamRemoved'), 'success');
            return;
        }

        const nextIndex = Math.min(teamSelectedIndex, editorData.team.length - 1);
        openTeamEditor(nextIndex);
        syncDraftControls();
        emitToast(msg('toastTeamRemoved'), 'success');
    }

    function syncEditorTabs() {
        editorPanelEl.querySelectorAll('.dash-tab-btn').forEach((button) => {
            button.classList.toggle('active', button.dataset.tab === editorActiveTab);
        });
        editorPanelEl.querySelectorAll('.dash-tab-panel').forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.panel === editorActiveTab);
        });
    }

    function setEditorTab(tab) {
        editorActiveTab = ['tab-main', 'tab-content', 'tab-publish', 'tab-route'].includes(tab) ? tab : 'tab-main';
        syncEditorTabs();
    }

    function fillEditorForm(product) {
        if (editorFieldNameEl) editorFieldNameEl.value = product.title;
        if (editorFieldSlugEl) editorFieldSlugEl.value = product.id;
        if (editorFieldTagEl) editorFieldTagEl.value = product.tag;
        if (editorFieldVersionEl) editorFieldVersionEl.value = product.version;
        if (editorFieldOrderEl) editorFieldOrderEl.value = product.sortOrder;
        if (editorFieldStageEl) editorFieldStageEl.value = product.flag;
        if (editorFieldToneEl) editorFieldToneEl.value = product.tone;
        if (editorFieldStatusEl) editorFieldStatusEl.value = product.status;
        if (editorFieldDescEl) editorFieldDescEl.value = product.summary;
        if (editorFieldInstructionsEl) editorFieldInstructionsEl.value = product.instructions.join('\n');
        if (editorFieldNoteEl) editorFieldNoteEl.value = product.note;
        if (editorFieldShowcaseEl) editorFieldShowcaseEl.checked = product.featured;
        if (editorFieldShowcaseOrderEl) editorFieldShowcaseOrderEl.value = product.featuredOrder;
        if (editorFieldDownloadEl) editorFieldDownloadEl.value = product.downloadUrl;
        if (editorFieldSourceEl) editorFieldSourceEl.value = product.sourceUrl;
        if (editorFieldAutoRouteRedirectEl) editorFieldAutoRouteRedirectEl.checked = Boolean(product.autoRouteRedirect);
        if (routeModuleCategoryEl && !routeModuleCategoryEl.value) routeModuleCategoryEl.value = 'player';
        renderRouteModuleEditor();
        renderProductUploadMeta();
        syncEditorTabs();
    }

    function renderEditorGrid() {
        if (editorGridRenderFrame) {
            cancelAnimationFrame(editorGridRenderFrame);
            editorGridRenderFrame = 0;
        }
        if (editorTotalCountEl) editorTotalCountEl.textContent = String(editorData.products.length);
        if (editorShowcaseCountEl) editorShowcaseCountEl.textContent = String(editorData.products.filter((item) => item.featured).length);

        const entries = getEditorEntries();
        if (!entries.length) {
            editorProductGridEl.innerHTML = `<div class="dash-empty-state">${msg('searchEmpty')}</div>`;
            return;
        }

        editorProductGridEl.innerHTML = entries.map(({ product, index }) => {
            const toneClass = product.tone === 'green' ? 'tone-green' : 'tone-red';
            const metaParts = [
                product.id || 'product',
                product.version ? `v${product.version}` : '',
                product.featured
                    ? msg('showcase')
                    : '',
            ].filter(Boolean);

            return `
                <article class="dash-product-card ${toneClass} ${index === editorSelectedIndex ? 'selected' : ''}" data-select-product="${index}" tabindex="0" role="button" aria-pressed="${index === editorSelectedIndex ? 'true' : 'false'}">
                    <div class="dash-product-cover">
                        <div class="dash-product-avatar">${escapeHtml(getProductInitials(product.title))}</div>
                        ${renderEditorStageBadge(product.flag)}
                    </div>
                    <div class="dash-product-info">
                        <div class="dash-product-kicker">${escapeHtml(metaParts.join(' · '))}</div>
                        <h3>${escapeHtml(product.title)}</h3>
                        <p>${escapeHtml(getEditorCardSummary(product))}</p>
                    </div>
                    <div class="dash-product-actions">
                        <span class="dash-product-order">#${escapeHtml(String(toNumber(product.sortOrder, index + 1)))}</span>
                        <button type="button" class="dash-btn dash-sm" data-move-up="${index}">↑</button>
                        <button type="button" class="dash-btn dash-sm" data-move-down="${index}">↓</button>
                    </div>
                </article>
            `;
        }).join('');
    }

    function openProductEditor(index) {
        if (!editorData.products[index]) return;
        editorSelectedIndex = index;
        const product = editorData.products[index];
        if (editorTitleEl) editorTitleEl.textContent = `${msg('editing')} — ${product.title}`;
        fillEditorForm(product);
        syncProductEditorState();
        renderEditorGrid();
    }

    function closeProductEditor(renderGrid = true) {
        editorSelectedIndex = -1;
        if (editorTitleEl) editorTitleEl.textContent = msg('editing');
        clearEditorForm();
        syncProductEditorState();
        if (renderGrid) renderEditorGrid();
    }

    function disarmEditorAccess() {
        editorAccessArmed = false;
        if (editorAccessTimer) {
            clearTimeout(editorAccessTimer);
            editorAccessTimer = null;
        }
    }

    function armEditorAccess() {
        disarmEditorAccess();
        editorAccessArmed = true;
        editorAccessTimer = window.setTimeout(() => {
            disarmEditorAccess();
        }, 12000);
    }

    function resetEditorDraftToSaved() {
        pendingProductUploads.clear();
        siteData = deepClone(savedSiteData);
        editorData = deepClone(savedSiteData);
        editorSelectedIndex = -1;
        teamSelectedIndex = -1;
        editorActiveTab = 'tab-main';
        editorSearchQuery = '';
        if (editorSearchEl) editorSearchEl.value = '';
        closeProductEditor(false);
        closeTeamEditor(false);
        fillSupportForm();
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        renderAdminView();
        renderSite(siteData);
        renderProductUploadMeta();
        syncDraftControls();
    }

    function openEditor() {
        disarmEditorAccess();
        editorData = deepClone(siteData);
        editorSelectedIndex = -1;
        teamSelectedIndex = -1;
        editorActiveTab = 'tab-main';
        editorActiveView = 'home';
        editorSearchQuery = '';
        if (editorSearchEl) editorSearchEl.value = '';
        closeProductEditor(false);
        closeTeamEditor(false);
        fillSupportForm();
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        renderAdminView();
        editorOverlayEl.classList.add('open');
        editorOverlayEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('editor-open');
        renderGitHubSyncTarget();
        renderProductUploadMeta();
        syncDraftControls();
    }

    function closeEditor({ force = false } = {}) {
        if (!force && hasUnsavedDraftChanges()) {
            const ok = window.confirm(msg('confirmCloseUnsaved'));
            if (!ok) return false;
            resetEditorDraftToSaved();
        }

        if (isStandaloneAdminPage) {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                navigateWithRouteTransition(adminHomeHref);
            }
            return true;
        }

        editorOverlayEl.classList.remove('open');
        editorOverlayEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('editor-open');
        return true;
    }

    function createEmptyProduct() {
        const count = editorData.products.length + 1;
        return normalizeProduct({
            id: `new-product-${Date.now()}-${++_editorIdSeq}`,
            title: msg('newProduct'),
            version: 'x',
            tag: `product ${String(count).padStart(2, '0')}`,
            flag: '',
            status: msg('statusLater'),
            featured: false,
            featuredOrder: count,
            sortOrder: count,
            tone: 'red',
            summary: '',
            instructions: [],
            sourceUrl: '',
            downloadUrl: '',
            detailUrl: '',
            note: '',
            autoRouteRedirect: false,
            routeModules: {},
        }, count - 1);
    }

    function readInstructionLines(value) {
        return String(value || '')
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean);
    }

    function syncSelectedProductFromForm() {
        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) return false;
        const current = editorData.products[editorSelectedIndex];
        let nextProduct = normalizeProduct({
            ...current,
            title: editorFieldNameEl?.value,
            id: editorFieldSlugEl?.value,
            tag: editorFieldTagEl?.value,
            version: editorFieldVersionEl?.value,
            sortOrder: toNumber(editorFieldOrderEl?.value, current.sortOrder || editorSelectedIndex + 1),
            flag: editorFieldStageEl?.value,
            tone: editorFieldToneEl?.value,
            status: editorFieldStatusEl?.value,
            summary: editorFieldDescEl?.value,
            instructions: readInstructionLines(editorFieldInstructionsEl?.value),
            note: editorFieldNoteEl?.value,
            featured: Boolean(editorFieldShowcaseEl?.checked),
            featuredOrder: toNumber(editorFieldShowcaseOrderEl?.value, current.featuredOrder || editorSelectedIndex + 1),
            downloadUrl: editorFieldDownloadEl?.value,
            sourceUrl: editorFieldSourceEl?.value,
            detailUrl: current.detailUrl,
            autoRouteRedirect: Boolean(editorFieldAutoRouteRedirectEl?.checked),
            routeModules: current.routeModules,
        }, editorSelectedIndex);

        const usedProductIds = new Set(
            editorData.products
                .map((product, index) => (index === editorSelectedIndex ? '' : String(product?.id || '').trim()))
                .filter(Boolean),
        );
        nextProduct = {
            ...nextProduct,
            id: makeUniqueId(nextProduct.id, usedProductIds, nextProduct.title),
        };

        nextProduct = syncPendingUploadForProduct(current, nextProduct, editorFieldDownloadEl?.value.trim() || '');
        editorData.products[editorSelectedIndex] = nextProduct;

        if (editorFieldSlugEl && editorFieldSlugEl.value !== nextProduct.id) {
            editorFieldSlugEl.value = nextProduct.id;
        }

        if (nextProduct.autoRouteRedirect) {
            editorData.products = editorData.products.map((product, index) => {
                if (index === editorSelectedIndex) return product;
                return { ...product, autoRouteRedirect: false };
            });
        }

        renderProductUploadMeta();
        scheduleSyncDraftControls();
        return true;
    }

    function commitOpenProductForm(refreshGrid = true) {
        if (!editorPanelEl.classList.contains('open')) return false;
        if (!syncSelectedProductFromForm()) return false;
        const product = editorData.products[editorSelectedIndex];
        if (product && editorTitleEl) {
            editorTitleEl.textContent = `${msg('editing')} — ${product.title}`;
        }
        if (refreshGrid) renderEditorGrid();
        return true;
    }

    function commitAllEditorState(refreshGrid = true) {
        commitOpenProductForm(refreshGrid);
        commitOpenTeamForm(refreshGrid);
        syncSocialsFromInputs();
        renderEditorSocialPreview();
        renderProductUploadMeta();
        syncDraftControls();
    }

    function syncProductDraftFromInputs(refreshGrid = true) {
        if (!syncSelectedProductFromForm()) return false;
        const product = editorData.products[editorSelectedIndex];
        if (product && editorTitleEl) {
            editorTitleEl.textContent = `${msg('editing')} — ${product.title}`;
        }
        if (refreshGrid) renderEditorGrid();
        return true;
    }

    function selectProduct(index) {
        commitOpenProductForm();
        openProductEditor(index);
    }

    function moveProduct(index, direction) {
        commitOpenProductForm(false);
        const ordered = getEditorEntries('');
        const position = ordered.findIndex((item) => item.index === index);
        const swapItem = ordered[position + direction];
        if (position < 0 || !swapItem) return;

        const reordered = ordered.map((item) => item.index);
        [reordered[position], reordered[position + direction]] = [reordered[position + direction], reordered[position]];
        reordered.forEach((productIndex, order) => {
            editorData.products[productIndex].sortOrder = order + 1;
        });

        renderEditorGrid();
        if (editorSelectedIndex >= 0) openProductEditor(editorSelectedIndex);
        syncDraftControls();
    }

    function addProduct() {
        commitOpenProductForm(false);
        editorData.products.push(createEmptyProduct());
        openProductEditor(editorData.products.length - 1);
        syncDraftControls();
        emitToast(msg('toastProductAdded'), 'success');
    }

    function deleteProduct() {
        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) return;
        if (!window.confirm(msg('confirmDeleteProduct'))) return;

        pendingProductUploads.delete(editorData.products[editorSelectedIndex].id);
        editorData.products.splice(editorSelectedIndex, 1);
        if (!editorData.products.length) editorData.products.push(createEmptyProduct());

        const nextIndex = Math.min(editorSelectedIndex, editorData.products.length - 1);
        openProductEditor(nextIndex);
        syncDraftControls();
        emitToast(msg('toastProductRemoved'), 'success');
    }

    function exportEditorJson() {
        const normalized = normalizeData(editorData);
        const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'site-content.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }

    async function importEditorJson(file) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const normalized = normalizeData(parsed);
        pendingProductUploads.clear();
        editorData = normalized;
        editorSelectedIndex = -1;
        teamSelectedIndex = -1;
        editorActiveTab = 'tab-main';
        editorActiveView = 'home';
        editorSearchQuery = '';
        if (editorSearchEl) editorSearchEl.value = '';
        closeProductEditor(false);
        closeTeamEditor(false);
        fillSupportForm();
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        renderAdminView();
        renderProductUploadMeta();
        syncDraftControls();
        emitToast(msg('toastJsonImported'), 'success');
    }

    function saveEditorDataLocally() {
        const normalized = applyEditorDataToPreview();
        const localSafeData = stripPendingUploadLinks(normalized);
        const stored = persistEditorData(localSafeData);
        renderProductUploadMeta();
        return { normalized: localSafeData, stored };
    }

    function handleApplyDraft() {
        commitAllEditorState();
        applyEditorDataToPreview();
        emitToast(msg('toastDraftApplied'), 'success');
    }

    function handleDiscardDraft() {
        if (!hasUnsavedDraftChanges()) return;
        if (!window.confirm(msg('confirmDiscard'))) return;
        resetEditorDraftToSaved();
        emitToast(msg('toastDraftDiscarded'), 'info');
    }

    function refreshAdminAfterSave() {
        fillSupportForm();
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        if (editorSelectedIndex >= 0 && editorData.products[editorSelectedIndex]) {
            fillEditorForm(editorData.products[editorSelectedIndex]);
        }
        if (teamSelectedIndex >= 0 && editorData.team[teamSelectedIndex]) {
            fillTeamForm(editorData.team[teamSelectedIndex]);
        }
        renderAdminView();
        renderProductUploadMeta();
        syncDraftControls();
    }

    function handleSaveLocal() {
        commitAllEditorState();
        const hadUploads = hasStagedUploads();
        const { stored } = saveEditorDataLocally();
        refreshAdminAfterSave();
        emitToast(
            stored
                ? (hadUploads ? msg('toastSavedLocalWithFiles') : msg('toastSavedLocal'))
                : msg('toastSavedNoStorage'),
            stored && !hadUploads ? 'success' : 'info',
        );
    }

    const publisher = createGitHubPublisher({
        getPendingUploads: () => pendingProductUploads,
        clearPendingUploads: () => pendingProductUploads.clear(),
        renderProductUploadMeta,
        syncDraftControls,
        getMessage: (key, fallback = '') => msg(key) || fallback,
    });
    const { renderGitHubSyncTarget, saveToGitHub } = publisher;

    let _savingToGithub = false;

    async function handleSaveGithub() {
        if (_savingToGithub) return;
        _savingToGithub = true;
        if (saveGithubBtnEl) saveGithubBtnEl.disabled = true;
        commitAllEditorState();
        try {
            const normalized = applyEditorDataToPreview();
            const savedData = await saveToGitHub(normalized);
            persistEditorData(savedData);
            const githubTokenEl = document.getElementById('githubToken');
            if (githubTokenEl) githubTokenEl.value = '';
            refreshAdminAfterSave();
            emitToast(
                msg('toastGithubSaved'),
                'success',
            );
        } catch (error) {
            syncDraftControls();
            emitToast(error?.message || msg('toastGithubFailed'), 'error');
        } finally {
            _savingToGithub = false;
            if (saveGithubBtnEl) saveGithubBtnEl.disabled = false;
        }
    }

    document.addEventListener('click', (event) => {
        const closeTrigger = event.target instanceof Element
            ? event.target.closest('[data-close-editor]')
            : null;
        if (closeTrigger) {
            closeEditor();
        }
    });

    editorAccessTriggerEl?.addEventListener('click', (event) => {
        if (!editorAccessArmed) return;
        event.preventDefault();
        sequenceBuffer = [];
        openEditor();
    });

    addProductBtnEl?.addEventListener('click', addProduct);
    addTeamMemberBtnEl?.addEventListener('click', addTeamMember);
    applyDraftBtnEl?.addEventListener('click', handleApplyDraft);
    discardDraftBtnEl?.addEventListener('click', handleDiscardDraft);
    homeApplyDraftBtnEl?.addEventListener('click', handleApplyDraft);
    homeDiscardDraftBtnEl?.addEventListener('click', handleDiscardDraft);

    const handleProductFieldMutation = () => {
        if (!syncProductDraftFromInputs(false)) return;
        scheduleEditorGridRender();
    };

    const handleTeamFieldMutation = () => {
        if (!syncTeamDraftFromInputs(false)) return;
        scheduleTeamGridRender();
    };

    [
        editorFieldNameEl,
        editorFieldSlugEl,
        editorFieldTagEl,
        editorFieldVersionEl,
        editorFieldOrderEl,
        editorFieldDescEl,
        editorFieldInstructionsEl,
        editorFieldNoteEl,
        editorFieldShowcaseOrderEl,
        editorFieldDownloadEl,
        editorFieldSourceEl,
    ].filter(Boolean).forEach((field) => {
        field.addEventListener('input', handleProductFieldMutation);
    });

    [
        editorFieldStageEl,
        editorFieldToneEl,
        editorFieldStatusEl,
        editorFieldShowcaseEl,
        editorFieldAutoRouteRedirectEl,
    ].filter(Boolean).forEach((field) => {
        field.addEventListener('change', handleProductFieldMutation);
    });

    [teamFieldNameEl, teamFieldRoleEl, teamFieldAvatarEl, teamFieldOrderEl, teamFieldBioEl]
        .filter(Boolean)
        .forEach((field) => {
            field.addEventListener('input', handleTeamFieldMutation);
        });

    editorFieldDownloadFileEl?.addEventListener('change', (event) => {
        const input = event.target;
        const file = input instanceof HTMLInputElement ? input.files?.[0] || null : null;
        stageProductDownloadFile(file);
    });

    clearDownloadFileBtnEl?.addEventListener('click', () => {
        clearStagedProductDownloadFile();
        emitToast(msg('toastFileRemoved'), 'info');
    });

    exportJsonBtnEl?.addEventListener('click', () => {
        commitAllEditorState();
        exportEditorJson();
        emitToast(msg('toastJsonExported'), 'success');
    });

    importJsonBtnEl?.addEventListener('click', () => importJsonInputEl?.click());

    importJsonInputEl?.addEventListener('change', async (event) => {
        const input = event.target;
        const file = input instanceof HTMLInputElement ? input.files?.[0] || null : null;
        if (!file) return;
        try {
            await importEditorJson(file);
        } catch {
            emitToast(msg('toastJsonImportFailed'), 'error');
        }
        input.value = '';
    });

    routeModuleCategoryEl?.addEventListener('change', () => {
        renderRouteModuleEditor();
    });

    addRouteModuleBtnEl?.addEventListener('click', () => {
        const routeModules = ensureSelectedProductRouteModules();
        if (!routeModules) return;
        const activeKey = getSelectedRouteModuleKey();
        routeModules[activeKey].push({
            name: msg('newFunction'),
            enabled: true,
        });
        renderRouteModuleEditor();
        syncDraftControls();
    });

    [supportMinAmountEl, supportRoleNameEl].filter(Boolean).forEach((field) => {
        field.addEventListener('input', syncSupportMetaDraft);
        field.addEventListener('change', syncSupportMetaDraft);
    });

    addSupportButtonBtnEl?.addEventListener('click', () => {
        const supportPage = ensureSupportDraft();
        supportPage.buttons.push(createEmptySupportButton());
        renderSupportButtonsEditor();
        syncDraftControls();
    });

    addSupporterBtnEl?.addEventListener('click', () => {
        const supportPage = ensureSupportDraft();
        supportPage.supporters.unshift(createEmptySupporter());
        renderSupportersEditor();
        syncDraftControls();
    });

    supportButtonsListEl?.addEventListener('input', (event) => {
        const target = event.target instanceof HTMLInputElement ? event.target : null;
        if (!target) return;
        const field = target.dataset.supportButtonField;
        const index = Number(target.dataset.index);
        if (!field || Number.isNaN(index)) return;
        updateSupportButtonField(index, field, target.value);
    });

    supportButtonsListEl?.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('[data-remove-support-button]') : null;
        if (!target) return;
        const index = Number(target.getAttribute('data-remove-support-button'));
        const supportPage = ensureSupportDraft();
        if (!removeIndexedItem(supportPage.buttons, index)) return;
        renderSupportButtonsEditor();
        syncDraftControls();
    });

    supportersAdminListEl?.addEventListener('input', (event) => {
        const target = event.target instanceof HTMLInputElement ? event.target : null;
        if (!target) return;
        const field = target.dataset.supporterField;
        const index = Number(target.dataset.index);
        if (!field || Number.isNaN(index)) return;
        updateSupporterField(index, field, target.value);
    });

    supportersAdminListEl?.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('[data-remove-supporter]') : null;
        if (!target) return;
        const index = Number(target.getAttribute('data-remove-supporter'));
        const supportPage = ensureSupportDraft();
        if (!removeIndexedItem(supportPage.supporters, index)) return;
        renderSupportersEditor();
        syncDraftControls();
    });

    routeModuleListEl?.addEventListener('input', (event) => {
        const target = event.target instanceof HTMLInputElement ? event.target : null;
        if (!target) return;

        const routeModules = ensureSelectedProductRouteModules();
        if (!routeModules) return;
        const activeKey = getSelectedRouteModuleKey();
        const activeItems = routeModules[activeKey];

        if (target.hasAttribute('data-route-module-name')) {
            const index = Number(target.getAttribute('data-route-module-name'));
            if (!isValidListIndex(activeItems, index)) return;
            activeItems[index].name = target.value;
            syncDraftControls();
        }
    });

    routeModuleListEl?.addEventListener('change', (event) => {
        const target = event.target instanceof HTMLInputElement ? event.target : null;
        if (!target) return;

        const routeModules = ensureSelectedProductRouteModules();
        if (!routeModules) return;
        const activeKey = getSelectedRouteModuleKey();
        const activeItems = routeModules[activeKey];

        if (target.hasAttribute('data-route-module-enabled')) {
            const index = Number(target.getAttribute('data-route-module-enabled'));
            if (!isValidListIndex(activeItems, index)) return;
            activeItems[index].enabled = target.checked;
            syncDraftControls();
        }
    });

    routeModuleListEl?.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target.closest('[data-route-module-remove]') : null;
        if (!target) return;
        const routeModules = ensureSelectedProductRouteModules();
        if (!routeModules) return;
        const activeKey = getSelectedRouteModuleKey();
        const index = Number(target.getAttribute('data-route-module-remove'));
        if (!removeIndexedItem(routeModules[activeKey], index)) return;
        renderRouteModuleEditor();
        syncDraftControls();
    });

    adminViewLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            setAdminView(link.dataset.adminView);
        });
    });

    clearLocalBtnEl?.addEventListener('click', () => {
        if (!window.confirm(msg('confirmClearLocal'))) {
            return;
        }

        const cleared = storageRemove(LOCAL_DATA_KEY);
        if (cleared) {
            savedSiteData = normalizeData(DEFAULT_SITE_DATA);
            resetEditorDraftToSaved();
        }
        emitToast(
            cleared ? msg('toastLocalCleared') : msg('toastLocalClearFailed'),
            cleared ? 'success' : 'error',
        );
    });

    editorSearchEl?.addEventListener('input', (event) => {
        editorSearchQuery = event.target.value;
        scheduleEditorGridRender();
    });

    [socialYoutubeEl, socialDiscordEl, socialTelegramEl].filter(Boolean).forEach((field) => {
        field.addEventListener('input', () => {
            syncSocialsFromInputs();
            renderEditorSocialPreview();
            syncDraftControls();
        });
        field.addEventListener('change', () => {
            syncSocialsFromInputs();
            renderEditorSocialPreview();
            syncDraftControls();
        });
    });

    editorProductGridEl.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const button = target?.closest('button');
        if (button?.hasAttribute('data-move-up')) {
            moveProduct(Number(button.getAttribute('data-move-up')), -1);
            return;
        }
        if (button?.hasAttribute('data-move-down')) {
            moveProduct(Number(button.getAttribute('data-move-down')), 1);
            return;
        }
        const card = target?.closest('[data-select-product]');
        if (card) selectProduct(Number(card.getAttribute('data-select-product')));
    });

    editorProductGridEl.addEventListener('keydown', (event) => {
        const target = event.target instanceof HTMLElement ? event.target : null;
        const card = target?.closest('[data-select-product]');
        if (!card) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectProduct(Number(card.getAttribute('data-select-product')));
    });

    teamGridEl?.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const button = target?.closest('button');
        if (button?.hasAttribute('data-team-move-up')) {
            moveTeamMember(Number(button.getAttribute('data-team-move-up')), -1);
            return;
        }
        if (button?.hasAttribute('data-team-move-down')) {
            moveTeamMember(Number(button.getAttribute('data-team-move-down')), 1);
            return;
        }
        const card = target?.closest('[data-select-team]');
        if (card) selectTeamMember(Number(card.getAttribute('data-select-team')));
    });

    teamGridEl?.addEventListener('keydown', (event) => {
        const target = event.target instanceof HTMLElement ? event.target : null;
        const card = target?.closest('[data-select-team]');
        if (!card) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectTeamMember(Number(card.getAttribute('data-select-team')));
    });

    editorPanelEl.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const button = target?.closest('.dash-tab-btn');
        if (!button) return;
        setEditorTab(button.dataset.tab || 'tab-main');
    });

    closeProductEditorBtnEl?.addEventListener('click', () => closeProductEditor());
    deleteProductBtnEl?.addEventListener('click', deleteProduct);
    closeTeamEditorBtnEl?.addEventListener('click', () => closeTeamEditor());
    deleteTeamMemberBtnEl?.addEventListener('click', deleteTeamMember);
    saveLocalBtnEl?.addEventListener('click', handleSaveLocal);
    saveGithubBtnEl?.addEventListener('click', () => { void handleSaveGithub(); });

    window.addEventListener('beforeunload', (event) => {
        if (editorOverlayEl.classList.contains('open') && hasUnsavedDraftChanges()) {
            event.preventDefault();
            event.returnValue = '';
        }
    });

    document.addEventListener('keydown', (event) => {
        if (editorOverlayEl.classList.contains('open')) {
            if (event.key === 'Escape') closeEditor();
            return;
        }

        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

        sequenceBuffer.push(event.key);
        if (sequenceBuffer.length > SECRET_SEQUENCE.length) sequenceBuffer.shift();

        const matches = SECRET_SEQUENCE.every((key, index) => sequenceBuffer[index] === key);
        if (matches) {
            sequenceBuffer = [];
            armEditorAccess();
        }
    });

    async function initialize() {
        renderGitHubSyncTarget();
        await initializeData();
        closeProductEditor(false);
        closeTeamEditor(false);
        fillSupportForm();
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        renderAdminView();
        renderProductUploadMeta();
        syncDraftControls();
        if (isStandaloneAdminPage) openEditor();
    }

    return { initialize };
}
