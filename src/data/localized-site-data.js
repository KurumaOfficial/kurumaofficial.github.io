import { deepClone } from '../core/data-utils.js';

export function localizeSiteData(siteData, _locale) {
    return deepClone(siteData ?? {});
}
