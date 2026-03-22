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
export function initReveal(watchRoots = []) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* If the user prefers reduced motion, mark everything visible immediately. */
    if (prefersReduced) {
        document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
        return { destroy: () => {} };
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

    /** Scan the DOM for un-observed `.reveal` elements. */
    function scan() {
        document.querySelectorAll('.reveal').forEach((el) => {
            if (/** @type {HTMLElement} */ (el).dataset.revealBound === '1') return;
            /** @type {HTMLElement} */ (el).dataset.revealBound = '1';
            observer.observe(el);
        });
    }

    scan();

    /* Watch for dynamically-added .reveal elements. */
    const mutationObs = new MutationObserver(scan);
    for (const root of watchRoots) {
        if (root) mutationObs.observe(root, { childList: true, subtree: true });
    }
    /* Also watch body for top-level additions. */
    mutationObs.observe(document.body, { childList: true, subtree: false });

    function destroy() {
        observer.disconnect();
        mutationObs.disconnect();
    }

    return { destroy };
}
