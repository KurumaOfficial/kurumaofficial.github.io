import { createLocaleController } from '../i18n/controller.js?v=20260703a';
import { initSharedThemeToggle } from '../core/site-shell.js';
import { initReveal } from '../components/reveal.js';

function boot() {
    const localeController = createLocaleController();
    localeController.mountLanguageSwitcher();
    initSharedThemeToggle();

    const searchInput = document.querySelector('.docs-search-input');
    const searchWrap = document.querySelector('.docs-search-wrap');

    if (searchInput && searchWrap) {
        // Create dropdown search results container
        let resultsDropdown = searchWrap.querySelector('.docs-search-results');
        if (!resultsDropdown) {
            resultsDropdown = document.createElement('div');
            resultsDropdown.className = 'docs-search-results';
            searchWrap.appendChild(resultsDropdown);
        }

        // Store original content of article if available for in-page highlighting
        const docsContentEl = document.querySelector('.docs-content');
        let originalArticleHTML = docsContentEl ? docsContentEl.innerHTML : '';

        function performSearch(query) {
            const trimmed = query.trim();

            // Clear previous highlights if empty or too short
            if (!trimmed || trimmed.length < 2) {
                if (docsContentEl && originalArticleHTML) {
                    docsContentEl.innerHTML = originalArticleHTML;
                }
                resultsDropdown.innerHTML = '';
                resultsDropdown.classList.remove('is-open');

                // Reset sidebar category filtering
                document.querySelectorAll('.docs-cat-group').forEach(group => {
                    group.style.display = '';
                    group.querySelectorAll('.docs-cat-link').forEach(link => link.style.display = '');
                });
                return;
            }

            const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');

            // 1. In-page search & highlighting
            if (docsContentEl) {
                // Restore clean HTML before highlighting
                docsContentEl.innerHTML = originalArticleHTML;
                highlightNodes(docsContentEl, regex);

                // Scroll to first match
                const firstMark = docsContentEl.querySelector('mark.docs-search-mark');
                if (firstMark) {
                    firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            // 2. Filter sidebar categories
            document.querySelectorAll('.docs-cat-group').forEach(group => {
                let hasMatch = false;
                group.querySelectorAll('.docs-cat-link').forEach(link => {
                    const text = link.textContent.toLowerCase();
                    if (text.includes(trimmed.toLowerCase())) {
                        link.style.display = '';
                        hasMatch = true;
                    } else {
                        link.style.display = 'none';
                    }
                });
                group.style.display = hasMatch ? '' : 'none';
            });

            // 3. Dropdown Search Results Overlay
            const results = [];

            // Search in-page headings and paragraphs
            const headingsAndParas = document.querySelectorAll('.docs-content h1, .docs-content h2, .docs-content h3, .docs-content p, .docs-content li');
            headingsAndParas.forEach((el) => {
                const text = el.textContent;
                if (text.toLowerCase().includes(trimmed.toLowerCase())) {
                    let snippet = text.length > 140 ? text.substring(0, 140) + '...' : text;
                    snippet = snippet.replace(regex, '<mark class="docs-search-mark">$1</mark>');

                    const titleEl = el.closest('section')?.querySelector('h1, h2, h3') || el;
                    results.push({
                        title: titleEl.textContent,
                        category: document.querySelector('.docs-cat-link.is-active')?.textContent || 'Документация',
                        snippet: snippet,
                        element: el
                    });
                }
            });

            // Also search all category links
            document.querySelectorAll('.docs-cat-link').forEach(link => {
                const title = link.textContent;
                if (title.toLowerCase().includes(trimmed.toLowerCase())) {
                    const catName = link.closest('.docs-cat-group')?.querySelector('.docs-cat-title')?.textContent || 'Раздел';
                    results.push({
                        title: title,
                        category: catName,
                        snippet: `Перейти в раздел: ${title}`,
                        url: link.href
                    });
                }
            });

            // Render Results
            if (results.length > 0) {
                resultsDropdown.innerHTML = results.slice(0, 8).map(res => `
                    <a class="docs-search-result-item" href="${res.url || '#'}" data-has-element="${!!res.element}">
                        <div class="docs-search-result-title">
                            <span>${escapeHtmlText(res.title)}</span>
                            <span class="docs-search-result-cat">${escapeHtmlText(res.category)}</span>
                        </div>
                        <div class="docs-search-result-snippet">${res.snippet}</div>
                    </a>
                `).join('');

                resultsDropdown.classList.add('is-open');

                // Click handlers on results
                resultsDropdown.querySelectorAll('.docs-search-result-item').forEach((item, index) => {
                    item.addEventListener('click', (e) => {
                        const matchRes = results[index];
                        if (matchRes.element) {
                            e.preventDefault();
                            resultsDropdown.classList.remove('is-open');
                            matchRes.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    });
                });
            } else {
                resultsDropdown.innerHTML = `<div class="docs-search-no-results">Совпадений не найдено</div>`;
                resultsDropdown.classList.add('is-open');
            }
        }

        searchInput.addEventListener('input', (e) => performSearch(e.target.value));

        // Close search on Esc or click outside
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                resultsDropdown.classList.remove('is-open');
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchWrap.contains(e.target)) {
                resultsDropdown.classList.remove('is-open');
            }
        });
    }

    // Code blocks copy on click
    document.querySelectorAll('.docs-content pre').forEach(pre => {
        pre.style.cursor = 'pointer';
        pre.title = 'Нажмите, чтобы скопировать';
        pre.addEventListener('click', () => {
            const code = pre.textContent;
            navigator.clipboard.writeText(code).then(() => {
                const origBg = pre.style.background;
                pre.style.background = 'rgba(63, 207, 127, 0.15)';
                setTimeout(() => {
                    pre.style.background = origBg;
                }, 800);
            }).catch(() => {});
        });
    });

    // Track initial entry point into documentation system from non-docs page
    try {
        const currentRef = document.referrer;
        if (currentRef && !currentRef.includes('/docs/')) {
            sessionStorage.setItem('aleph_docs_entry_referrer', currentRef);
        }
    } catch (e) {}

    // Handle "Back" button click
    const backBtns = document.querySelectorAll('.hero-store-back, .docs-hub-back');
    backBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const entryRef = sessionStorage.getItem('aleph_docs_entry_referrer');
            if (entryRef && !entryRef.includes('/docs/')) {
                window.location.href = entryRef;
            } else {
                const currentPath = window.location.pathname;
                if (currentPath.includes('/en/')) {
                    window.location.href = '/en/';
                } else if (currentPath.includes('/ua/')) {
                    window.location.href = '/ua/';
                } else {
                    window.location.href = '/ru/';
                }
            }
        });
    });

    initReveal([document.getElementById('main')].filter(Boolean));
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtmlText(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function highlightNodes(container, regex) {
    const walk = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    const nodesToReplace = [];
    let node;

    while (node = walk.nextNode()) {
        if (node.parentNode && ['SCRIPT', 'STYLE', 'MARK', 'CODE', 'PRE'].includes(node.parentNode.nodeName)) {
            continue;
        }
        if (node.nodeValue && regex.test(node.nodeValue)) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(textNode => {
        const parent = textNode.parentNode;
        if (!parent) return;

        const frag = document.createDocumentFragment();
        const parts = textNode.nodeValue.split(regex);

        parts.forEach(part => {
            if (regex.test(part)) {
                const mark = document.createElement('mark');
                mark.className = 'docs-search-mark';
                mark.textContent = part;
                frag.appendChild(mark);
            } else if (part) {
                frag.appendChild(document.createTextNode(part));
            }
        });

        parent.replaceChild(frag, textNode);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
    boot();
}
