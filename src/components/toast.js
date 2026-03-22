/**
 * @fileoverview Lightweight toast notification component.
 * Uses ARIA live region for screen-reader support.
 * @module components/toast
 */

import { $ } from '../core/dom.js';

/** @type {number | undefined} */
let timer;

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [kind='info']
 * @param {number} [duration=3200]
 */
export function showToast(message, kind = 'info', duration = 3200) {
    const el = $('toast');
    if (!el) return;

    el.textContent = message;
    el.dataset.kind = kind;
    el.setAttribute('aria-hidden', 'false');

    clearTimeout(timer);
    timer = window.setTimeout(() => {
        el.setAttribute('aria-hidden', 'true');
        delete el.dataset.kind;
    }, duration);
}
