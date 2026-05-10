/**
 * @fileoverview Lightweight toast notification component.
 * Uses ARIA live region for screen-reader support.
 * @module components/toast
 */

import { $ } from '../core/dom.js';

/** @type {number | undefined} */
let timer;
let activeToastEl = null;
let toastStartTime = 0;
let remainingDuration = 0;
let lifecycleBound = false;

function getDefaultDuration(kind) {
    return kind === 'error' ? 5200 : 3200;
}

function clearHideTimer() {
    window.clearTimeout(timer);
    timer = undefined;
}

function hideToast(el) {
    if (!el) return;
    clearHideTimer();
    el.setAttribute('aria-hidden', 'true');
    delete el.dataset.kind;
    activeToastEl = null;
    toastStartTime = 0;
    remainingDuration = 0;
}

function scheduleHide(el, duration) {
    clearHideTimer();
    activeToastEl = el;
    remainingDuration = Math.max(0, duration);
    toastStartTime = window.performance.now();
    timer = window.setTimeout(() => {
        hideToast(el);
    }, remainingDuration);
}

function pauseHide(el) {
    if (activeToastEl !== el || !timer || el.getAttribute('aria-hidden') === 'true') return;
    const elapsed = window.performance.now() - toastStartTime;
    remainingDuration = Math.max(0, remainingDuration - elapsed);
    clearHideTimer();
}

function resumeHide(el) {
    if (activeToastEl !== el || el.getAttribute('aria-hidden') === 'true') return;
    scheduleHide(el, remainingDuration || getDefaultDuration(el.dataset.kind || 'info'));
}

function ensureToastElement() {
    const existing = $('toast');
    if (existing) return existing;
    if (!document.body) return null;

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    toast.setAttribute('aria-hidden', 'true');
    document.body.appendChild(toast);
    return toast;
}

function bindToastInteractions(el) {
    if (el.dataset.toastBound === '1') return;
    el.dataset.toastBound = '1';

    el.addEventListener('mouseenter', () => pauseHide(el));
    el.addEventListener('mouseleave', () => resumeHide(el));
    el.addEventListener('click', () => hideToast(el));
}

function bindToastLifecycle() {
    if (lifecycleBound) return;
    lifecycleBound = true;

    window.addEventListener('pagehide', () => {
        hideToast(activeToastEl);
    });
}

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success' | 'error' | 'info'} [kind='info']
 * @param {number} [duration]
 */
export function showToast(message, kind = 'info', duration) {
    const el = ensureToastElement();
    if (!el) return;

    bindToastInteractions(el);
    bindToastLifecycle();

    const resolvedKind = kind === 'success' || kind === 'error' ? kind : 'info';
    const resolvedDuration = Number.isFinite(duration)
        ? Math.max(0, Number(duration))
        : getDefaultDuration(resolvedKind);
    const isError = resolvedKind === 'error';

    el.textContent = message;
    el.dataset.kind = resolvedKind;
    el.setAttribute('role', isError ? 'alert' : 'status');
    el.setAttribute('aria-live', isError ? 'assertive' : 'polite');
    el.setAttribute('aria-hidden', 'false');

    scheduleHide(el, resolvedDuration);
}
