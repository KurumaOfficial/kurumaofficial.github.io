import { DEFAULT_SITE_DATA } from '../data/site-data.js';
import { FLAG_META, SITE_DATA_MODULE_PATH } from './constants.js';

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function storageGet(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function storageSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch (error) {
        return false;
    }
}

function storageRemove(key) {
    try {
        window.localStorage.removeItem(key);
        return true;
    } catch (error) {
        return false;
    }
}

function serializeData(value) {
    return JSON.stringify(normalizeData(value));
}

function getSiteDirectory(path) {
    const normalized = String(path || SITE_DATA_MODULE_PATH).replace(/\\/g, '/');
    const index = normalized.lastIndexOf('/');
    return index >= 0 ? normalized.slice(0, index + 1) : '';
}

function buildRepoAssetPath(config, relativePath) {
    return (getSiteDirectory(config.path) + String(relativePath || '').replace(/^\/+/, '')).replace(/\/{2,}/g, '/');
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

function formatBytes(bytes) {
    const value = Number(bytes) || 0;
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeProduct(product, index) {
    const title = (product && typeof product.title === 'string' && product.title.trim()) ? product.title.trim() : 'Новый продукт';
    const id = (product && typeof product.id === 'string' && product.id.trim())
        ? slugify(product.id)
        : slugify(title || ('product-' + (index + 1)));
    return {
        id,
        title,
        version: cleanText(product?.version || 'x', 'x'),
        tag: cleanText(product?.tag || ('product ' + String(index + 1).padStart(2, '0')), 'product'),
        flag: ['alpha', 'beta', 'release'].includes(product?.flag) ? product.flag : '',
        status: cleanText(product?.status || 'позже', 'позже'),
        featured: Boolean(product?.featured),
        featuredOrder: toNumber(product?.featuredOrder, index + 1),
        sortOrder: toNumber(product?.sortOrder, index + 1),
        tone: product?.tone === 'green' ? 'green' : 'red',
        summary: cleanText(product?.summary || '', ''),
        instructions: Array.isArray(product?.instructions)
            ? product.instructions.map(item => cleanText(item, '')).filter(Boolean)
            : String(product?.instructions || '').split('\n').map(item => cleanText(item, '')).filter(Boolean),
        sourceUrl: cleanText(product?.sourceUrl || '', ''),
        downloadUrl: cleanText(product?.downloadUrl || '', ''),
        note: cleanText(product?.note || '', '')
    };
}

function normalizeTeamMember(member, index) {
    const name = cleanText(member?.name || '', 'Участник ' + String(index + 1).padStart(2, '0'));
    return {
        id: slugify(cleanText(member?.id || '', name || ('team-' + (index + 1)))),
        name,
        role: cleanText(member?.role || '', 'Роль'),
        avatarUrl: cleanText(member?.avatarUrl || '', ''),
        description: cleanText(member?.description || '', 'Добавь описание участника через раздел «Прочее».'),
        sortOrder: toNumber(member?.sortOrder, index + 1)
    };
}

function cleanUrl(value) {
    const text = String(value ?? '').trim();
    if (!text) return '';
    if (/^(https?:)?\/\//i.test(text)) return text;
    return 'https://' + text.replace(/^\/+/, '');
}

function normalizeSocials(socials, fallback = DEFAULT_SITE_DATA.socials) {
    return {
        youtube: cleanUrl(socials?.youtube || fallback?.youtube || ''),
        discord: cleanUrl(socials?.discord || fallback?.discord || ''),
        telegram: cleanUrl(socials?.telegram || fallback?.telegram || '')
    };
}

function normalizeData(data) {
    const fallback = deepClone(DEFAULT_SITE_DATA);
    const rawProducts = Array.isArray(data?.products) && data.products.length ? data.products : fallback.products;
    const rawTeam = Array.isArray(data?.team) ? data.team : fallback.team;
    return {
        products: rawProducts.map((item, index) => normalizeProduct(item, index)),
        team: rawTeam.map((item, index) => normalizeTeamMember(item, index)),
        socials: normalizeSocials(data?.socials, fallback.socials)
    };
}

function toNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function cleanText(value, fallback) {
    const text = String(value ?? '').trim();
    return text || fallback;
}

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, '-')
        .replace(/^-+|-+$/g, '') || ('product-' + Math.random().toString(36).slice(2, 8));
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function linkify(text) {
    return escapeHtml(text).replace(/(https?:\/\/[^\s<]+)/g, '<a class="inline-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function getFlagMeta(flag) {
    return FLAG_META[flag] || null;
}

function renderFlagBadge(flag, extraClass = '') {
    const meta = getFlagMeta(flag);
    if (!meta) return '';
    const classes = ['product-flag', meta.className];
    if (extraClass) classes.push(extraClass);
    return `<span class="${classes.join(' ')}">${meta.label}</span>`;
}

function renderSocialIcon(kind) {
    if (kind === 'youtube') {
        return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/></svg>';
    }
    if (kind === 'discord') {
        return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/></svg>';
    }
    return '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.287 5.906q-1.168.486-4.666 2.01-.567.225-.595.442c-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294q.39.01.868-.32 3.269-2.206 3.374-2.23c.05-.012.12-.026.166.016s.042.12.037.141c-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8 8 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629q.14.092.27.187c.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.4 1.4 0 0 0-.013-.315.34.34 0 0 0-.114-.217.53.53 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09"/></svg>';
}

function getTeamInitials(name) {
    return String(name || '')
        .split(/\s+/)
        .filter(Boolean)
        .map(part => part[0])
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


export {
    deepClone,
    storageGet,
    storageSet,
    storageRemove,
    serializeData,
    getSiteDirectory,
    buildRepoAssetPath,
    sanitizeFileSegment,
    buildProductUploadRelativePath,
    formatBytes,
    normalizeProduct,
    normalizeTeamMember,
    cleanUrl,
    normalizeSocials,
    normalizeData,
    toNumber,
    cleanText,
    slugify,
    escapeHtml,
    linkify,
    getFlagMeta,
    renderFlagBadge,
    renderSocialIcon,
    getTeamInitials,
    renderTeamAvatar
};
