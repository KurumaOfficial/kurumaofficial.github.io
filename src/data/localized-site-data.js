import { deepClone, normalizeData } from '../core/data-utils.js';
import { DEFAULT_SITE_DATA } from './site-data.js';
import { SITE_DATA_LOCALE_OVERRIDES } from './site-data-locales.js';

/**
 * @fileoverview Locale-specific site data adapter.
 * Locale overlays are applied only when the current stored values still match
 * the bundled Russian defaults. This keeps admin edits authoritative while
 * allowing the shipped default content to render correctly in each locale.
 * @module data/localized-site-data
 */

const DEFAULT_SITE_DATA_BASELINE = normalizeData(DEFAULT_SITE_DATA);

function toMapById(items) {
    const map = new Map();
    (Array.isArray(items) ? items : []).forEach((item) => {
        const id = String(item?.id || '').trim();
        if (id) map.set(id, item);
    });
    return map;
}

function matchesBaseline(currentValue, baselineValue) {
    return String(currentValue ?? '') === String(baselineValue ?? '');
}

function applyScalarOverride(target, baseline, override, key) {
    if (override == null || !target || !baseline) return;
    if (matchesBaseline(target[key], baseline[key])) {
        target[key] = override;
    }
}

function applyArrayOverride(target, baseline, override, key) {
    if (!Array.isArray(override) || !Array.isArray(target?.[key])) return;

    const baselineItems = Array.isArray(baseline?.[key]) ? baseline[key] : [];
    target[key] = target[key].map((value, index) => (
        matchesBaseline(value, baselineItems[index]) && typeof override[index] === 'string'
            ? override[index]
            : value
    ));
}

function applyRouteModulesOverride(target, baseline, override) {
    if (!target?.routeModules || !baseline?.routeModules || !override) return;

    Object.entries(override).forEach(([key, localizedNames]) => {
        const currentItems = Array.isArray(target.routeModules[key]) ? target.routeModules[key] : null;
        const baselineItems = Array.isArray(baseline.routeModules[key]) ? baseline.routeModules[key] : [];
        if (!currentItems || !Array.isArray(localizedNames)) return;

        target.routeModules[key] = currentItems.map((item, index) => {
            if (!item || typeof item !== 'object') return item;
            const localizedName = localizedNames[index];
            const baselineItem = baselineItems[index];
            if (typeof localizedName !== 'string' || !matchesBaseline(item.name, baselineItem?.name)) {
                return item;
            }
            return { ...item, name: localizedName };
        });
    });
}

function applyProductOverrides(siteData, localeOverrides) {
    const products = Array.isArray(siteData?.products) ? siteData.products : [];
    const productOverrides = localeOverrides?.products || {};
    const baselineProducts = toMapById(DEFAULT_SITE_DATA_BASELINE.products);

    products.forEach((product) => {
        const id = String(product?.id || '').trim();
        const override = productOverrides[id];
        const baseline = baselineProducts.get(id);
        if (!override || !baseline) return;

        applyScalarOverride(product, baseline, override.title, 'title');
        applyScalarOverride(product, baseline, override.tag, 'tag');
        applyScalarOverride(product, baseline, override.status, 'status');
        applyScalarOverride(product, baseline, override.summary, 'summary');
        applyScalarOverride(product, baseline, override.note, 'note');
        applyArrayOverride(product, baseline, override.instructions, 'instructions');
        applyRouteModulesOverride(product, baseline, override.routeModules);
    });
}

function applyTeamOverrides(siteData, localeOverrides) {
    const members = Array.isArray(siteData?.team) ? siteData.team : [];
    const teamOverrides = localeOverrides?.team || {};
    const baselineMembers = toMapById(DEFAULT_SITE_DATA_BASELINE.team);

    members.forEach((member) => {
        const id = String(member?.id || '').trim();
        const override = teamOverrides[id];
        const baseline = baselineMembers.get(id);
        if (!override || !baseline) return;

        applyScalarOverride(member, baseline, override.role, 'role');
        applyScalarOverride(member, baseline, override.description, 'description');
    });
}

function applySupportOverrides(siteData, localeOverrides) {
    const supportPage = siteData?.supportPage;
    const baselineSupportPage = DEFAULT_SITE_DATA_BASELINE.supportPage;
    const supportOverrides = localeOverrides?.supportPage;
    if (!supportPage || !baselineSupportPage || !supportOverrides) return;

    applyScalarOverride(supportPage, baselineSupportPage, supportOverrides.roleName, 'roleName');

    const buttonOverrides = supportOverrides.buttons || {};
    const baselineButtons = toMapById(baselineSupportPage.buttons);
    (Array.isArray(supportPage.buttons) ? supportPage.buttons : []).forEach((button) => {
        const id = String(button?.id || '').trim();
        const override = buttonOverrides[id];
        const baseline = baselineButtons.get(id);
        if (!override || !baseline) return;

        applyScalarOverride(button, baseline, override.label, 'label');
        applyScalarOverride(button, baseline, override.title, 'title');
        applyScalarOverride(button, baseline, override.note, 'note');
    });
}

/**
 * Returns a deep clone of site data with locale-specific overlays for the
 * bundled default content only.
 * @param {import('../core/data-utils.js').SiteData} siteData
 * @param {string} locale
 * @returns {import('../core/data-utils.js').SiteData}
 */
export function localizeSiteData(siteData, locale) {
    const localized = deepClone(siteData);
    const localeOverrides = SITE_DATA_LOCALE_OVERRIDES[locale];

    if (!localeOverrides) {
        return localized;
    }

    applyProductOverrides(localized, localeOverrides);
    applyTeamOverrides(localized, localeOverrides);
    applySupportOverrides(localized, localeOverrides);

    return localized;
}
