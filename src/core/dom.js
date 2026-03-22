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
    return escapeHtml(text).replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a class="inline-link" href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );
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
 * Normalise a URL value – prepend https:// when the scheme is missing.
 * Returns empty string for falsy / blank input.
 * @param {unknown} value
 * @returns {string}
 */
export function cleanUrl(value) {
    const text = String(value ?? '').trim();
    if (!text) return '';
    if (/^(https?:)?\/\//i.test(text)) return text;
    return 'https://' + text.replace(/^\/+/, '');
}
