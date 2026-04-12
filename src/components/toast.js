/**
 * @fileoverview Lightweight toast notification component.
 * Uses ARIA live region for screen-reader support.
 * @module components/toast
 */

import { $ } from '../core/dom.js';

/** @type {number | undefined} */
let timer;

function ensureToastElement() {
    const existing = $('toast');
    if (existing) return existing;
    if (!document.body) return null;

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-hidden', 'true');
    document.body.appendChild(toast);
    return toast;
}

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [kind='info']
 * @param {number} [duration=3200]
 */
export function showToast(message, kind = 'info', duration = 3200) {
    const el = ensureToastElement();
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
