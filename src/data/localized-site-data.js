import { deepClone } from '../core/data-utils.js';

/**
 * @fileoverview Locale-specific site data adapter.
 * Per project rule: admin-managed content (products, team, support) must NOT
 * be overridden by locale — all such fields are locale-agnostic by design.
 * This function is intentionally a pure passthrough clone.
 * @module data/localized-site-data
 */

/**
 * Returns a deep clone of site data without any locale-based content overrides.
 * @param {import('../core/data-utils.js').SiteData} siteData
 * @param {string} _locale - unused, kept for call-site compatibility
 * @returns {import('../core/data-utils.js').SiteData}
 */
export function localizeSiteData(siteData, _locale) {
    return deepClone(siteData);
}
