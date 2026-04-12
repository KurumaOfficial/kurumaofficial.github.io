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
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(value);
        } catch {
            /* fall through to JSON-safe clone */
        }
    }

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
 * @param {string} [fallback='item']
 * @returns {string}
 */
export function slugify(value, fallback = 'item') {
    const primary = String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9а-яґєёії]+/gi, '-')
        .replace(/^-+|-+$/g, '');

    if (primary) return primary;

    const secondary = String(fallback || 'item')
        .toLowerCase()
        .replace(/[^a-z0-9а-яґєёії]+/gi, '-')
        .replace(/^-+|-+$/g, '');

    return secondary || 'item';
}

/**
 * Ensure identifiers stay unique inside a single normalized collection.
 * @param {string} value
 * @param {Set<string>} usedIds
 * @param {string} [fallback='item']
 * @returns {string}
 */
export function makeUniqueId(value, usedIds, fallback = 'item') {
    const baseId = slugify(value, fallback);
    let nextId = baseId;
    let suffix = 2;

    while (usedIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
    }

    usedIds.add(nextId);
    return nextId;
}

/**
 * Ensure identifiers stay unique inside a single normalized collection.
 * @template {{ id: string }} T
 * @param {T[]} items
 * @returns {T[]}
 */
function ensureUniqueIds(items) {
    const usedIds = new Set();

    return items.map((item) => {
        const nextId = makeUniqueId(item.id, usedIds, 'item');
        return nextId === item.id ? item : { ...item, id: nextId };
    });
}

/**
 * Keep at most one product marked for automatic route redirect.
 * @param {Product[]} products
 * @returns {Product[]}
 */
function ensureSingleAutoRouteRedirect(products) {
    let hasRedirectProduct = false;

    return products.map((product) => {
        if (!product.autoRouteRedirect) return product;
        if (!hasRedirectProduct) {
            hasRedirectProduct = true;
            return product;
        }
        return { ...product, autoRouteRedirect: false };
    });
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
function normalizeRouteModuleItem(raw, fallback = 'New function') {
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
        result[key] = items.map((item, index) => normalizeRouteModuleItem(item, `Function ${index + 1}`));
    });

    return result;
}

/**
 * @typedef {{
 *   id: string;
 *   label: string;
 *   title: string;
 *   note: string;
 *   url: string;
 *   sortOrder: number;
 * }} SupportButton
 */

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   avatarUrl: string;
 *   amountUsd: number;
 *   sortOrder: number;
 * }} Supporter
 */

/**
 * @typedef {{
 *   minimumAmountUsd: number;
 *   roleName: string;
 *   buttons: SupportButton[];
 *   supporters: Supporter[];
 * }} SupportPage
 */

/**
 * @param {unknown} value
 * @returns {number}
 */
function clampCurrency(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.round(num * 100) / 100);
}

/**
 * @param {Record<string, unknown>} raw
 * @param {number} index
 * @returns {SupportButton}
 */
export function normalizeSupportButton(raw = {}, index = 0) {
    const title = cleanText(raw.title, `Method ${index + 1}`);
    return {
        id: slugify(raw.id, title),
        label: cleanText(raw.label, 'Support'),
        title,
        note: cleanText(raw.note, ''),
        url: cleanText(raw.url, ''),
        sortOrder: toNumber(raw.sortOrder, index + 1),
    };
}

/**
 * @param {Record<string, unknown>} raw
 * @param {number} index
 * @returns {Supporter}
 */
export function normalizeSupporter(raw = {}, index = 0) {
    const name = cleanText(raw.name, `Supporter ${String(index + 1).padStart(2, '0')}`);
    const legacyAmount = raw.amountUsd ?? raw.amount ?? raw.value ?? 2;
    return {
        id: slugify(raw.id, name),
        name,
        avatarUrl: cleanText(raw.avatarUrl || raw.avatar, ''),
        amountUsd: clampCurrency(legacyAmount),
        sortOrder: toNumber(raw.sortOrder, index + 1),
    };
}

/**
 * @param {unknown} raw
 * @returns {SupportPage}
 */
export function normalizeSupportPage(raw) {
    const src = /** @type {Record<string, unknown>} */ (raw || {});
    const buttons = Array.isArray(src.buttons)
        ? src.buttons
        : (Array.isArray(src.methods) ? src.methods : []);
    const supporters = Array.isArray(src.supporters)
        ? src.supporters
        : (Array.isArray(src.donors) ? src.donors : []);

    return {
        minimumAmountUsd: Math.max(0, toNumber(src.minimumAmountUsd ?? src.minimumUsd, 2)),
        roleName: cleanText(src.roleName ?? src.role ?? src.premiumRole, '@Premium'),
        buttons: ensureUniqueIds(buttons.map((item, index) => normalizeSupportButton(/** @type {Record<string, unknown>} */ (item), index))),
        supporters: ensureUniqueIds(supporters.map((item, index) => normalizeSupporter(/** @type {Record<string, unknown>} */ (item), index))),
    };
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
    const title = cleanText(raw.title, 'New product');
    const id = slugify(raw.id, title);

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
        status: cleanText(raw.status, 'later'),
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
    const name = cleanText(raw.name, `Member ${String(index + 1).padStart(2, '0')}`);
    return {
        id: slugify(raw.id, name),
        name,
        role: cleanText(raw.role, 'Role'),
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
    const rawSupportPage = data.supportPage || {
        minimumAmountUsd: data.minimumAmountUsd,
        buttons: data.supportButtons || data.paymentButtons,
        supporters: data.supporters,
    };

    const normalizedProducts = ensureSingleAutoRouteRedirect(
        ensureUniqueIds(rawProducts.map((p, i) => normalizeProduct(p, i))),
    );
    const normalizedTeam = ensureUniqueIds(rawTeam.map((m, i) => normalizeTeamMember(m, i)));

    return {
        products: normalizedProducts,
        team: normalizedTeam,
        supportPage: normalizeSupportPage(rawSupportPage),
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
