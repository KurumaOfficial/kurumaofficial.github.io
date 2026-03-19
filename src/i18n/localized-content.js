import { deepClone, normalizeData } from '../core/site-utils.js';

// Public locale routes only translate static shell copy.
// Admin-managed content stays in its original language so dynamic edits are never silently rewritten.
export function localizeSiteData(data) {
    return deepClone(normalizeData(data));
}
