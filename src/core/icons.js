/**
 * @fileoverview Lightweight inline SVG icon helpers for public routes.
 * @module core/icons
 */

const ICON_MARKUP = Object.freeze({
    light_mode: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.8v2.6M12 18.6v2.6M4.8 12H2.2M21.8 12h-2.6M5.9 5.9l1.9 1.9M16.2 16.2l1.9 1.9M18.1 5.9l-1.9 1.9M7.8 16.2l-1.9 1.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    dark_mode: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.8 3.2a8.9 8.9 0 1 0 6 13.6 9.8 9.8 0 0 1-4.3 1c-5.1 0-9.3-4.1-9.3-9.3 0-2.1.7-4.1 2-5.6 1.2-.2 2.4-.1 3.6.3.7.2 1.4.2 2 .1Z" fill="currentColor"/></svg>',
    arrow_back: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19 12H6.75M6.75 12l5.1-5.1M6.75 12l5.1 5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    arrow_outward: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    workspace_premium: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.1 3.6h3.05L12 7.1l-2.1 4.12-3.2-4.35Z" fill="currentColor" opacity=".78"/><path d="M12.85 3.6h3.05l1.4 3.27-3.2 4.35L12 7.1Z" fill="currentColor" opacity=".56"/><circle cx="12" cy="14.6" r="5.15" fill="currentColor"/><circle cx="12" cy="14.6" r="2.15" fill="#ffffff" opacity=".16"/></svg>',
    auto_awesome: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 3.4 1.9 4.7 4.7 1.9-4.7 1.9-1.9 4.7-1.9-4.7L5.4 10l4.7-1.9Z" fill="currentColor"/><path d="m18.2 3.8.8 2 .8.8-2 .8-.8 2-.8-2-2-.8 2-.8Zm.8 10.2.9 2.2 2.1.9-2.1.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9Z" fill="currentColor" opacity=".72"/></svg>',
    diamond: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 3.5 19.8 11 12 20.5 4.2 11Z" fill="currentColor"/><path d="M12 3.5 9.1 11 12 20.5 14.9 11Z" fill="#ffffff" opacity=".24"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5.5 12.5 10 17l8.5-8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    code: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m8.2 7.2-4.3 4.8 4.3 4.8M15.8 7.2l4.3 4.8-4.3 4.8M13.9 5.1l-3.8 13.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    code_wide: '<svg viewBox="0 0 30 24" aria-hidden="true" focusable="false"><path d="M10.1 7.1 3.6 12l6.5 4.9M19.9 7.1 26.4 12l-6.5 4.9M16.4 5.05 13.6 18.95" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="18" cy="5.2" r="2.4" fill="currentColor"/><circle cx="6" cy="12" r="2.4" fill="currentColor"/><circle cx="18" cy="18.8" r="2.4" fill="currentColor"/><path d="M8.1 11.1 15.9 6M8.1 12.9l7.8 5.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    file_download: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.8v9.6M8.3 11.6 12 15.3l3.7-3.7M5.2 18.8h13.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    layers: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m12 5-7 3.8 7 3.8 7-3.8Zm-7 7.2L12 16l7-3.8M5 15.8l7 3.8 7-3.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    public: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4.7 9.4h14.6M4.9 14.6h14.2M12 3.8c2.1 2.1 3.3 5 3.3 8.2S14.1 18.1 12 20.2M12 3.8C9.9 5.9 8.7 8.8 8.7 12s1.2 6.1 3.3 8.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    update: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M19.2 8.3A7.9 7.9 0 1 0 20 12h-2.3M19.2 8.3V4.9m0 3.4h-3.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M13.7 3.8 6.8 13h4.2l-.8 7.2 6.8-9.2h-4.2Z" fill="currentColor"/></svg>',
    report_problem: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.5 20 18.5H4Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 9v4.4M12 16.4h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    drag_indicator: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="9" cy="7" r="1.3" fill="currentColor"/><circle cx="15" cy="7" r="1.3" fill="currentColor"/><circle cx="9" cy="12" r="1.3" fill="currentColor"/><circle cx="15" cy="12" r="1.3" fill="currentColor"/><circle cx="9" cy="17" r="1.3" fill="currentColor"/><circle cx="15" cy="17" r="1.3" fill="currentColor"/></svg>',
    person: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.3" r="3.2" fill="currentColor"/><path d="M5.6 18.9c.8-3.1 3.4-4.9 6.4-4.9s5.6 1.8 6.4 4.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    build: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14.7 6.2 3.1 3.1-8.3 8.3-3.5.4.4-3.5Zm-.6-1.8a4 4 0 0 0-5.4 5.4l-3.5 3.5a2 2 0 1 0 2.8 2.8l3.5-3.5a4 4 0 0 0 5.4-5.4l-2 2-2.8-2.8Z" fill="currentColor"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="4.2" y="4.2" width="6.6" height="6.6" rx="1.2" fill="currentColor"/><rect x="13.2" y="4.2" width="6.6" height="4.4" rx="1.2" fill="currentColor" opacity=".88"/><rect x="4.2" y="13.2" width="6.6" height="6.6" rx="1.2" fill="currentColor" opacity=".88"/><rect x="13.2" y="10.8" width="6.6" height="9" rx="1.2" fill="currentColor"/></svg>',
    more_vert: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="6" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="18" r="1.7" fill="currentColor"/></svg>',
    more_horiz: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="6" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="18" cy="12" r="1.7" fill="currentColor"/></svg>',
    palette: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4.2c-4.9 0-8.8 3.5-8.8 7.9 0 4 3.1 7.2 7 7.2h1.1c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.2-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6h1.7c3 0 5.4-2.4 5.4-5.4 0-4.7-4.4-8.3-9.8-8.3Z" fill="currentColor"/><circle cx="7.8" cy="10.1" r="1.1" fill="#080606" opacity=".35"/><circle cx="10.8" cy="7.8" r="1.1" fill="#080606" opacity=".35"/><circle cx="14.8" cy="8.1" r="1.1" fill="#080606" opacity=".35"/><circle cx="16.6" cy="11.6" r="1.1" fill="#080606" opacity=".35"/></svg>',
});

export function getIconMarkup(name) {
    return ICON_MARKUP[name] || '';
}

export function setInlineIcon(container, name, { className = '' } = {}) {
    if (!(container instanceof HTMLElement)) return;

    container.className = className.trim();
    container.setAttribute('aria-hidden', 'true');
    container.innerHTML = getIconMarkup(name);
}

export function createInlineIcon(name, { className = 'ui-icon', label = '' } = {}) {
    const element = document.createElement('span');
    if (className) {
        element.className = className;
    }

    if (label) {
        element.setAttribute('role', 'img');
        element.setAttribute('aria-label', label);
    } else {
        element.setAttribute('aria-hidden', 'true');
    }

    element.innerHTML = getIconMarkup(name);
    return element;
}
