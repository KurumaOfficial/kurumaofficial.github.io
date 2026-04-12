/**
 * @fileoverview Scroll-reveal observer.
 * Adds `.is-visible` to `.reveal` elements when they enter the viewport.
 * Automatically re-observes when the DOM mutates.
 * Respects `prefers-reduced-motion`.
 * @module components/reveal
 */

/**
 * Initialise the reveal system.
 * @param {HTMLElement[]} [watchRoots] – containers to watch for new `.reveal` children.
 * @returns {{ destroy: () => void }}
 */
let activeRevealController = null;
let revealGeneration = 0;

export function initReveal(watchRoots = []) {
    activeRevealController?.destroy();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const generationToken = String(++revealGeneration);

    /* If the user prefers reduced motion, mark everything visible immediately. */
    if (prefersReduced) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
        const reducedMotionController = { destroy: () => {} };
        activeRevealController = reducedMotionController;
        return reducedMotionController;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // once is enough
                }
            }
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    const rootsToWatch = watchRoots.length > 0
        ? [...new Set(watchRoots.filter(Boolean))]
        : [document.body];
    let scheduledScanFrame = 0;
    let destroyed = false;

    /**
     * Observe a single `.reveal` node once per generation.
     * @param {Element} node
     */
    function observeRevealNode(node) {
        if (!(node instanceof HTMLElement)) return;
        if (!node.classList.contains('reveal')) return;
        if (node.dataset.revealBound === generationToken) return;

        node.dataset.revealBound = generationToken;
        if (node.classList.contains('is-visible')) return;
        observer.observe(node);
    }

    /**
     * Observe a root and any nested `.reveal` descendants.
     * @param {ParentNode | Element | DocumentFragment | Document | null | undefined} root
     */
    function observeRevealTree(root) {
        if (!root) return;

        if (root instanceof Element) {
            observeRevealNode(root);
        }

        if (typeof root.querySelectorAll !== 'function') return;
        root.querySelectorAll('.reveal').forEach((el) => observeRevealNode(el));
    }

    function scheduleScan() {
        if (destroyed || scheduledScanFrame) return;

        scheduledScanFrame = window.requestAnimationFrame(() => {
            scheduledScanFrame = 0;
            if (destroyed) return;
            rootsToWatch.forEach((root) => observeRevealTree(root));
        });
    }

    scheduleScan();

    /* Watch for dynamically-added .reveal elements. */
    const mutationObs = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node instanceof Element || node instanceof DocumentFragment) {
                    observeRevealTree(node);
                }
            });
        }

        scheduleScan();
    });

    for (const root of rootsToWatch) {
        if (root) mutationObs.observe(root, { childList: true, subtree: true });
    }

    function destroy() {
        destroyed = true;
        window.cancelAnimationFrame(scheduledScanFrame);
        observer.disconnect();
        mutationObs.disconnect();
        if (activeRevealController === controller) {
            activeRevealController = null;
        }
    }

    const controller = { destroy };
    activeRevealController = controller;
    return controller;
}
