/**
 * @fileoverview Safe DOM utilities — no innerHTML with user data.
 * Every function that touches HTML sanitizes or escapes input.
 * @module core/dom
 */

// ── Text / HTML safety ──────────────────────────────────────

const ESC_MAP = Object.freeze({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
});

const ABSOLUTE_WEB_URL_RE = /^(?:https?:)?\/\//i;
const GENERIC_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;
const URL_PATTERN = /https?:\/\/[^\s<]+/gi;
const WRAPPING_PUNCTUATION = Object.freeze({
    ')': '(',
    ']': '[',
    '}': '{',
});

function splitTrailingUrlPunctuation(value) {
    let text = String(value || '');
    let trailing = '';

    while (text) {
        const lastChar = text[text.length - 1];

        if (/[.,!?;:]/.test(lastChar)) {
            trailing = lastChar + trailing;
            text = text.slice(0, -1);
            continue;
        }

        const openChar = WRAPPING_PUNCTUATION[lastChar];
        if (!openChar) break;

        const escapedOpenChar = openChar.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
        const escapedLastChar = lastChar.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
        const openCount = (text.match(new RegExp(escapedOpenChar, 'g')) || []).length;
        const closeCount = (text.match(new RegExp(escapedLastChar, 'g')) || []).length;
        if (closeCount <= openCount) break;

        trailing = lastChar + trailing;
        text = text.slice(0, -1);
    }

    return { text, trailing };
}

/**
 * Escape a string for safe insertion into HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ESC_MAP[ch]);
}

/**
 * Escape text and convert bare URLs into anchor elements.
 * @param {string} text
 * @returns {string} HTML with clickable links.
 */
export function linkify(text) {
    const source = String(text ?? '');
    let html = '';
    let lastIndex = 0;

    URL_PATTERN.lastIndex = 0;
    let match = URL_PATTERN.exec(source);
    while (match) {
        const rawUrl = match[0] || '';
        const startIndex = match.index;
        const endIndex = startIndex + rawUrl.length;
        const { text: cleanUrlText, trailing } = splitTrailingUrlPunctuation(rawUrl);
        const href = sanitizeHref(cleanUrlText);

        html += escapeHtml(source.slice(lastIndex, startIndex));

        if (href) {
            const escapedHref = escapeHtml(href);
            html += `<a class="inline-link" href="${escapedHref}" target="_blank" rel="noopener noreferrer">${escapedHref}</a>`;
            html += escapeHtml(trailing);
        } else {
            html += escapeHtml(rawUrl);
        }

        lastIndex = endIndex;
        match = URL_PATTERN.exec(source);
    }

    html += escapeHtml(source.slice(lastIndex));
    return html;
}

// ── DOM helpers ─────────────────────────────────────────────

/**
 * Type-safe `getElementById` wrapper. Returns `null` when missing.
 * @param {string} id
 * @returns {HTMLElement | null}
 */
export function $(id) {
    return document.getElementById(id);
}

/**
 * Create an element with optional attributes and children.
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {...(Node | string)} children
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            el.className = value;
        } else if (key === 'textContent') {
            el.textContent = value;
        } else if (key === 'innerHTML') {
            el.innerHTML = value;
        } else {
            el.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            el.appendChild(child);
        }
    }
    return el;
}

// ── URL helpers ─────────────────────────────────────────────

/**
 * Sanitize a href-like value.
 * Allows only http(s), protocol-relative URLs, and optionally relative/hash links.
 * @param {unknown} value
 * @param {{ allowRelative?: boolean; allowHash?: boolean }} [options]
 * @returns {string}
 */
export function sanitizeHref(value, options = {}) {
    const text = String(value ?? '').trim();
    if (!text) return '';
    if (options.allowHash && text.startsWith('#')) return text;
    if (ABSOLUTE_WEB_URL_RE.test(text)) return text;
    if (options.allowRelative && /^(?:\/|\.{1,2}\/)/.test(text)) return text;
    if (GENERIC_SCHEME_RE.test(text)) return '';
    return '';
}

/**
 * Accept a bare hostname-or-URL (no scheme) and return a validated https:// URL.
 * Returns empty string for anything that could not be safely normalized.
 * Used by both dom.js utilities and i18n/config.js route resolution.
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeBareWebUrl(value) {
    const text = String(value || '').trim();
    if (!text || /\s/.test(text) || text.startsWith('.') || text.startsWith('/') || text.startsWith('#')) {
        return '';
    }

    const hostCandidate = text.split(/[/?#]/, 1)[0] || '';
    if (hostCandidate.includes('@')) {
        return '';
    }

    const hostname = hostCandidate.replace(/:\d+$/, '').replace(/^\[|\]$/g, '').toLowerCase();
    const isIpv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    const isLocalhost = hostname === 'localhost';
    const hasDnsLikeHost = hostname.includes('.');

    if (!hostname || (!isIpv4 && !isLocalhost && !hasDnsLikeHost)) {
        return '';
    }

    try {
        const normalized = new URL(`https://${text.replace(/^\/+/, '')}`);
        if (normalized.username || normalized.password) return '';
        if (!/^https?:$/i.test(normalized.protocol)) return '';
        if (!normalized.hostname) return '';
        return normalized.toString();
    } catch {
        return '';
    }
}

/**
 * Normalise a URL value – prepend https:// when the scheme is missing.
 * Returns empty string for falsy / blank input.
 * @param {unknown} value
 * @returns {string}
 */
export function cleanUrl(value) {
    const text = String(value ?? '').trim();
    if (!text) return '';
    if (ABSOLUTE_WEB_URL_RE.test(text)) return text;
    const bareUrl = normalizeBareWebUrl(text);
    if (bareUrl) return bareUrl;
    if (GENERIC_SCHEME_RE.test(text) || text.startsWith('#')) return '';
    return '';
}

/**
 * Clamp oversized Discord CDN avatar URLs to a smaller `size=` value.
 * Relative URLs are resolved against the current document first.
 * Returns an absolute URL string or an empty string when the input is invalid.
 * @param {unknown} value
 * @param {number} [maxSize=256]
 * @returns {string}
 */
export function optimizeDiscordAvatarUrl(value, maxSize = 256) {
    const text = String(value ?? '').trim();
    if (!text) return '';

    try {
        const url = new URL(text, window.location.href);
        const hostname = url.hostname.toLowerCase();
        const isDiscordAvatar = (hostname === 'cdn.discordapp.com' || hostname === 'media.discordapp.net')
            && /\/avatars\//i.test(url.pathname);

        if (!isDiscordAvatar) return url.toString();

        const size = Number(url.searchParams.get('size'));
        if (!Number.isFinite(size) || size > maxSize) {
            url.searchParams.set('size', String(maxSize));
        }

        return url.toString();
    } catch {
        return '';
    }
}
