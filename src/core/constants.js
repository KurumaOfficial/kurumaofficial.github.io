/**
 * @fileoverview Application constants and configuration.
 * Single source of truth for all magic values.
 * @module core/constants
 */

/** GitHub repository configuration for data sync. */
export const GITHUB_CONFIG = Object.freeze({
    owner: 'KurumaOfficial',
    repo: 'kurumaofficial.github.io',
    branch: 'dev/v2',
    dataPath: 'src/data/site-data.js',
});

/** Site data file markers for programmatic edits. */
export const DATA_MARKERS = Object.freeze({
    start: '/*__ALEPH_SITE_DATA_START__*/',
    end: '/*__ALEPH_SITE_DATA_END__*/',
    pattern: /[ \t]*\/\*__ALEPH_SITE_DATA_START__\*\/[\s\S]*?[ \t]*\/\*__ALEPH_SITE_DATA_END__\*\//,
});

/** LocalStorage key for persisting site data locally. */
export const LOCAL_DATA_KEY = 'ALEPH_SITE_DATA_LOCAL';

/** Secret key sequence to unlock the admin panel. */
export const SECRET_SEQUENCE = Object.freeze([
    'ArrowRight', 'ArrowRight', 'ArrowLeft',
    'ArrowRight', 'ArrowLeft', 'ArrowRight', 'ArrowRight',
]);

/** Release stage metadata for badge rendering. */
export const FLAG_META = Object.freeze({
    alpha:   { label: 'Alpha',   className: 'is-alpha' },
    beta:    { label: 'Beta',    className: 'is-beta' },
    release: { label: 'Release', className: 'is-release' },
});

/** Social platform definitions. */
export const SOCIAL_PLATFORMS = Object.freeze([
    { key: 'youtube',  label: 'YouTube' },
    { key: 'discord',  label: 'Discord' },
    { key: 'telegram', label: 'Telegram' },
]);
