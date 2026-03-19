import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import {
    ADMIN_VIEW_COPY,
    GITHUB_CONTENTS_MAX_FILE_BYTES,
    LOCAL_DATA_KEY,
    SECRET_SEQUENCE,
    SOCIAL_META
} from '../core/constants.js';
import {
    deepClone,
    storageGet,
    storageSet,
    storageRemove,
    serializeData,
    buildProductUploadRelativePath,
    formatBytes,
    normalizeData,
    normalizeSocials,
    normalizeTeamMember,
    normalizeSupporter,
    normalizeProduct,
    toNumber,
    escapeHtml,
    renderSocialIcon,
    renderTeamAvatar,
    getFlagMeta
} from '../core/site-utils.js';
import { createGitHubPublisher } from '../github/publisher.js';

export function createEditorController({ publicSite }) {
const editorOverlayEl = document.getElementById('editorOverlay');
const editorAccessTriggerEl = document.getElementById('editorAccessTrigger');
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
const addSupporterBtnEl = document.getElementById('addSupporterBtn');
const supporterMemberCountEl = document.getElementById('supporterMemberCount');
const supporterGridEl = document.getElementById('supporterGrid');
const supporterEditorEl = document.getElementById('supporterEditor');
const supporterEditorEmptyEl = document.getElementById('supporterEditorEmpty');
const supporterEditorTitleEl = document.getElementById('supporterEditorTitle');
const closeSupporterEditorBtnEl = document.getElementById('closeSupporterEditorBtn');
const deleteSupporterBtnEl = document.getElementById('deleteSupporterBtn');
const supporterFieldNameEl = document.getElementById('supporter-name');
const supporterFieldRoleEl = document.getElementById('supporter-role');
const supporterFieldAvatarEl = document.getElementById('supporter-avatar');
const supporterFieldOrderEl = document.getElementById('supporter-order');
const homeSupportersCountEl = document.getElementById('homeSupportersCount');
const viewAllSupportersBtnEl = document.getElementById('viewAllSupportersBtn');
const supportersAllModalEl = document.getElementById('supportersAllModal');
const supportersModalBackdropEl = document.getElementById('supportersModalBackdrop');
const closeSupportersModalBtnEl = document.getElementById('closeSupportersModalBtn');
const supportersModalSearchEl = document.getElementById('supportersModalSearch');
const supportersModalListEl = document.getElementById('supportersModalList');
const toastEl = document.getElementById('toast');

    let savedSiteData = deepClone(DEFAULT_SITE_DATA);
    let siteData = deepClone(DEFAULT_SITE_DATA);
    let editorData = deepClone(DEFAULT_SITE_DATA);
    let editorSelectedIndex = -1;
    let teamSelectedIndex = -1;
    let supporterSelectedIndex = -1;
    let editorActiveTab = 'tab-main';
    let editorActiveView = 'home';
    let editorSearchQuery = '';
    let sequenceBuffer = [];
    let editorAccessArmed = false;
    let editorAccessTimer = null;
    const pendingProductUploads = new Map();
    const showToast = publicSite.showToast;
    const renderSite = (nextSiteData = siteData) => publicSite.renderSite(nextSiteData);

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
    if (homeFeaturedCountEl) homeFeaturedCountEl.textContent = String(editorData.products.filter(item => item.featured).length);
    if (homeTeamCountEl) homeTeamCountEl.textContent = String(editorData.team.length);
    if (homeSupportersCountEl) homeSupportersCountEl.textContent = String((editorData.supporters || []).length);
    if (homeSocialCountEl) homeSocialCountEl.textContent = String(countEnabledSocials());
    if (homeUploadsCountEl) homeUploadsCountEl.textContent = String(pendingProductUploads.size);
    if (!homeDraftSummaryEl) return;

    const hasPreviewDiff = hasUnappliedDraftChanges();
    const hasSavedDiff = hasUnsavedDraftChanges();
    const uploadCount = pendingProductUploads.size;
    let toneClass = 'is-clean';
    let badge = 'Без изменений';
    let lead = 'Черновик синхронизирован с текущей версией сайта. Можно закрывать панель или переходить к новым правкам.';

    if (hasPreviewDiff) {
        toneClass = 'is-action';
        badge = 'Нужно применить';
        lead = 'Есть изменения в формах, которые ещё не применены к preview страницы. Нажми «Применить черновик», чтобы увидеть итог на этой вкладке.';
    } else if (hasSavedDiff) {
        toneClass = uploadCount ? 'is-ready' : 'is-warning';
        badge = uploadCount ? 'Готов к публикации' : 'Нужно сохранить';
        lead = uploadCount
            ? 'Черновик уже собран, а выбранные файлы ждут загрузки в GitHub. Теперь можно публиковать изменения для всех.'
            : 'Черновик уже применён к preview, но ещё не сохранён локально или не опубликован для всех.';
    }

    const details = [
        hasPreviewDiff ? 'Preview отстаёт от формы.' : 'Preview синхронизирован с формами.',
        hasSavedDiff ? 'Есть изменения, которые ещё не закреплены сохранением.' : 'Новых несохранённых изменений нет.',
        uploadCount ? `В очереди GitHub upload: ${uploadCount}.` : 'Новых файлов в очереди GitHub upload нет.'
    ];

    homeDraftSummaryEl.innerHTML = `
        <div class="dash-home-status ${toneClass}">
            <div class="dash-home-status-badge">${badge}</div>
            <h3>${lead}</h3>
            <div class="dash-home-status-list">
                ${details.map(item => `<div>${item}</div>`).join('')}
            </div>
        </div>
    `;
}

function syncDraftControls() {
    const hasPreviewDiff = hasUnappliedDraftChanges();
    const hasSavedDiff = hasUnsavedDraftChanges();

    if (draftStateChipEl) {
        if (hasSavedDiff) {
            draftStateChipEl.innerHTML = `<strong>Черновик:</strong> ${hasPreviewDiff ? 'ожидает применения' : 'готов к сохранению'}`;
        } else {
            draftStateChipEl.innerHTML = '<strong>Черновик:</strong> без изменений';
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
    } catch (error) {
        return null;
    }
}

async function initializeData() {
    const localData = loadLocalData();
    savedSiteData = localData || normalizeData(DEFAULT_SITE_DATA);
    siteData = deepClone(savedSiteData);
    editorData = deepClone(savedSiteData);
    renderSite();
    syncDraftControls();
}

function applyEditorDataToPreview() {
    const normalized = normalizeData(editorData);
    siteData = deepClone(normalized);
    renderSite();
    syncDraftControls();
    return normalized;
}

function persistEditorData(normalizedData) {
    const normalized = normalizeData(normalizedData);
    savedSiteData = deepClone(normalized);
    siteData = deepClone(normalized);
    editorData = deepClone(normalized);
    const stored = storageSet(LOCAL_DATA_KEY, JSON.stringify(normalized));
    renderSite();
    syncDraftControls();
    return stored;
}

function resetEditorDraftToSaved() {
    pendingProductUploads.clear();
    siteData = deepClone(savedSiteData);
    editorData = deepClone(savedSiteData);
    editorSelectedIndex = -1;
    teamSelectedIndex = -1;
    supporterSelectedIndex = -1;
    editorActiveTab = 'tab-main';
    editorSearchQuery = '';
    editorSearchEl.value = '';
    closeSupporterEditor(false);
    closeProductEditor(false);
    closeTeamEditor(false);
    fillSocialInputs();
    renderEditorGrid();
    renderTeamGrid();
    renderSupporterGrid();
    renderAdminView();
    renderSite();
    renderProductUploadMeta();
    syncDraftControls();
}
function getPendingProductUpload(productId) {
    return pendingProductUploads.get(String(productId || '')) || null;
}

function renderProductUploadMeta() {
    if (!editorFieldDownloadFileMetaEl) return;

    if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) {
        editorFieldDownloadFileMetaEl.textContent = 'Выбери товар, чтобы привязать файл к его кнопке download.';
        if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = true;
        if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
        return;
    }

    const product = editorData.products[editorSelectedIndex];
    const upload = getPendingProductUpload(product.id);
    if (!upload) {
        editorFieldDownloadFileMetaEl.textContent = 'Файл не выбран. Можно оставить ручную ссылку выше.';
        if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = true;
        if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
        return;
    }

    editorFieldDownloadFileMetaEl.textContent =
        `Подготовлено: ${upload.originalName} (${formatBytes(upload.file.size)}) -> ./${upload.relativePath}`;
    if (clearDownloadFileBtnEl) clearDownloadFileBtnEl.hidden = false;
}

function syncPendingUploadForProduct(previousProduct, nextProduct, currentDownloadValue) {
    const upload = getPendingProductUpload(previousProduct.id);
    if (!upload) return nextProduct;

    const nextRelativePath = buildProductUploadRelativePath(nextProduct, upload.originalName);
    const previousAutoUrl = './' + upload.relativePath;
    const shouldRewriteDownload = currentDownloadValue === previousAutoUrl || previousProduct.downloadUrl === previousAutoUrl;
    const nextUpload = {
        ...upload,
        relativePath: nextRelativePath
    };

    pendingProductUploads.delete(previousProduct.id);
    pendingProductUploads.set(nextProduct.id, nextUpload);

    if (shouldRewriteDownload) {
        nextProduct.downloadUrl = './' + nextRelativePath;
        editorFieldDownloadEl.value = nextProduct.downloadUrl;
    }

    return nextProduct;
}

function clearStagedProductDownloadFile(options = {}) {
    const { preserveUrl = false } = options;
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
        const expectedUrl = './' + upload.relativePath;
        if (editorFieldDownloadEl.value.trim() === expectedUrl) {
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
        showToast('Сначала выбери товар, потом прикрепляй файл.', 'error');
        if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
        return;
    }

    if (!file) {
        clearStagedProductDownloadFile();
        return;
    }

    if (file.size > GITHUB_CONTENTS_MAX_FILE_BYTES) {
        showToast('GitHub Contents API не принимает файлы больше 100 MB.', 'error');
        if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
        return;
    }

    syncSelectedProductFromForm();
    const product = editorData.products[editorSelectedIndex];
    const relativePath = buildProductUploadRelativePath(product, file.name);
    pendingProductUploads.set(product.id, {
        file,
        originalName: file.name,
        relativePath
    });
    editorFieldDownloadEl.value = './' + relativePath;
    syncSelectedProductFromForm();
    renderProductUploadMeta();
    renderEditorGrid();
    syncDraftControls();
    showToast('Файл добавлен в очередь GitHub sync.', 'success');
}

function getProductInitials(name) {
    return String(name || '')
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'PR';
}

function getEditorCardSummary(product) {
    const source = String(product.summary || product.note || '').replace(/\s+/g, ' ').trim();
    if (!source) return 'Нет описания';
    return source.length > 120 ? source.slice(0, 117).trimEnd() + '...' : source;
}

function getEditorEntries(query = editorSearchQuery) {
    const normalizedQuery = String(query || '').trim().toLowerCase();
    return editorData.products
        .map((product, index) => ({ product, index }))
        .sort((a, b) => {
            const bySort = toNumber(a.product.sortOrder, a.index + 1) - toNumber(b.product.sortOrder, b.index + 1);
            if (bySort !== 0) return bySort;
            return a.product.title.localeCompare(b.product.title, 'ru');
        })
        .filter(({ product }) => {
            if (!normalizedQuery) return true;
            return [product.title, product.id, product.tag, product.status, product.summary, product.note]
                .some(value => String(value || '').toLowerCase().includes(normalizedQuery));
        });
}

function renderEditorStageBadge(flag) {
    const meta = getFlagMeta(flag);
    if (!meta) return '<span class="dash-badge">Draft</span>';
    return `<span class="dash-badge ${flag}">${meta.label}</span>`;
}

function clearEditorForm() {
    editorFieldNameEl.value = '';
    editorFieldSlugEl.value = '';
    editorFieldTagEl.value = '';
    editorFieldVersionEl.value = '';
    editorFieldOrderEl.value = '';
    editorFieldStageEl.value = '';
    editorFieldToneEl.value = 'red';
    editorFieldStatusEl.value = '';
    editorFieldDescEl.value = '';
    editorFieldInstructionsEl.value = '';
    editorFieldNoteEl.value = '';
    editorFieldShowcaseEl.checked = false;
    editorFieldShowcaseOrderEl.value = '';
    editorFieldDownloadEl.value = '';
    editorFieldSourceEl.value = '';
    if (editorFieldDownloadFileEl) editorFieldDownloadFileEl.value = '';
    renderProductUploadMeta();
}

function fillSocialInputs() {
    const socials = editorData.socials || normalizeSocials({});
    socialYoutubeEl.value = socials.youtube || '';
    socialDiscordEl.value = socials.discord || '';
    socialTelegramEl.value = socials.telegram || '';
    renderEditorSocialPreview();
}

function syncSocialsFromInputs() {
    editorData.socials = normalizeSocials({
        youtube: socialYoutubeEl.value,
        discord: socialDiscordEl.value,
        telegram: socialTelegramEl.value
    }, DEFAULT_SITE_DATA.socials);
    return editorData.socials;
}

function renderEditorSocialPreview() {
    const socials = syncSocialsFromInputs();
    editorSocialPreviewEl.innerHTML = SOCIAL_META.map(({ key, label }) => {
        const href = socials[key] || '';
        const disabled = !href;
        const attrs = disabled
            ? 'href="#" aria-disabled="true" tabindex="-1"'
            : `href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`;
        return `<a class="social-link square ${disabled ? 'is-disabled' : ''}" data-social="${key}" ${attrs} aria-label="${label}">${renderSocialIcon(key)}</a>`;
    }).join('');
    renderHomeDashboard();
}

function renderAdminView() {
    const copy = ADMIN_VIEW_COPY[editorActiveView] || ADMIN_VIEW_COPY.home;
    editorAdminTitleEl.textContent = copy.title;
    editorAdminSubtitleEl.textContent = copy.subtitle;
    const supportersViewEl = document.getElementById('supportersView');
    productsToolbarEl.hidden = editorActiveView !== 'products';
    homeViewEl.classList.toggle('active', editorActiveView === 'home');
    productsViewEl.classList.toggle('active', editorActiveView === 'products');
    miscViewEl.classList.toggle('active', editorActiveView === 'misc');
    if (supportersViewEl) supportersViewEl.classList.toggle('active', editorActiveView === 'supporters');
    addProductBtnEl.hidden = editorActiveView !== 'products';
    addTeamMemberBtnEl.hidden = editorActiveView !== 'misc';
    if (addSupporterBtnEl) addSupporterBtnEl.hidden = editorActiveView !== 'supporters';
    document.querySelectorAll('[data-admin-view]').forEach(link => {
        link.classList.toggle('active', link.dataset.adminView === editorActiveView);
    });
    renderHomeDashboard();
}

function setAdminView(view) {
    if (!ADMIN_VIEW_COPY[view]) return;
    commitOpenProductForm(editorActiveView === 'products');
    commitOpenTeamForm(editorActiveView === 'misc');
    if (editorActiveView === 'supporters') commitOpenSupporterForm(false);
    syncSocialsFromInputs();
    renderEditorSocialPreview();
    editorActiveView = view;
    renderAdminView();
    if (view === 'supporters') renderSupporterGrid();
}

function getTeamEntries() {
    return editorData.team
        .map((member, index) => ({ member, index }))
        .sort((a, b) => {
            const bySort = toNumber(a.member.sortOrder, a.index + 1) - toNumber(b.member.sortOrder, b.index + 1);
            if (bySort !== 0) return bySort;
            return a.member.name.localeCompare(b.member.name, 'ru');
        });
}

function getTeamCardSummary(member) {
    const source = String(member.description || '').replace(/\s+/g, ' ').trim();
    if (!source) return 'Нет описания';
    return source.length > 100 ? source.slice(0, 97).trimEnd() + '...' : source;
}

function clearTeamForm() {
    teamFieldNameEl.value = '';
    teamFieldRoleEl.value = '';
    teamFieldAvatarEl.value = '';
    teamFieldOrderEl.value = '';
    teamFieldBioEl.value = '';
}

function fillTeamForm(member) {
    teamFieldNameEl.value = member.name;
    teamFieldRoleEl.value = member.role;
    teamFieldAvatarEl.value = member.avatarUrl;
    teamFieldOrderEl.value = member.sortOrder;
    teamFieldBioEl.value = member.description;
}

function renderTeamGrid() {
    teamMemberCountEl.textContent = String(editorData.team.length);
    const entries = getTeamEntries();
    if (!entries.length) {
        teamGridEl.innerHTML = '<div class="dash-empty-state">Пока нет карточек команды. Нажми «Новый участник» и собери блок «Наша команда».</div>';
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
    teamEditorTitleEl.textContent = 'Редактирование — ' + member.name;
    fillTeamForm(member);
    teamEditorEl.hidden = false;
    teamEditorEmptyEl.hidden = true;
    renderTeamGrid();
}

function closeTeamEditor(renderGrid = true) {
    teamSelectedIndex = -1;
    teamEditorEl.hidden = true;
    teamEditorEmptyEl.hidden = false;
    teamEditorTitleEl.textContent = 'Редактирование участника';
    clearTeamForm();
    if (renderGrid) renderTeamGrid();
}

function createEmptyTeamMember() {
    const count = editorData.team.length + 1;
    return normalizeTeamMember({
        id: 'team-member-' + Date.now(),
        name: 'Новый участник',
        role: 'Роль',
        avatarUrl: '',
        description: '',
        sortOrder: count
    }, count - 1);
}

function syncSelectedTeamMemberFromForm() {
    if (teamSelectedIndex < 0 || !editorData.team[teamSelectedIndex]) return false;
    const current = editorData.team[teamSelectedIndex];
    editorData.team[teamSelectedIndex] = normalizeTeamMember({
        ...current,
        name: teamFieldNameEl.value,
        role: teamFieldRoleEl.value,
        avatarUrl: teamFieldAvatarEl.value,
        description: teamFieldBioEl.value,
        sortOrder: toNumber(teamFieldOrderEl.value, current.sortOrder || teamSelectedIndex + 1)
    }, teamSelectedIndex);
    syncDraftControls();
    return true;
}

function commitOpenTeamForm(refreshGrid = true) {
    if (teamEditorEl.hidden) return false;
    if (!syncSelectedTeamMemberFromForm()) return false;
    const member = editorData.team[teamSelectedIndex];
    if (member) {
        teamEditorTitleEl.textContent = 'Редактирование — ' + member.name;
    }
    if (refreshGrid) {
        renderTeamGrid();
    }
    return true;
}

function syncTeamDraftFromInputs(refreshGrid = true) {
    if (!syncSelectedTeamMemberFromForm()) return false;
    const member = editorData.team[teamSelectedIndex];
    if (member) {
        teamEditorTitleEl.textContent = 'Редактирование — ' + member.name;
    }
    if (refreshGrid) {
        renderTeamGrid();
    }
    return true;
}

function selectTeamMember(index) {
    commitOpenTeamForm();
    openTeamEditor(index);
}

function moveTeamMember(index, direction) {
    commitOpenTeamForm(false);
    const ordered = getTeamEntries();
    const position = ordered.findIndex(item => item.index === index);
    const swapItem = ordered[position + direction];
    if (position < 0 || !swapItem) return;

    const reordered = ordered.map(item => item.index);
    [reordered[position], reordered[position + direction]] = [reordered[position + direction], reordered[position]];
    reordered.forEach((memberIndex, order) => {
        editorData.team[memberIndex].sortOrder = order + 1;
    });

    renderTeamGrid();
    if (teamSelectedIndex >= 0) {
        openTeamEditor(teamSelectedIndex);
    }
    syncDraftControls();
}

function addTeamMember() {
    commitOpenTeamForm(false);
    editorData.team.push(createEmptyTeamMember());
    openTeamEditor(editorData.team.length - 1);
    syncDraftControls();
    showToast('Новый участник добавлен.', 'success');
}

function deleteTeamMember() {
    if (teamSelectedIndex < 0 || !editorData.team[teamSelectedIndex]) return;
    if (!confirm('Удалить участника команды?')) return;

    editorData.team.splice(teamSelectedIndex, 1);
    if (!editorData.team.length) {
        closeTeamEditor(false);
        renderTeamGrid();
        syncDraftControls();
        showToast('Участник удалён.', 'success');
        return;
    }

    const nextIndex = Math.min(teamSelectedIndex, editorData.team.length - 1);
    openTeamEditor(nextIndex);
    syncDraftControls();
    showToast('Участник удалён.', 'success');
}

// ─── Supporters CRUD ────────────────────────────────────────────────────────

function getSupporterEntries() {
    return (editorData.supporters || [])
        .map((supporter, index) => ({ supporter, index }))
        .sort((a, b) => {
            const bySort = toNumber(a.supporter.sortOrder, a.index + 1) - toNumber(b.supporter.sortOrder, b.index + 1);
            if (bySort !== 0) return bySort;
            return a.supporter.name.localeCompare(b.supporter.name, 'ru');
        });
}

function clearSupporterForm() {
    if (supporterFieldNameEl) supporterFieldNameEl.value = '';
    if (supporterFieldRoleEl) supporterFieldRoleEl.value = '';
    if (supporterFieldAvatarEl) supporterFieldAvatarEl.value = '';
    if (supporterFieldOrderEl) supporterFieldOrderEl.value = '';
}

function fillSupporterForm(supporter) {
    if (supporterFieldNameEl) supporterFieldNameEl.value = supporter.name;
    if (supporterFieldRoleEl) supporterFieldRoleEl.value = supporter.role;
    if (supporterFieldAvatarEl) supporterFieldAvatarEl.value = supporter.avatarUrl;
    if (supporterFieldOrderEl) supporterFieldOrderEl.value = supporter.sortOrder;
}

function renderSupporterGrid() {
    if (!supporterGridEl) return;
    if (supporterMemberCountEl) supporterMemberCountEl.textContent = String((editorData.supporters || []).length);
    const entries = getSupporterEntries();
    if (!entries.length) {
        supporterGridEl.innerHTML = '<div class="dash-empty-state">Пока нет карточек. Нажми «Новый поддержавший», чтобы добавить.</div>';
        renderHomeDashboard();
        return;
    }

    supporterGridEl.innerHTML = entries.map(({ supporter, index }) => `
        <article class="dash-team-card ${index === supporterSelectedIndex ? 'selected' : ''}" data-select-supporter="${index}" tabindex="0" role="button" aria-pressed="${index === supporterSelectedIndex ? 'true' : 'false'}">
            <div class="dash-team-card-head">
                ${renderTeamAvatar(supporter, 'dash-team-avatar')}
                <div class="dash-team-copy">
                    <h3>${escapeHtml(supporter.name)}</h3>
                    <p class="mono">${escapeHtml(supporter.role)}</p>
                </div>
            </div>
            <div class="dash-team-actions">
                <button type="button" class="dash-btn dash-sm" data-supporter-move-up="${index}">↑</button>
                <button type="button" class="dash-btn dash-sm" data-supporter-move-down="${index}">↓</button>
            </div>
        </article>
    `).join('');
    renderHomeDashboard();
}

function openSupporterEditor(index) {
    if (!editorData.supporters || !editorData.supporters[index]) return;
    supporterSelectedIndex = index;
    const supporter = editorData.supporters[index];
    if (supporterEditorTitleEl) supporterEditorTitleEl.textContent = 'Редактирование — ' + supporter.name;
    fillSupporterForm(supporter);
    if (supporterEditorEl) supporterEditorEl.hidden = false;
    if (supporterEditorEmptyEl) supporterEditorEmptyEl.hidden = true;
    renderSupporterGrid();
}

function closeSupporterEditor(renderGrid = true) {
    supporterSelectedIndex = -1;
    if (supporterEditorEl) supporterEditorEl.hidden = true;
    if (supporterEditorEmptyEl) supporterEditorEmptyEl.hidden = false;
    if (supporterEditorTitleEl) supporterEditorTitleEl.textContent = 'Редактирование';
    clearSupporterForm();
    if (renderGrid) renderSupporterGrid();
}

function syncSelectedSupporterFromForm() {
    if (supporterSelectedIndex < 0 || !editorData.supporters || !editorData.supporters[supporterSelectedIndex]) return false;
    const current = editorData.supporters[supporterSelectedIndex];
    editorData.supporters[supporterSelectedIndex] = normalizeSupporter({
        ...current,
        name: supporterFieldNameEl ? supporterFieldNameEl.value : current.name,
        role: supporterFieldRoleEl ? supporterFieldRoleEl.value : current.role,
        avatarUrl: supporterFieldAvatarEl ? supporterFieldAvatarEl.value : current.avatarUrl,
        sortOrder: toNumber(supporterFieldOrderEl ? supporterFieldOrderEl.value : current.sortOrder, current.sortOrder || supporterSelectedIndex + 1)
    }, supporterSelectedIndex);
    syncDraftControls();
    return true;
}

function commitOpenSupporterForm(refreshGrid = true) {
    if (!supporterEditorEl || supporterEditorEl.hidden) return false;
    if (!syncSelectedSupporterFromForm()) return false;
    const supporter = editorData.supporters[supporterSelectedIndex];
    if (supporter && supporterEditorTitleEl) {
        supporterEditorTitleEl.textContent = 'Редактирование — ' + supporter.name;
    }
    if (refreshGrid) renderSupporterGrid();
    return true;
}

function selectSupporter(index) {
    commitOpenSupporterForm();
    openSupporterEditor(index);
}

function moveSupporterMember(index, direction) {
    commitOpenSupporterForm(false);
    const ordered = getSupporterEntries();
    const position = ordered.findIndex(item => item.index === index);
    const swapItem = ordered[position + direction];
    if (position < 0 || !swapItem) return;

    const reordered = ordered.map(item => item.index);
    [reordered[position], reordered[position + direction]] = [reordered[position + direction], reordered[position]];
    reordered.forEach((sIdx, order) => {
        editorData.supporters[sIdx].sortOrder = order + 1;
    });

    renderSupporterGrid();
    if (supporterSelectedIndex >= 0) {
        openSupporterEditor(supporterSelectedIndex);
    }
    syncDraftControls();
}

function createEmptySupporter() {
    const count = (editorData.supporters || []).length + 1;
    return normalizeSupporter({
        id: 'supporter-' + Date.now(),
        name: 'Новый поддержавший',
        role: 'Поддержавший',
        avatarUrl: '',
        sortOrder: count
    }, count - 1);
}

function addSupporterMember() {
    commitOpenSupporterForm(false);
    if (!editorData.supporters) editorData.supporters = [];
    editorData.supporters.push(createEmptySupporter());
    openSupporterEditor(editorData.supporters.length - 1);
    syncDraftControls();
    showToast('Новый поддержавший добавлен.', 'success');
}

function deleteSupporterMember() {
    if (supporterSelectedIndex < 0 || !editorData.supporters || !editorData.supporters[supporterSelectedIndex]) return;
    if (!confirm('Удалить карточку поддержавшего?')) return;

    editorData.supporters.splice(supporterSelectedIndex, 1);
    if (!editorData.supporters.length) {
        closeSupporterEditor(false);
        renderSupporterGrid();
        syncDraftControls();
        showToast('Карточка удалена.', 'success');
        return;
    }

    const nextIndex = Math.min(supporterSelectedIndex, editorData.supporters.length - 1);
    openSupporterEditor(nextIndex);
    syncDraftControls();
    showToast('Карточка удалена.', 'success');
}

// ─── Supporters Modal ────────────────────────────────────────────────────────

function renderSupportersModal(query = '') {
    if (!supportersModalListEl) return;
    const entries = getSupporterEntries();
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
        ? entries.filter(({ supporter }) =>
            [supporter.name, supporter.role].some(v => String(v || '').toLowerCase().includes(normalized))
          )
        : entries;

    if (!filtered.length) {
        supportersModalListEl.innerHTML = `<div class="dash-empty-state">${normalized ? 'Ничего не найдено.' : 'Список пуст.'}</div>`;
        return;
    }

    supportersModalListEl.innerHTML = filtered.map(({ supporter }) => `
        <div class="dash-modal-item">
            ${renderTeamAvatar(supporter, 'dash-team-avatar')}
            <div class="dash-team-copy">
                <strong>${escapeHtml(supporter.name)}</strong>
                <span class="mono">${escapeHtml(supporter.role)}</span>
            </div>
        </div>
    `).join('');
}

function openSupportersModal() {
    if (!supportersAllModalEl) return;
    supportersAllModalEl.hidden = false;
    if (supportersModalSearchEl) supportersModalSearchEl.value = '';
    renderSupportersModal('');
    if (supportersModalSearchEl) supportersModalSearchEl.focus();
}

function closeSupportersModal() {
    if (!supportersAllModalEl) return;
    supportersAllModalEl.hidden = true;
}

// ─── End Supporters ──────────────────────────────────────────────────────────

function syncEditorTabs() {
    editorPanelEl.querySelectorAll('.dash-tab-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.tab === editorActiveTab);
    });
    editorPanelEl.querySelectorAll('.dash-tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.panel === editorActiveTab);
    });
}

function setEditorTab(tab) {
    if (!['tab-main', 'tab-content', 'tab-publish'].includes(tab)) {
        tab = 'tab-main';
    }
    editorActiveTab = tab;
    syncEditorTabs();
}

function fillEditorForm(product) {
    editorFieldNameEl.value = product.title;
    editorFieldSlugEl.value = product.id;
    editorFieldTagEl.value = product.tag;
    editorFieldVersionEl.value = product.version;
    editorFieldOrderEl.value = product.sortOrder;
    editorFieldStageEl.value = product.flag;
    editorFieldToneEl.value = product.tone;
    editorFieldStatusEl.value = product.status;
    editorFieldDescEl.value = product.summary;
    editorFieldInstructionsEl.value = product.instructions.join('\n');
    editorFieldNoteEl.value = product.note;
    editorFieldShowcaseEl.checked = product.featured;
    editorFieldShowcaseOrderEl.value = product.featuredOrder;
    editorFieldDownloadEl.value = product.downloadUrl;
    editorFieldSourceEl.value = product.sourceUrl;
    renderProductUploadMeta();
    syncEditorTabs();
}

function renderEditorGrid() {
    editorTotalCountEl.textContent = String(editorData.products.length);
    editorShowcaseCountEl.textContent = String(editorData.products.filter(item => item.featured).length);

    const entries = getEditorEntries();
    if (!entries.length) {
        editorProductGridEl.innerHTML = '<div class="dash-empty-state">По вашему запросу ничего не найдено.</div>';
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
    editorTitleEl.textContent = 'Редактирование — ' + product.title;
    fillEditorForm(product);
    editorPanelEl.classList.add('open');
    renderEditorGrid();
}

function closeProductEditor(renderGrid = true) {
    editorSelectedIndex = -1;
    editorPanelEl.classList.remove('open');
    editorTitleEl.textContent = 'Редактирование';
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
    editorAccessTimer = setTimeout(() => {
        disarmEditorAccess();
    }, 12000);
}

function openEditor() {
    disarmEditorAccess();
    editorData = deepClone(siteData);
    editorSelectedIndex = -1;
    teamSelectedIndex = -1;
    supporterSelectedIndex = -1;
    editorActiveTab = 'tab-main';
    editorActiveView = 'home';
    editorSearchQuery = '';
    editorSearchEl.value = '';
    closeSupporterEditor(false);
    closeProductEditor(false);
    closeTeamEditor(false);
    fillSocialInputs();
    renderEditorGrid();
    renderTeamGrid();
    renderSupporterGrid();
    renderAdminView();
    editorOverlayEl.classList.add('open');
    editorOverlayEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('editor-open');
    renderGitHubSyncTarget();
    renderProductUploadMeta();
    syncDraftControls();
}

function closeEditor(options = {}) {
    const { force = false } = options;
    if (!force && hasUnsavedDraftChanges()) {
        const ok = confirm('Есть несохранённые изменения. Закрыть панель и потерять их?');
        if (!ok) return false;
        resetEditorDraftToSaved();
    }
    editorOverlayEl.classList.remove('open');
    editorOverlayEl.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('editor-open');
    return true;
}

function createEmptyProduct() {
    const count = editorData.products.length + 1;
    return normalizeProduct({
        id: 'new-product-' + Date.now(),
        title: 'Новый продукт',
        version: 'x',
        tag: 'product ' + String(count).padStart(2, '0'),
        flag: '',
        status: 'позже',
        featured: false,
        featuredOrder: count,
        sortOrder: count,
        tone: 'red',
        summary: '',
        instructions: [],
        sourceUrl: '',
        downloadUrl: '',
        note: ''
    }, count - 1);
}

function readInstructionLines(value) {
    return String(value || '')
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);
}

function syncSelectedProductFromForm() {
    if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) return false;
    const current = editorData.products[editorSelectedIndex];
    let nextProduct = normalizeProduct({
        ...current,
        title: editorFieldNameEl.value,
        id: editorFieldSlugEl.value,
        tag: editorFieldTagEl.value,
        version: editorFieldVersionEl.value,
        sortOrder: toNumber(editorFieldOrderEl.value, current.sortOrder || editorSelectedIndex + 1),
        flag: editorFieldStageEl.value,
        tone: editorFieldToneEl.value,
        status: editorFieldStatusEl.value,
        summary: editorFieldDescEl.value,
        instructions: readInstructionLines(editorFieldInstructionsEl.value),
        note: editorFieldNoteEl.value,
        featured: editorFieldShowcaseEl.checked,
        featuredOrder: toNumber(editorFieldShowcaseOrderEl.value, current.featuredOrder || editorSelectedIndex + 1),
        downloadUrl: editorFieldDownloadEl.value,
        sourceUrl: editorFieldSourceEl.value
    }, editorSelectedIndex);
    nextProduct = syncPendingUploadForProduct(current, nextProduct, editorFieldDownloadEl.value.trim());
    editorData.products[editorSelectedIndex] = nextProduct;
    renderProductUploadMeta();
    syncDraftControls();
    return true;
}

function commitOpenProductForm(refreshGrid = true) {
    if (!editorPanelEl.classList.contains('open')) return false;
    if (!syncSelectedProductFromForm()) return false;
    const product = editorData.products[editorSelectedIndex];
    if (product) {
        editorTitleEl.textContent = 'Редактирование — ' + product.title;
    }
    if (refreshGrid) {
        renderEditorGrid();
    }
    return true;
}

function commitAllEditorState(refreshGrid = true) {
    commitOpenProductForm(refreshGrid);
    commitOpenTeamForm(refreshGrid);
    commitOpenSupporterForm(refreshGrid);
    syncSocialsFromInputs();
    renderEditorSocialPreview();
    renderProductUploadMeta();
    syncDraftControls();
}

function syncProductDraftFromInputs(refreshGrid = true) {
    if (!syncSelectedProductFromForm()) return false;
    const product = editorData.products[editorSelectedIndex];
    if (product) {
        editorTitleEl.textContent = 'Редактирование — ' + product.title;
    }
    if (refreshGrid) {
        renderEditorGrid();
    }
    return true;
}

function selectProduct(index) {
    commitOpenProductForm();
    openProductEditor(index);
}

function moveProduct(index, direction) {
    commitOpenProductForm(false);
    const ordered = getEditorEntries('');
    const position = ordered.findIndex(item => item.index === index);
    const swapItem = ordered[position + direction];
    if (position < 0 || !swapItem) return;

    const reordered = ordered.map(item => item.index);
    [reordered[position], reordered[position + direction]] = [reordered[position + direction], reordered[position]];
    reordered.forEach((productIndex, order) => {
        editorData.products[productIndex].sortOrder = order + 1;
    });

    renderEditorGrid();
    if (editorSelectedIndex >= 0) {
        openProductEditor(editorSelectedIndex);
    }
    syncDraftControls();
}

function addProduct() {
    commitOpenProductForm(false);
    editorData.products.push(createEmptyProduct());
    openProductEditor(editorData.products.length - 1);
    syncDraftControls();
    showToast('Новый продукт добавлен.', 'success');
}

function deleteProduct() {
    if (editorSelectedIndex < 0 || !editorData.products[editorSelectedIndex]) return;
    if (!confirm('Удалить товар?')) return;

    pendingProductUploads.delete(editorData.products[editorSelectedIndex].id);
    editorData.products.splice(editorSelectedIndex, 1);
    if (!editorData.products.length) {
        editorData.products.push(createEmptyProduct());
    }

    const nextIndex = Math.min(editorSelectedIndex, editorData.products.length - 1);
    openProductEditor(nextIndex);
    syncDraftControls();
    showToast('Товар удалён из редактора.', 'success');
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
    editorSearchEl.value = '';
    closeProductEditor(false);
    closeTeamEditor(false);
    fillSocialInputs();
    renderEditorGrid();
    renderTeamGrid();
    renderAdminView();
    renderProductUploadMeta();
    syncDraftControls();
    showToast('JSON импортирован в редактор.', 'success');
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
    showToast('Черновик применён к странице.', 'success');
}

function handleDiscardDraft() {
    if (!hasUnsavedDraftChanges()) return;
    if (!confirm('Отменить все неприменённые изменения и вернуться к сохранённой версии?')) return;
    resetEditorDraftToSaved();
    showToast('Черновик отменён.', 'info');
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
    showToast(
        stored
            ? (hadUploads
                ? 'Локально сохранено. Файлы в GitHub не загружались, для общей публикации их нужно выбрать заново.'
                : 'Локально сохранено. На этом браузере изменения уже видны.')
            : 'Изменения применены, но localStorage недоступен в этом браузере.',
        stored && !hadUploads ? 'success' : 'info'
    );
}

async function handleSaveGithub() {
    commitAllEditorState();
    try {
        const normalized = applyEditorDataToPreview();
        const savedData = await saveToGitHub(normalized);
        persistEditorData(savedData);
        const githubTokenEl = document.getElementById('githubToken');
        if (githubTokenEl) githubTokenEl.value = '';
        refreshAdminAfterSave();
        showToast('Данные и файлы отправлены в GitHub. После публикации обновится контент сайта.', 'success');
    } catch (error) {
        syncDraftControls();
        showToast(error.message || 'Не удалось сохранить в GitHub.', 'error');
    }
}

    const publisher = createGitHubPublisher({
        getPendingUploads: () => pendingProductUploads,
        clearPendingUploads: () => pendingProductUploads.clear(),
        renderProductUploadMeta,
        syncDraftControls
    });
    const { renderGitHubSyncTarget, saveToGitHub } = publisher;

document.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-editor]')) {
        closeEditor();
    }
});

editorAccessTriggerEl.addEventListener('click', (event) => {
    if (!editorAccessArmed) return;
    event.preventDefault();
    sequenceBuffer = [];
    openEditor();
});

addProductBtnEl.addEventListener('click', () => {
    addProduct();
});

addTeamMemberBtnEl.addEventListener('click', () => {
    addTeamMember();
});

applyDraftBtnEl.addEventListener('click', () => {
    handleApplyDraft();
});

discardDraftBtnEl.addEventListener('click', () => {
    handleDiscardDraft();
});

if (homeApplyDraftBtnEl) {
    homeApplyDraftBtnEl.addEventListener('click', () => {
        handleApplyDraft();
    });
}

if (homeDiscardDraftBtnEl) {
    homeDiscardDraftBtnEl.addEventListener('click', () => {
        handleDiscardDraft();
    });
}

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
    editorFieldSourceEl
].forEach(field => {
    field.addEventListener('input', () => {
        syncProductDraftFromInputs();
    });
    field.addEventListener('change', () => {
        syncProductDraftFromInputs();
    });
});

[
    teamFieldNameEl,
    teamFieldRoleEl,
    teamFieldAvatarEl,
    teamFieldOrderEl,
    teamFieldBioEl
].forEach(field => {
    field.addEventListener('input', () => {
        syncTeamDraftFromInputs();
    });
    field.addEventListener('change', () => {
        syncTeamDraftFromInputs();
    });
});

editorFieldDownloadFileEl.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    stageProductDownloadFile(file || null);
});

clearDownloadFileBtnEl.addEventListener('click', () => {
    clearStagedProductDownloadFile();
    showToast('Файл убран из очереди GitHub sync.', 'info');
});

document.getElementById('exportJsonBtn').addEventListener('click', async () => {
    commitAllEditorState();
    exportEditorJson();
    showToast('JSON выгружен.', 'success');
});

document.getElementById('importJsonBtn').addEventListener('click', () => {
    document.getElementById('importJsonInput').click();
});

document.getElementById('importJsonInput').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
        await importEditorJson(file);
    } catch (error) {
        showToast('Не удалось импортировать JSON.', 'error');
    }
    event.target.value = '';
});

document.querySelectorAll('[data-admin-view]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        setAdminView(link.dataset.adminView);
    });
});

document.querySelectorAll('[data-admin-switch]').forEach(button => {
    button.addEventListener('click', () => {
        setAdminView(button.dataset.adminSwitch);
    });
});

document.querySelectorAll('[data-placeholder-nav]').forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        showToast('Этот раздел появится позже.', 'info');
    });
});

document.getElementById('clearLocalBtn').addEventListener('click', () => {
    const cleared = storageRemove(LOCAL_DATA_KEY);
    showToast(
        cleared
            ? 'Локальный черновик очищен. После обновления страницы подтянется встроенная версия сайта.'
            : 'Не удалось очистить localStorage в этом браузере.',
        cleared ? 'success' : 'error'
    );
});

editorSearchEl.addEventListener('input', (event) => {
    editorSearchQuery = event.target.value;
    renderEditorGrid();
});

[socialYoutubeEl, socialDiscordEl, socialTelegramEl].forEach(field => {
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
    const button = event.target.closest('button');
    if (button?.hasAttribute('data-move-up')) {
        moveProduct(Number(button.getAttribute('data-move-up')), -1);
        return;
    }

    if (button?.hasAttribute('data-move-down')) {
        moveProduct(Number(button.getAttribute('data-move-down')), 1);
        return;
    }

    const card = event.target.closest('[data-select-product]');
    if (card) {
        selectProduct(Number(card.getAttribute('data-select-product')));
    }
});

editorProductGridEl.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const card = target.closest('[data-select-product]');
    if (!card) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectProduct(Number(card.getAttribute('data-select-product')));
});

teamGridEl.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button?.hasAttribute('data-team-move-up')) {
        moveTeamMember(Number(button.getAttribute('data-team-move-up')), -1);
        return;
    }

    if (button?.hasAttribute('data-team-move-down')) {
        moveTeamMember(Number(button.getAttribute('data-team-move-down')), 1);
        return;
    }

    const card = event.target.closest('[data-select-team]');
    if (card) {
        selectTeamMember(Number(card.getAttribute('data-select-team')));
    }
});

teamGridEl.addEventListener('keydown', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const card = target.closest('[data-select-team]');
    if (!card) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectTeamMember(Number(card.getAttribute('data-select-team')));
});

editorPanelEl.addEventListener('click', (event) => {
    const button = event.target.closest('.dash-tab-btn');
    if (!button) return;
    setEditorTab(button.dataset.tab || 'tab-main');
});

closeProductEditorBtnEl.addEventListener('click', () => {
    closeProductEditor();
});

deleteProductBtnEl.addEventListener('click', () => {
    deleteProduct();
});

closeTeamEditorBtnEl.addEventListener('click', () => {
    closeTeamEditor();
});

deleteTeamMemberBtnEl.addEventListener('click', () => {
    deleteTeamMember();
});

document.getElementById('saveLocalBtn').addEventListener('click', () => {
    handleSaveLocal();
});

document.getElementById('saveGithubBtn').addEventListener('click', async () => {
    await handleSaveGithub();
});

// ─── Supporter event listeners ──────────────────────────────────────────────

if (addSupporterBtnEl) {
    addSupporterBtnEl.addEventListener('click', () => addSupporterMember());
}

if (supporterGridEl) {
    supporterGridEl.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button?.hasAttribute('data-supporter-move-up')) {
            moveSupporterMember(Number(button.getAttribute('data-supporter-move-up')), -1);
            return;
        }
        if (button?.hasAttribute('data-supporter-move-down')) {
            moveSupporterMember(Number(button.getAttribute('data-supporter-move-down')), 1);
            return;
        }
        const card = event.target.closest('[data-select-supporter]');
        if (card) selectSupporter(Number(card.getAttribute('data-select-supporter')));
    });

    supporterGridEl.addEventListener('keydown', (event) => {
        const card = event.target.closest('[data-select-supporter]');
        if (!card) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectSupporter(Number(card.getAttribute('data-select-supporter')));
    });
}

if (closeSupporterEditorBtnEl) closeSupporterEditorBtnEl.addEventListener('click', () => closeSupporterEditor());
if (deleteSupporterBtnEl) deleteSupporterBtnEl.addEventListener('click', () => deleteSupporterMember());

[supporterFieldNameEl, supporterFieldRoleEl, supporterFieldAvatarEl, supporterFieldOrderEl]
    .filter(Boolean)
    .forEach(field => {
        field.addEventListener('input', () => {
            if (supporterSelectedIndex < 0) return;
            syncSelectedSupporterFromForm();
            const supporter = editorData.supporters[supporterSelectedIndex];
            if (supporter && supporterEditorTitleEl) {
                supporterEditorTitleEl.textContent = 'Редактирование — ' + supporter.name;
            }
            renderSupporterGrid();
        });
    });

if (viewAllSupportersBtnEl) viewAllSupportersBtnEl.addEventListener('click', () => openSupportersModal());
if (closeSupportersModalBtnEl) closeSupportersModalBtnEl.addEventListener('click', () => closeSupportersModal());
if (supportersModalBackdropEl) supportersModalBackdropEl.addEventListener('click', () => closeSupportersModal());
if (supportersModalSearchEl) {
    supportersModalSearchEl.addEventListener('input', (e) => {
        const target = e.target;
        renderSupportersModal(target instanceof HTMLInputElement ? target.value : '');
    });
}

// ─── End Supporter listeners ─────────────────────────────────────────────────

document.addEventListener('keydown', (event) => {
    if (editorOverlayEl.classList.contains('open')) {
        if (event.key === 'Escape') closeEditor();
        return;
    }

    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    sequenceBuffer.push(event.key);
    if (sequenceBuffer.length > SECRET_SEQUENCE.length) {
        sequenceBuffer.shift();
    }

    const matches = SECRET_SEQUENCE.every((key, index) => sequenceBuffer[index] === key);
    if (matches) {
        sequenceBuffer = [];
        armEditorAccess();
    }
});


    async function initialize() {
        renderGitHubSyncTarget();
        await initializeData();
        closeSupporterEditor(false);
        closeProductEditor(false);
        closeTeamEditor(false);
        fillSocialInputs();
        renderEditorGrid();
        renderTeamGrid();
        renderSupporterGrid();
        renderAdminView();
        renderProductUploadMeta();
        syncDraftControls();
    }

    return {
        initialize
    };
}
