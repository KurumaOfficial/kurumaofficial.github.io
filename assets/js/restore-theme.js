/* Runs before any render — restores the saved colour-scheme without flash. */
(function () {
    try {
        var t = localStorage.getItem('aleph-theme');
        if (t === 'light' || t === 'dark') {
            document.documentElement.setAttribute('data-theme', t);
            document.documentElement.style.colorScheme = t;
        }
    } catch (e) { /* localStorage may be blocked in certain private-mode browsers */ }
}());
