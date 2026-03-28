/**
 * @fileoverview Pure data helpers — normalisation, cloning, formatting.
 * No DOM, no side-effects.
 * @module core/data-utils
 */

import { FLAG_META } from './constants.js';

// ── Primitives ──────────────────────────────────────────────

/**
 * Deep-clone a JSON-safe value.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

/**
 * Convert to number or return fallback.
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
export function toNumber(value, fallback) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

/**
 * Trim a string or return fallback.
 * @param {unknown} value
 * @param {string} fallback
 * @returns {string}
 */
export function cleanText(value, fallback) {
    const text = String(value ?? '').trim();
    return text || fallback;
}

/**
 * Generate a URL-safe slug.
 * @param {string} value
 * @returns {string}
 */
export function slugify(value) {
    return (
        String(value || '')
            .toLowerCase()
            .replace(/[^a-z0-9а-яёії]+/gi, '-')
            .replace(/^-+|-+$/g, '') ||
        'item-' + Math.random().toString(36).slice(2, 8)
    );
}

/**
 * Format byte count for human display.
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
    const v = Number(bytes) || 0;
    if (v < 1024) return `${v} B`;
    if (v < 1024 * 1024) return `${(v / 1024).toFixed(1)} KB`;
    return `${(v / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Data normalisation ──────────────────────────────────────

/** Valid release stage keys. */
const VALID_FLAGS = /** @type {const} */ (['alpha', 'beta', 'release']);
export const ROUTE_MODULE_KEYS = /** @type {const} */ (['player', 'world', 'utils', 'other', 'interface', 'themes']);

/**
 * @typedef {{ name: string; enabled: boolean }} RouteModuleItem
 */

/**
 * @typedef {{
 *   player: RouteModuleItem[];
 *   world: RouteModuleItem[];
 *   utils: RouteModuleItem[];
 *   other: RouteModuleItem[];
 *   interface: RouteModuleItem[];
 *   themes: RouteModuleItem[];
 * }} RouteModules
 */

/**
 * @param {unknown} raw
 * @param {string} [fallback]
 * @returns {RouteModuleItem}
 */
function normalizeRouteModuleItem(raw, fallback = 'Новая функция') {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    return {
        name: cleanText(src.name, fallback),
        enabled: Boolean(src.enabled ?? src.on),
    };
}

/**
 * @param {unknown} raw
 * @returns {RouteModules}
 */
export function normalizeRouteModules(raw) {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    /** @type {RouteModules} */
    const result = {
        player: [],
        world: [],
        utils: [],
        other: [],
        interface: [],
        themes: [],
    };

    ROUTE_MODULE_KEYS.forEach((key) => {
        const items = Array.isArray(src[key]) ? src[key] : [];
        result[key] = items.map((item, index) => normalizeRouteModuleItem(item, `Функция ${index + 1}`));
    });

    return result;
}

/**
 * @typedef {Object} Product
 * @property {string}   id
 * @property {string}   title
 * @property {string}   version
 * @property {string}   tag
 * @property {string}   flag
 * @property {string}   status
 * @property {boolean}  featured
 * @property {number}   featuredOrder
 * @property {number}   sortOrder
 * @property {string}   tone
 * @property {string}   summary
 * @property {string[]} instructions
 * @property {string}   sourceUrl
 * @property {string}   downloadUrl
 * @property {string}   [detailUrl]
 * @property {string}   note
 * @property {boolean}  [autoRouteRedirect]
 * @property {RouteModules} [routeModules]
 */

/**
 * Normalise a single product record.
 * @param {Record<string, unknown>} raw
 * @param {number} index
 * @returns {Product}
 */
export function normalizeProduct(raw = {}, index = 0) {
    const title = cleanText(raw.title, 'Новый продукт');
    const id = cleanText(raw.id, '') ? slugify(/** @type {string} */ (raw.id)) : slugify(title);

    /** @type {string[]} */
    let instructions;
    if (Array.isArray(raw.instructions)) {
        instructions = raw.instructions.map((v) => cleanText(v, '')).filter(Boolean);
    } else {
        instructions = String(raw.instructions || '')
            .split('\n')
            .map((v) => v.trim())
            .filter(Boolean);
    }

    return {
        id,
        title,
        version: cleanText(raw.version, 'x'),
        tag: cleanText(raw.tag, `product ${String(index + 1).padStart(2, '0')}`),
        flag: VALID_FLAGS.includes(/** @type {any} */ (raw.flag)) ? /** @type {string} */ (raw.flag) : '',
        status: cleanText(raw.status, 'позже'),
        featured: Boolean(raw.featured),
        featuredOrder: toNumber(raw.featuredOrder, index + 1),
        sortOrder: toNumber(raw.sortOrder, index + 1),
        tone: raw.tone === 'green' ? 'green' : 'red',
        summary: cleanText(raw.summary, ''),
        instructions,
        sourceUrl: cleanText(raw.sourceUrl, ''),
        downloadUrl: cleanText(raw.downloadUrl, ''),
        detailUrl: cleanText(raw.detailUrl, ''),
        note: cleanText(raw.note, ''),
        autoRouteRedirect: Boolean(raw.autoRouteRedirect),
        routeModules: normalizeRouteModules(raw.routeModules),
    };
}

/**
 * @typedef {Object} TeamMember
 * @property {string} id
 * @property {string} name
 * @property {string} role
 * @property {string} avatarUrl
 * @property {string} description
 * @property {number} sortOrder
 */

/**
 * Normalise a single team member record.
 * @param {Record<string, unknown>} raw
 * @param {number} index
 * @returns {TeamMember}
 */
export function normalizeTeamMember(raw = {}, index = 0) {
    const name = cleanText(raw.name, `Участник ${String(index + 1).padStart(2, '0')}`);
    return {
        id: slugify(cleanText(raw.id, name)),
        name,
        role: cleanText(raw.role, 'Роль'),
        avatarUrl: cleanText(raw.avatarUrl, ''),
        description: cleanText(raw.description, ''),
        sortOrder: toNumber(raw.sortOrder, index + 1),
    };
}

/**
 * @typedef {Object} SocialsData
 * @property {string} youtube
 * @property {string} discord
 * @property {string} telegram
 */

/** @param {unknown} raw @returns {SocialsData} */
function normalizeSocials(raw) {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    return {
        youtube: String(src.youtube || '').trim(),
        discord: String(src.discord || '').trim(),
        telegram: String(src.telegram || '').trim(),
    };
}

/**
 * @typedef {Object} SupportButton
 * @property {string} id
 * @property {string} label
 * @property {string} title
 * @property {string} note
 * @property {string} url
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} Supporter
 * @property {string} id
 * @property {string} name
 * @property {number} amountUsd
 * @property {string} avatarUrl
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} SupportPage
 * @property {number} minimumAmountUsd
 * @property {SupportButton[]} buttons
 * @property {Supporter[]} supporters
 */

/**
 * @param {unknown} raw
 * @param {number} index
 * @returns {SupportButton}
 */
function normalizeSupportButton(raw, index = 0) {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    const title = cleanText(src.title, `Support ${index + 1}`);
    return {
        id: cleanText(src.id, '') ? slugify(/** @type {string} */ (src.id)) : slugify(title),
        label: cleanText(src.label, 'Поддержать'),
        title,
        note: cleanText(src.note, ''),
        url: cleanText(src.url, ''),
        sortOrder: toNumber(src.sortOrder, index + 1),
    };
}

/**
 * @param {unknown} raw
 * @param {number} index
 * @returns {Supporter}
 */
function normalizeSupporter(raw, index = 0) {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    const name = cleanText(src.name, `Supporter ${index + 1}`);
    return {
        id: cleanText(src.id, '') ? slugify(/** @type {string} */ (src.id)) : slugify(name),
        name,
        amountUsd: toNumber(src.amountUsd, 0),
        avatarUrl: cleanText(src.avatarUrl, ''),
        sortOrder: toNumber(src.sortOrder, index + 1),
    };
}

/**
 * @param {unknown} raw
 * @returns {SupportPage}
 */
function normalizeSupportPage(raw) {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    const rawButtons = Array.isArray(src.buttons) ? src.buttons : [];
    const rawSupporters = Array.isArray(src.supporters) ? src.supporters : [];

    return {
        minimumAmountUsd: Math.max(0, toNumber(src.minimumAmountUsd, 2)),
        buttons: rawButtons.map((button, index) => normalizeSupportButton(button, index)),
        supporters: rawSupporters.map((supporter, index) => normalizeSupporter(supporter, index)),
    };
}

/**
 * @typedef {Object} SiteData
 * @property {Product[]}    products
 * @property {TeamMember[]} team
 * @property {SupportPage}  supportPage
 * @property {SocialsData}  socials
 */

/**
 * Normalise an entire site-data payload.
 * Guarantees every field has a sensible default.
 * @param {Record<string, unknown>} data
 * @returns {SiteData}
 */
export function normalizeData(data = {}) {
    const rawProducts = Array.isArray(data.products) && data.products.length ? data.products : [];
    const rawTeam = Array.isArray(data.team) ? data.team : [];

    return {
        products: rawProducts.map((p, i) => normalizeProduct(p, i)),
        team: rawTeam.map((m, i) => normalizeTeamMember(m, i)),
        supportPage: normalizeSupportPage(data.supportPage),
        socials: normalizeSocials(data.socials),
    };
}

/**
 * Get badge metadata for a release flag.
 * @param {string} flag
 * @returns {{ label: string; className: string } | null}
 */
export function getFlagMeta(flag) {
    return FLAG_META[/** @type {keyof typeof FLAG_META} */ (flag)] ?? null;
}
