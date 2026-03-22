import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { LOCAL_DATA_KEY, SECRET_SEQUENCE, SOCIAL_PLATFORMS } from '../core/constants.js';
import {
    deepClone,
    formatBytes,
    getFlagMeta,
    normalizeData,
    normalizeProduct,
    normalizeTeamMember,
    toNumber,
} from '../core/data-utils.js';
import { cleanUrl, escapeHtml } from '../core/dom.js';
import { createGitHubPublisher } from '../github/publisher.js';

const GITHUB_CONTENTS_MAX_FILE_BYTES = 100 * 1024 * 1024;

const ADMIN_VIEW_COPY = Object.freeze({
    ru: {
        home: { title: 'Главная', subtitle: 'Центр управления черновиком, публикацией и быстрыми переходами по админке.' },
        products: { title: 'Продукты', subtitle: 'Управление карточками, ссылками, порядком и публикацией релизов.' },
        misc: { title: 'Прочее', subtitle: 'Команда, социальные ссылки и дополнительные настройки витрины.' },
    },
    en: {
        home: { title: 'Home', subtitle: 'Control draft state, publication and quick admin navigation.' },
        products: { title: 'Products', subtitle: 'Manage cards, links, order and publication state for releases.' },
        misc: { title: 'Misc', subtitle: 'Team, social links and additional showcase settings.' },
    },
    ua: {
        home: { title: 'Головна', subtitle: 'Центр керування чернеткою, публікацією та швидкими переходами в адмінці.' },
        products: { title: 'Продукти', subtitle: 'Керування картками, посиланнями, порядком та публікацією релізів.' },
        misc: { title: 'Інше', subtitle: 'Команда, соціальні посилання та додаткові налаштування вітрини.' },
    },
});

const SOCIAL_ICON_MAP = Object.freeze({
    youtube: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/></svg>',
    discord: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/></svg>',
    telegram: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/></svg>',
});

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
    if (member.avatarUrl) {
        return `<div class="${className}"><img src="${escapeHtml(member.avatarUrl)}" alt="${escapeHtml(member.name)}"></div>`;
    }
    return `<div class="${className}">${escapeHtml(getTeamInitials(member.name))}</div>`;
}

function renderSocialIcon(kind) {
    return SOCIAL_ICON_MAP[kind] || SOCIAL_ICON_MAP.telegram;
}

function getAdminCopy(locale) {
    return ADMIN_VIEW_COPY[locale] || ADMIN_VIEW_COPY.ru;
}

export function createEditorController({ renderSite, showToast, locale = 'ru' }) {
    const copy = getAdminCopy(locale);
    const isStandaloneAdminPage = document.body.dataset.adminPage === 'true';
    const adminPageHref = new URL('../admin/', window.location.href).toString();
    const adminHomeHref = document.body.dataset.adminHome || '../ru/';

    const editorOverlayEl = document.getElementById('editorOverlay');
    const editorAccessTriggerEl = document.getElementById('editorAccessTrigger') || document.getElementById('logoLink');
    const editorAdminTitleEl = document.getElementById('editorAdminTitle');
    const editorAdminSubtitleEl = document.getElementById('editorAdminSubtitle');
    const productsToolbarEl = document.getElementById('productsToolbar');
    const homeViewEl = document.getElementById('homeView');
    const productsViewEl = document.getElementById('productsView');
    const miscViewEl = document.getElementById('miscView');
    const homeDraftSummaryEl = document.getElementById('homeDraftSummary');
    const homeProductsCountEl = document.getElementById('homeProductsCount');
    const homeFeaturedCountEl = document.getElementById('homeFeaturedCount');
    const homeTeamCountEl = document.getElementById('homeTeamCount');
    const homeSocialCountEl = document.getElementById('homeSocialCount');
    const homeUploadsCountEl = document.getElementById('homeUploadsCount');
    const editorProductGridEl = document.getElementById('editorProductGrid');
    const editorPanelEl = document.getElementById('editor');
    const editorTitleEl = document.getElementById('editorTitle');
    const editorSearchEl = document.getElementById('editorSearchInput');
    const editorTotalCountEl = document.getElementById('editorTotalCount');
    const editorShowcaseCountEl = document.getElementById('editorShowcaseCount');
    const addProductBtnEl = document.getElementById('addProductBtn');
    const addTeamMemberBtnEl = document.getElementById('addTeamMemberBtn');
    const draftStateChipEl = document.getElementById('draftStateChip');
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
        if (editorAccessTriggerEl && !isStandaloneAdminPage) {
            let sequenceBuffer = [];
            let editorAccessArmed = false;
            let editorAccessTimer = null;

            function disarmRedirectAccess() {
                editorAccessArmed = false;
                if (editorAccessTimer) {
                    window.clearTimeout(editorAccessTimer);
                    editorAccessTimer = null;
                }
            }

            function armRedirectAccess() {
                editorAccessArmed = true;
                if (editorAccessTimer) window.clearTimeout(editorAccessTimer);
                editorAccessTimer = window.setTimeout(() => {
                    disarmRedirectAccess();
                }, 12000);
            }

            editorAccessTriggerEl.addEventListener('click', (event) => {
                if (!editorAccessArmed) return;
                event.preventDefault();
                disarmRedirectAccess();
                sequenceBuffer = [];
                document.body.classList.add('route-leaving');
                window.setTimeout(() => {
                    window.location.assign(adminPageHref);
                }, 170);
            });

            document.addEventListener('keydown', (event) => {
                const tag = document.activeElement?.tagName?.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

                sequenceBuffer.push(event.key);
                if (sequenceBuffer.length > SECRET_SEQUENCE.length) sequenceBuffer.shift();

                const matches = SECRET_SEQUENCE.every((key, index) => sequenceBuffer[index] === key);
                if (!matches) return;

                sequenceBuffer = [];
                armRedirectAccess();
            });
        }

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

    function emitToast(message, kind = 'info') {
        if (typeof showToast === 'function') showToast(message, kind);
    }

    function hasStagedUploads() {
        return pendingProductUploads.size > 0;
    }

    function hasUnappliedDraftChanges() {
        return serializeData(editorData) !== serializeData(siteData);
    }

    function hasUnsavedDraftChanges() {
        return hasStagedUploads()
            || serializeData(editorData) !== serializeData(savedSiteData)
            || serializeData(siteData) !== serializeData(savedSiteData);
    }

    function countEnabledSocials() {
        return Object.values(editorData.socials || {}).filter(Boolean).length;
    }

    function renderHomeDashboard() {
        if (homeProductsCountEl) homeProductsCountEl.textContent = String(editorData.products.length);
        if (homeFeaturedCountEl) homeFeaturedCountEl.textContent = String(editorData.products.filter((item) => item.featured).length);
        if (homeTeamCountEl) homeTeamCountEl.textContent = String(editorData.team.length);
        if (homeSocialCountEl) homeSocialCountEl.textContent = String(countEnabledSocials());
        if (homeUploadsCountEl) homeUploadsCountEl.textContent = String(pendingProductUploads.size);
        if (!homeDraftSummaryEl) return;

        const hasPreviewDiff = hasUnappliedDraftChanges();
        const hasSavedDiff = hasUnsavedDraftChanges();
        const uploadCount = pendingProductUploads.size;
        let toneClass = 'is-clean';
        let badge = locale === 'en' ? 'Clean' : locale === 'ua' ? 'Без змін' : 'Без изменений';
        let lead = locale === 'en'
            ? 'Draft is in sync with the current site state. You can close the panel or continue editing.'
            : locale === 'ua'
                ? 'Чернетка синхронізована з поточним станом сайту. Можна закривати панель або продовжувати редагування.'
                : 'Черновик синхронизирован с текущей версией сайта. Можно закрывать панель или переходить к новым правкам.';

        if (hasPreviewDiff) {
            toneClass = 'is-action';
            badge = locale === 'en' ? 'Apply needed' : locale === 'ua' ? 'Потрібно застосувати' : 'Нужно применить';
            lead = locale === 'en'
                ? 'Some edits are still only in the form state. Apply the draft to preview the final result on this page.'
                : locale === 'ua'
                    ? 'Є зміни, які ще не застосовані до preview сторінки. Застосуй чернетку, щоб побачити фінальний результат.'
                    : 'Есть изменения в формах, которые ещё не применены к preview страницы. Нажми «Применить черновик», чтобы увидеть итог на этой вкладке.';
        } else if (hasSavedDiff) {
            toneClass = uploadCount ? 'is-ready' : 'is-warning';
            badge = uploadCount
                ? (locale === 'en' ? 'Ready to publish' : locale === 'ua' ? 'Готово до публікації' : 'Готов к публикации')
                : (locale === 'en' ? 'Save needed' : locale === 'ua' ? 'Потрібно зберегти' : 'Нужно сохранить');
            lead = uploadCount
                ? (locale === 'en'
                    ? 'Draft is prepared and selected files are queued for GitHub upload. You can publish changes for everyone.'
                    : locale === 'ua'
                        ? 'Чернетка підготовлена, а вибрані файли вже стоять у черзі на GitHub upload. Можна публікувати зміни для всіх.'
                        : 'Черновик уже собран, а выбранные файлы ждут загрузки в GitHub. Теперь можно публиковать изменения для всех.')
                : (locale === 'en'
                    ? 'Preview is already updated, but changes are not yet saved locally or published to GitHub.'
                    : locale === 'ua'
                        ? 'Preview вже оновлено, але зміни ще не збережені локально або не опубліковані у GitHub.'
                        : 'Черновик уже применён к preview, но ещё не сохранён локально или не опубликован для всех.');
        }

        const details = [
            hasPreviewDiff
                ? (locale === 'en' ? 'Preview is behind the form state.' : locale === 'ua' ? 'Preview відстає від форми.' : 'Preview отстаёт от формы.')
                : (locale === 'en' ? 'Preview is synced with the form state.' : locale === 'ua' ? 'Preview синхронізований із формами.' : 'Preview синхронизирован с формами.'),
            hasSavedDiff
                ? (locale === 'en' ? 'There are changes not yet saved.' : locale === 'ua' ? 'Є зміни, які ще не закріплені збереженням.' : 'Есть изменения, которые ещё не закреплены сохранением.')
                : (locale === 'en' ? 'No unsaved changes.' : locale === 'ua' ? 'Нових незбережених змін немає.' : 'Новых несохранённых изменений нет.'),
            uploadCount
                ? (locale === 'en' ? `GitHub uploads queued: ${uploadCount}.` : locale === 'ua' ? `У черзі GitHub upload: ${uploadCount}.` : `В очереди GitHub upload: ${uploadCount}.`)
                : (locale === 'en' ? 'No GitHub uploads queued.' : locale === 'ua' ? 'Немає нових файлів у черзі GitHub upload.' : 'Новых файлов в очереди GitHub upload нет.'),
        ];

        homeDraftSummaryEl.innerHTML = `
            <div class="dash-home-status ${toneClass}">
                <div class="dash-home-status-badge">${badge}</div>
                <h3>${lead}</h3>
                <div class="dash-home-status-list">
                    ${details.map((item) => `<div>${item}</div>`).join('')}
                </div>
            </div>
        `;
    }

    function syncDraftControls() {
        const hasPreviewDiff = hasUnappliedDraftChanges();
        const hasSavedDiff = hasUnsavedDraftChanges();

        if (draftStateChipEl) {
            if (hasSavedDiff) {
                draftStateChipEl.innerHTML = `<strong>${locale === 'en' ? 'Draft' : locale === 'ua' ? 'Чернетка' : 'Черновик'}:</strong> ${hasPreviewDiff
                    ? (locale === 'en' ? 'pending apply' : locale === 'ua' ? 'очікує застосування' : 'ожидает применения')
                    : (locale === 'en' ? 'ready to save' : locale === 'ua' ? 'готова до збереження' : 'готов к сохранению')}`;
            } else {
                draftStateChipEl.innerHTML = `<strong>${locale === 'en' ? 'Draft' : locale === 'ua' ? 'Чернетка' : 'Черновик'}:</strong> ${locale === 'en' ? 'no changes' : locale === 'ua' ? 'без змін' : 'без изменений'}`;
            }
        }

        if (applyDraftBtnEl) applyDraftBtnEl.disabled = !hasPreviewDiff;
        if (discardDraftBtnEl) discardDraftBtnEl.disabled = !hasSavedDiff;
        if (homeApplyDraftBtnEl) homeApplyDraftBtnEl.disabled = !hasPreviewDiff;
        if (homeDiscardDraftBtnEl) homeDiscardDraftBtnEl.disabled = !hasSavedDiff;
        renderHomeDashboard();
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

    function renderProductUploadMeta() {
        if (!editorFieldDownloadFileMetaEl) return;

        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) {
            editorFieldDownloadFileMetaEl.textContent = locale === 'en'
                ? 'Select a product to attach a file to its download button.'
                : locale === 'ua'
                    ? 'Вибери продукт, щоб прив’язати файл до його кнопки download.'
                    : 'Выбери товар, чтобы привязать файл к его кнопке download.';
            if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = true;
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        const product = editorData.products[editorSelectedIndex];
        const upload = getPendingProductUpload(product.id);
        if (!upload) {
            editorFieldDownloadFileMetaEl.textContent = locale === 'en'
                ? 'No file selected. You can keep a manual link above.'
                : locale === 'ua'
                    ? 'Файл не вибрано. Можна залишити ручне посилання вище.'
                    : 'Файл не выбран. Можно оставить ручную ссылку выше.';
            if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = true;
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        editorFieldDownloadFileMetaEl.textContent = `${locale === 'en' ? 'Prepared' : locale === 'ua' ? 'Підготовлено' : 'Подготовлено'}: ${upload.originalName} (${formatBytes(upload.file.size)}) -> ./${upload.relativePath}`;
        if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = false;
    }

    function syncPendingUploadForProduct(previousProduct, nextProduct, currentDownloadValue) {
        const upload = getPendingProductUpload(previousProduct.id);
        if (!upload) return nextProduct;

        const nextRelativePath = buildProductUploadRelativePath(nextProduct, upload.originalName);
        const previousAutoUrl = `./${upload.relativePath}`;
        const shouldRewriteDownload = currentDownloadValue === previousAutoUrl || previousProduct.downloadUrl === previousAutoUrl;
        const nextUpload = { ...upload, relativePath: nextRelativePath };

        pendingProductUploads.delete(previousProduct.id);
        pendingProductUploads.set(nextProduct.id, nextUpload);

        if (shouldRewriteDownload && editorFieldDownloadEl) {
            nextProduct.downloadUrl = `./${nextRelativePath}`;
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
            const expectedUrl = `./${upload.relativePath}`;
            if (editorFieldDownloadEl && editorFieldDownloadEl.value.trim() === expectedUrl) {
                editorFieldDownloadEl.value = '';
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
            emitToast(locale === 'en' ? 'Select a product first, then attach a file.' : locale === 'ua' ? 'Спочатку вибери продукт, а потім прикріплюй файл.' : 'Сначала выбери товар, потом прикрепляй файл.', 'error');
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        if (!file) {
            clearStagedProductDownloadFile();
            return;
        }

        if (file.size > GITHUB_CONTENTS_MAX_FILE_BYTES) {
            emitToast('GitHub Contents API не принимает файлы больше 100 MB.', 'error');
            if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
            return;
        }

        syncSelectedProductFromForm();
        const product = editorData.products[editorSelectedIndex];
        const relativePath = buildProductUploadRelativePath(product, file.name);
        pendingProductUploads.set(product.id, { file, originalName: file.name, relativePath });
        if (editorFieldDownloadEl) editorFieldDownloadEl.value = `./${relativePath}`;
        syncSelectedProductFromForm();
        renderProductUploadMeta();
        renderEditorGrid();
        syncDraftControls();
        emitToast(locale === 'en' ? 'File added to GitHub upload queue.' : locale === 'ua' ? 'Файл додано до черги GitHub sync.' : 'Файл добавлен в очередь GitHub sync.', 'success');
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
        if (!source) return locale === 'en' ? 'No description' : locale === 'ua' ? 'Немає опису' : 'Нет описания';
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
        if (!meta) return `<span class="dash-badge">${locale === 'en' ? 'Draft' : locale === 'ua' ? 'Чернетка' : 'Черновик'}</span>`;
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
        if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
        renderProductUploadMeta();
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
                ? 'href="#" aria-disabled="true" tabindex="-1"'
                : `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
            return `<a class="social-link square ${disabled ? 'is-disabled' : ''}" ${attrs} aria-label="${label}">${renderSocialIcon(key)}</a>`;
        }).join('');
        renderHomeDashboard();
    }

    function renderAdminView() {
        const viewCopy = copy[editorActiveView] || copy.home;
        editorAdminTitleEl.textContent = viewCopy.title;
        editorAdminSubtitleEl.textContent = viewCopy.subtitle;
        if (productsToolbarEl) productsToolbarEl.hidden = editorActiveView !== 'products';
        if (homeViewEl) homeViewEl.classList.toggle('active', editorActiveView === 'home');
        if (productsViewEl) productsViewEl.classList.toggle('active', editorActiveView === 'products');
        if (miscViewEl) miscViewEl.classList.toggle('active', editorActiveView === 'misc');
        if (addProductBtnEl) addProductBtnEl.hidden = editorActiveView !== 'products';
        if (addTeamMemberBtnEl) addTeamMemberBtnEl.hidden = editorActiveView !== 'misc';
        document.querySelectorAll('[data-admin-view]').forEach((link) => {
            link.classList.toggle('active', link.dataset.adminView === editorActiveView);
        });
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
        if (!source) return locale === 'en' ? 'No description' : locale === 'ua' ? 'Немає опису' : 'Нет описания';
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
        if (teamMemberCountEl) teamMemberCountEl.textContent = String(editorData.team.length);
        const entries = getTeamEntries();
        if (!teamGridEl) return;

        if (!entries.length) {
            teamGridEl.innerHTML = `<div class="dash-empty-state">${locale === 'en' ? 'No team cards yet. Add a member to build the team section.' : locale === 'ua' ? 'Поки немає карток команди. Додай учасника, щоб зібрати блок команди.' : 'Пока нет карточек команды. Нажми «+ Участник» и собери блок «Наша команда». '}</div>`;
            renderHomeDashboard();
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
        renderHomeDashboard();
    }

    function openTeamEditor(index) {
        if (!editorData.team[index]) return;
        teamSelectedIndex = index;
        const member = editorData.team[index];
        if (teamEditorTitleEl) teamEditorTitleEl.textContent = `${locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование'} — ${member.name}`;
        fillTeamForm(member);
        if (teamEditorEl) teamEditorEl.hidden = false;
        if (teamEditorEmptyEl) teamEditorEmptyEl.hidden = true;
        renderTeamGrid();
    }

    function closeTeamEditor(renderGrid = true) {
        teamSelectedIndex = -1;
        if (teamEditorEl) teamEditorEl.hidden = true;
        if (teamEditorEmptyEl) teamEditorEmptyEl.hidden = false;
        if (teamEditorTitleEl) teamEditorTitleEl.textContent = locale === 'en' ? 'Editing member' : locale === 'ua' ? 'Редагування учасника' : 'Редактирование участника';
        clearTeamForm();
        if (renderGrid) renderTeamGrid();
    }

    function createEmptyTeamMember() {
        const count = editorData.team.length + 1;
        return normalizeTeamMember({
            id: `team-member-${Date.now()}`,
            name: locale === 'en' ? 'New member' : locale === 'ua' ? 'Новий учасник' : 'Новый участник',
            role: locale === 'en' ? 'Role' : locale === 'ua' ? 'Роль' : 'Роль',
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
        syncDraftControls();
        return true;
    }

    function commitOpenTeamForm(refreshGrid = true) {
        if (!teamEditorEl || teamEditorEl.hidden) return false;
        if (!syncSelectedTeamMemberFromForm()) return false;
        const member = editorData.team[teamSelectedIndex];
        if (member && teamEditorTitleEl) {
            teamEditorTitleEl.textContent = `${locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование'} — ${member.name}`;
        }
        if (refreshGrid) renderTeamGrid();
        return true;
    }

    function syncTeamDraftFromInputs(refreshGrid = true) {
        if (!syncSelectedTeamMemberFromForm()) return false;
        const member = editorData.team[teamSelectedIndex];
        if (member && teamEditorTitleEl) {
            teamEditorTitleEl.textContent = `${locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование'} — ${member.name}`;
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
        emitToast(locale === 'en' ? 'Team member added.' : locale === 'ua' ? 'Учасника додано.' : 'Новый участник добавлен.', 'success');
    }

    function deleteTeamMember() {
        if (teamSelectedIndex < 0 || !editorData.team[teamSelectedIndex]) return;
        if (!window.confirm(locale === 'en' ? 'Delete this team member?' : locale === 'ua' ? 'Видалити цього учасника команди?' : 'Удалить участника команды?')) return;

        editorData.team.splice(teamSelectedIndex, 1);
        if (!editorData.team.length) {
            closeTeamEditor(false);
            renderTeamGrid();
            syncDraftControls();
            emitToast(locale === 'en' ? 'Team member removed.' : locale === 'ua' ? 'Учасника видалено.' : 'Участник удалён.', 'success');
            return;
        }

        const nextIndex = Math.min(teamSelectedIndex, editorData.team.length - 1);
        openTeamEditor(nextIndex);
        syncDraftControls();
        emitToast(locale === 'en' ? 'Team member removed.' : locale === 'ua' ? 'Учасника видалено.' : 'Участник удалён.', 'success');
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
        editorActiveTab = ['tab-main', 'tab-content', 'tab-publish'].includes(tab) ? tab : 'tab-main';
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
        renderProductUploadMeta();
        syncEditorTabs();
    }

    function renderEditorGrid() {
        if (editorTotalCountEl) editorTotalCountEl.textContent = String(editorData.products.length);
        if (editorShowcaseCountEl) editorShowcaseCountEl.textContent = String(editorData.products.filter((item) => item.featured).length);

        const entries = getEditorEntries();
        if (!entries.length) {
            editorProductGridEl.innerHTML = `<div class="dash-empty-state">${locale === 'en' ? 'Nothing matches your search.' : locale === 'ua' ? 'За запитом нічого не знайдено.' : 'По вашему запросу ничего не найдено.'}</div>`;
            renderHomeDashboard();
            return;
        }

        editorProductGridEl.innerHTML = entries.map(({ product, index }) => {
            const toneClass = product.tone === 'green' ? 'tone-green' : 'tone-red';
            return `
                <article class="dash-product-card ${toneClass} ${index === editorSelectedIndex ? 'selected' : ''}" data-select-product="${index}" tabindex="0" role="button" aria-pressed="${index === editorSelectedIndex ? 'true' : 'false'}">
                    <div class="dash-product-cover">
                        <div class="dash-product-avatar">${escapeHtml(getProductInitials(product.title))}</div>
                        ${renderEditorStageBadge(product.flag)}
                    </div>
                    <div class="dash-product-info">
                        <h3>${escapeHtml(product.title)}</h3>
                        <p>${escapeHtml(getEditorCardSummary(product))}</p>
                    </div>
                    <div class="dash-product-actions">
                        <button type="button" class="dash-btn dash-sm" data-move-up="${index}">↑</button>
                        <button type="button" class="dash-btn dash-sm" data-move-down="${index}">↓</button>
                    </div>
                </article>
            `;
        }).join('');
        renderHomeDashboard();
    }

    function openProductEditor(index) {
        if (!editorData.products[index]) return;
        editorSelectedIndex = index;
        const product = editorData.products[index];
        if (editorTitleEl) editorTitleEl.textContent = `${locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование'} — ${product.title}`;
        fillEditorForm(product);
        editorPanelEl.classList.add('open');
        renderEditorGrid();
    }

    function closeProductEditor(renderGrid = true) {
        editorSelectedIndex = -1;
        editorPanelEl.classList.remove('open');
        if (editorTitleEl) editorTitleEl.textContent = locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование';
        clearEditorForm();
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
            const ok = window.confirm(locale === 'en'
                ? 'There are unsaved changes. Close the panel and lose them?'
                : locale === 'ua'
                    ? 'Є незбережені зміни. Закрити панель і втратити їх?'
                    : 'Есть несохранённые изменения. Закрыть панель и потерять их?');
            if (!ok) return false;
            resetEditorDraftToSaved();
        }

        if (isStandaloneAdminPage) {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.assign(adminHomeHref);
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
            id: `new-product-${Date.now()}`,
            title: locale === 'en' ? 'New product' : locale === 'ua' ? 'Новий продукт' : 'Новый продукт',
            version: 'x',
            tag: `product ${String(count).padStart(2, '0')}`,
            flag: '',
            status: locale === 'en' ? 'later' : locale === 'ua' ? 'пізніше' : 'позже',
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
        }, editorSelectedIndex);
        nextProduct = syncPendingUploadForProduct(current, nextProduct, editorFieldDownloadEl?.value.trim() || '');
        editorData.products[editorSelectedIndex] = nextProduct;
        renderProductUploadMeta();
        syncDraftControls();
        return true;
    }

    function commitOpenProductForm(refreshGrid = true) {
        if (!editorPanelEl.classList.contains('open')) return false;
        if (!syncSelectedProductFromForm()) return false;
        const product = editorData.products[editorSelectedIndex];
        if (product && editorTitleEl) {
            editorTitleEl.textContent = `${locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование'} — ${product.title}`;
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
            editorTitleEl.textContent = `${locale === 'en' ? 'Editing' : locale === 'ua' ? 'Редагування' : 'Редактирование'} — ${product.title}`;
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
        emitToast(locale === 'en' ? 'Product added.' : locale === 'ua' ? 'Продукт додано.' : 'Новый продукт добавлен.', 'success');
    }

    function deleteProduct() {
        if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) return;
        if (!window.confirm(locale === 'en' ? 'Delete this product?' : locale === 'ua' ? 'Видалити цей продукт?' : 'Удалить товар?')) return;

        pendingProductUploads.delete(editorData.products[editorSelectedIndex].id);
        editorData.products.splice(editorSelectedIndex, 1);
        if (!editorData.products.length) editorData.products.push(createEmptyProduct());

        const nextIndex = Math.min(editorSelectedIndex, editorData.products.length - 1);
        openProductEditor(nextIndex);
        syncDraftControls();
        emitToast(locale === 'en' ? 'Product removed.' : locale === 'ua' ? 'Продукт видалено.' : 'Товар удалён из редактора.', 'success');
    }

    function exportEditorJson() {
        const normalized = normalizeData(editorData);
        const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'site-content.json';
        link.click();
        URL.revokeObjectURL(url);
    }

    async function importEditorJson(file) {
        const text = await file.text();
        const parsed = JSON.parse(text);
        pendingProductUploads.clear();
        editorData = normalizeData(parsed);
        editorSelectedIndex = -1;
        teamSelectedIndex = -1;
        editorActiveTab = 'tab-main';
        editorActiveView = 'home';
        editorSearchQuery = '';
        if (editorSearchEl) editorSearchEl.value = '';
        closeProductEditor(false);
        closeTeamEditor(false);
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        renderAdminView();
        renderProductUploadMeta();
        syncDraftControls();
        emitToast(locale === 'en' ? 'JSON imported into the editor.' : locale === 'ua' ? 'JSON імпортовано в редактор.' : 'JSON импортирован в редактор.', 'success');
    }

    function saveEditorDataLocally() {
        const normalized = applyEditorDataToPreview();
        const stored = persistEditorData(normalized);
        pendingProductUploads.clear();
        renderProductUploadMeta();
        return { normalized, stored };
    }

    function handleApplyDraft() {
        commitAllEditorState();
        applyEditorDataToPreview();
        emitToast(locale === 'en' ? 'Draft applied to the page.' : locale === 'ua' ? 'Чернетку застосовано до сторінки.' : 'Черновик применён к странице.', 'success');
    }

    function handleDiscardDraft() {
        if (!hasUnsavedDraftChanges()) return;
        if (!window.confirm(locale === 'en' ? 'Discard all unsaved changes and return to the saved version?' : locale === 'ua' ? 'Скасувати всі незбережені зміни й повернутися до збереженої версії?' : 'Отменить все неприменённые изменения и вернуться к сохранённой версии?')) return;
        resetEditorDraftToSaved();
        emitToast(locale === 'en' ? 'Draft discarded.' : locale === 'ua' ? 'Чернетку скасовано.' : 'Черновик отменён.', 'info');
    }

    function refreshAdminAfterSave() {
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
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
                ? (hadUploads
                    ? (locale === 'en' ? 'Saved locally. Re-select files before publishing them to GitHub.' : locale === 'ua' ? 'Збережено локально. Перед публікацією в GitHub вибери файли ще раз.' : 'Локально сохранено. Файлы в GitHub не загружались, для общей публикации их нужно выбрать заново.')
                    : (locale === 'en' ? 'Saved locally. Changes are now visible in this browser.' : locale === 'ua' ? 'Збережено локально. Зміни вже видно в цьому браузері.' : 'Локально сохранено. На этом браузере изменения уже видны.'))
                : (locale === 'en' ? 'Changes were applied but localStorage is unavailable in this browser.' : locale === 'ua' ? 'Зміни застосовані, але localStorage недоступний у цьому браузері.' : 'Изменения применены, но localStorage недоступен в этом браузере.'),
            stored && !hadUploads ? 'success' : 'info',
        );
    }

    const publisher = createGitHubPublisher({
        getPendingUploads: () => pendingProductUploads,
        clearPendingUploads: () => pendingProductUploads.clear(),
        renderProductUploadMeta,
        syncDraftControls,
    });
    const { renderGitHubSyncTarget, saveToGitHub } = publisher;

    async function handleSaveGithub() {
        commitAllEditorState();
        try {
            const normalized = applyEditorDataToPreview();
            const savedData = await saveToGitHub(normalized);
            persistEditorData(savedData);
            const githubTokenEl = document.getElementById('githubToken');
            if (githubTokenEl) githubTokenEl.value = '';
            refreshAdminAfterSave();
            emitToast(locale === 'en' ? 'Content and files were pushed to GitHub.' : locale === 'ua' ? 'Дані та файли відправлено в GitHub.' : 'Данные и файлы отправлены в GitHub. После публикации обновится контент сайта.', 'success');
        } catch (error) {
            syncDraftControls();
            emitToast(error?.message || (locale === 'en' ? 'Could not save to GitHub.' : locale === 'ua' ? 'Не вдалося зберегти в GitHub.' : 'Не удалось сохранить в GitHub.'), 'error');
        }
    }

    document.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.matches('[data-close-editor]')) {
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

    [
        editorFieldNameEl,
        editorFieldSlugEl,
        editorFieldTagEl,
        editorFieldVersionEl,
        editorFieldOrderEl,
        editorFieldStageEl,
        editorFieldToneEl,
        editorFieldStatusEl,
        editorFieldDescEl,
        editorFieldInstructionsEl,
        editorFieldNoteEl,
        editorFieldShowcaseEl,
        editorFieldShowcaseOrderEl,
        editorFieldDownloadEl,
        editorFieldSourceEl,
    ].filter(Boolean).forEach((field) => {
        field.addEventListener('input', () => syncProductDraftFromInputs());
        field.addEventListener('change', () => syncProductDraftFromInputs());
    });

    [teamFieldNameEl, teamFieldRoleEl, teamFieldAvatarEl, teamFieldOrderEl, teamFieldBioEl]
        .filter(Boolean)
        .forEach((field) => {
            field.addEventListener('input', () => syncTeamDraftFromInputs());
            field.addEventListener('change', () => syncTeamDraftFromInputs());
        });

    editorFieldDownloadFileEl?.addEventListener('change', (event) => {
        const input = event.target;
        const file = input instanceof HTMLInputElement ? input.files?.[0] || null : null;
        stageProductDownloadFile(file);
    });

    clearDownloadFileBtnEl?.addEventListener('click', () => {
        clearStagedProductDownloadFile();
        emitToast(locale === 'en' ? 'File removed from the GitHub queue.' : locale === 'ua' ? 'Файл прибрано з черги GitHub sync.' : 'Файл убран из очереди GitHub sync.', 'info');
    });

    exportJsonBtnEl?.addEventListener('click', () => {
        commitAllEditorState();
        exportEditorJson();
        emitToast(locale === 'en' ? 'JSON exported.' : locale === 'ua' ? 'JSON експортовано.' : 'JSON выгружен.', 'success');
    });

    importJsonBtnEl?.addEventListener('click', () => importJsonInputEl?.click());

    importJsonInputEl?.addEventListener('change', async (event) => {
        const input = event.target;
        const file = input instanceof HTMLInputElement ? input.files?.[0] || null : null;
        if (!file) return;
        try {
            await importEditorJson(file);
        } catch {
            emitToast(locale === 'en' ? 'Could not import JSON.' : locale === 'ua' ? 'Не вдалося імпортувати JSON.' : 'Не удалось импортировать JSON.', 'error');
        }
        input.value = '';
    });

    document.querySelectorAll('[data-admin-view]').forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            setAdminView(link.dataset.adminView);
        });
    });

    document.querySelectorAll('[data-admin-switch]').forEach((button) => {
        button.addEventListener('click', () => setAdminView(button.dataset.adminSwitch));
    });

    clearLocalBtnEl?.addEventListener('click', () => {
        const cleared = storageRemove(LOCAL_DATA_KEY);
        emitToast(
            cleared
                ? (locale === 'en' ? 'Local draft cleared. Reload to restore the embedded site version.' : locale === 'ua' ? 'Локальну чернетку очищено. Після оновлення сторінки підтягнеться вбудована версія сайту.' : 'Локальный черновик очищен. После обновления страницы подтянется встроенная версия сайта.')
                : (locale === 'en' ? 'Could not clear localStorage in this browser.' : locale === 'ua' ? 'Не вдалося очистити localStorage у цьому браузері.' : 'Не удалось очистить localStorage в этом браузере.'),
            cleared ? 'success' : 'error',
        );
    });

    editorSearchEl?.addEventListener('input', (event) => {
        editorSearchQuery = event.target.value;
        renderEditorGrid();
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
