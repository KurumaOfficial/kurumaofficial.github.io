/**
 * @fileoverview Strange Visuals product page — interactive components.
 *
 * Manages: theme toggle, install button, GUI widget (tabs + items),
 * before/after comparison slider, and scroll-reveal.
 *
 * @module products/strange-visuals
 */

/* ── Constants ───────────────────────────────────────────── */

const THEME_KEY = 'sv-theme';

/** @type {Readonly<Record<string, { title: string; icon: string; items: ReadonlyArray<{ n: string; on: boolean }> }>>} */
const GUI_TABS = Object.freeze({
    player: {
        title: 'На игроке',
        icon: 'person',
        items: [
            { n: 'Боксы', on: true },
            { n: 'Джампики', on: true },
            { n: 'Китайская шляпа', on: true },
            { n: 'Таргет рендер', on: true },
            { n: 'Хит бабл', on: false },
        ],
    },
    world: {
        title: 'В мире',
        icon: 'public',
        items: [
            { n: 'Чамсы', on: true },
            { n: 'Трейсеры', on: false },
            { n: 'Снаряды', on: true },
            { n: 'Частицы', on: true },
            { n: 'Блок оверлей', on: false },
            { n: 'Дроп рендер', on: true },
            { n: 'Скелетон', on: false },
        ],
    },
    utils: {
        title: 'Утилиты',
        icon: 'build',
        items: [
            { n: 'Авто спринт', on: true },
            { n: 'Авто тул', on: false },
            { n: 'Фуллбрайт', on: true },
            { n: 'Ноу оверлей', on: true },
            { n: 'Координаты', on: true },
            { n: 'Таймер', on: false },
        ],
    },
    other: {
        title: 'Остальное',
        icon: 'more_horiz',
        items: [
            { n: 'Антибот', on: false },
            { n: 'Прокси', on: false },
            { n: 'Дебаг мод', on: true },
            { n: 'Ник хайдер', on: true },
        ],
    },
    interface: {
        title: 'Интерфейс',
        icon: 'dashboard',
        items: [
            { n: 'Массив лист', on: true },
            { n: 'Ватермарка', on: true },
            { n: 'Кейбинды', on: false },
            { n: 'Нотификации', on: true },
            { n: 'Хотбар', on: true },
            { n: 'Скорборд', on: false },
            { n: 'Табулист', on: true },
            { n: 'Кроссхейр', on: true },
        ],
    },
    themes: {
        title: 'Темы',
        icon: 'palette',
        items: [
            { n: 'Стандарт', on: true },
            { n: 'Минимализм', on: false },
            { n: 'Неон', on: false },
            { n: 'Ретро', on: false },
        ],
    },
});


/* ── Helpers ──────────────────────────────────────────────── */

/**
 * Shortcut for `document.getElementById`.
 * @param {string} id
 * @returns {HTMLElement | null}
 */
function $(id) {
    return document.getElementById(id);
}

/**
 * Escape HTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function esc(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}


/* ── Theme ───────────────────────────────────────────────── */

function initTheme() {
    const html = document.documentElement;
    const btn = $('themeBtn');
    const ico = $('themeIco');
    if (!btn || !ico) return;

    /** @param {'dark' | 'light'} t */
    function apply(t) {
        html.setAttribute('data-theme', t);
        ico.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
        try { localStorage.setItem(THEME_KEY, t); } catch { /* quota */ }
    }

    btn.addEventListener('click', () => {
        apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });

    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === 'light' || saved === 'dark') apply(saved);
    } catch { /* private mode */ }
}


/* ── Install Button ──────────────────────────────────────── */

function initInstallBtn() {
    const btn = $('installBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const installed = btn.dataset.installed === 'true';
        btn.dataset.installed = installed ? 'false' : 'true';
        btn.textContent = installed ? 'СКАЧАТЬ' : '✓ СКАЧАНО';
        btn.classList.toggle('installed', !installed);
    });
}


/* ── GUI Widget ──────────────────────────────────────────── */

function initGuiWidget() {
    const tabsEl = $('gwTabs');
    const body   = $('gwBody');
    const sec    = $('gwSec');
    const items  = $('gwItems');
    if (!tabsEl || !body || !sec || !items) return;

    const scroll = body.querySelector('.gw-scroll');

    /**
     * Build the GUI list for a given tab key.
     * @param {string} key
     */
    function build(key) {
        const data = GUI_TABS[key];
        if (!data) return;

        body.style.transition = 'opacity .18s ease, transform .18s ease';
        body.classList.replace('fin', 'fout');

        setTimeout(() => {
            sec.textContent = data.title;
            items.textContent = '';

            for (const it of data.items) {
                const el = document.createElement('div');
                el.className = 'gw-item';
                el.setAttribute('role', 'button');
                el.setAttribute('tabindex', '0');

                el.innerHTML = [
                    '<div class="gw-av"><span class="material-icons">',
                    esc(data.icon),
                    '</span></div>',
                    '<div class="gw-info">',
                    '  <div class="gw-name">', esc(it.n), '</div>',
                    '  <div class="gw-status ', it.on ? 'on' : 'off', '">',
                    it.on ? 'ВКЛЮЧЕНО' : 'ВЫКЛЮЧЕНО',
                    '</div>',
                    '</div>',
                    '<div class="gw-dots"><span class="material-icons">more_vert</span></div>',
                ].join('');

                el.addEventListener('click', () => toggleItem(el));
                el.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleItem(el);
                    }
                });

                items.appendChild(el);
            }

            if (scroll) scroll.scrollTop = 0;
            body.style.transition = 'opacity .22s ease, transform .22s ease';
            body.classList.replace('fout', 'fin');
        }, 170);
    }

    /**
     * Toggle an item's on/off status.
     * @param {HTMLElement} el
     */
    function toggleItem(el) {
        const s = el.querySelector('.gw-status');
        if (!s) return;

        el.style.transform = 'scale(.97)';
        setTimeout(() => { el.style.transform = ''; }, 110);

        if (s.classList.contains('on')) {
            s.classList.replace('on', 'off');
            s.textContent = 'ВЫКЛЮЧЕНО';
        } else {
            s.classList.replace('off', 'on');
            s.textContent = 'ВКЛЮЧЕНО';
        }
    }

    /* Bind tab clicks */
    tabsEl.querySelectorAll('[data-tab]').forEach(tab => {
        tab.addEventListener('click', function () {
            tabsEl.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            build(/** @type {string} */ (this.dataset.tab));
        });
    });

    /* Initial render */
    build('player');
}


/* ── Compare Slider ──────────────────────────────────────── */

function initCompareSlider() {
    const slider    = /** @type {HTMLInputElement | null} */ ($('compareSlider'));
    const afterWrap = $('compareAfterWrap');
    const divider   = $('compareDivider');
    const handle    = $('compareHandle');
    if (!slider || !afterWrap || !divider || !handle) return;

    /** @param {number} value 0-100 */
    function update(value) {
        const v = Math.max(0, Math.min(100, value));
        const pct = v + '%';
        afterWrap.style.width = pct;
        divider.style.left    = pct;
        handle.style.left     = pct;
    }

    slider.addEventListener('input', () => update(Number(slider.value)));
    update(Number(slider.value));
}


/* ── Scroll Reveal ───────────────────────────────────────── */

function initReveal() {
    /* Respect user preference */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.querySelectorAll('.sv-reveal').forEach(el => el.classList.add('on'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const el = /** @type {HTMLElement} */ (entry.target);
                    const delay = parseInt(el.dataset.d || '0', 10);
                    setTimeout(() => el.classList.add('on'), delay);
                    observer.unobserve(el);
                }
            }
        },
        { threshold: 0.08, rootMargin: '0px 0px -28px 0px' },
    );

    document.querySelectorAll('.sv-reveal').forEach((el, i) => {
        /** @type {HTMLElement} */ (el).dataset.d = String((i % 4) * 90);
        observer.observe(el);
    });
}


/* ── Boot ─────────────────────────────────────────────────── */

function boot() {
    initTheme();
    initInstallBtn();
    initGuiWidget();
    initCompareSlider();
    initReveal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
