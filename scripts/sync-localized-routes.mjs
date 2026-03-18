import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(new URL('../index.html', import.meta.url)));
const sourcePath = join(rootDir, 'index.html');
const routeLocales = ['ru', 'en', 'ua'];
const routeDescriptions = Object.freeze({
    ru: 'Aleph Studio — моды, игры, DLC и небольшие цифровые релизы с открытым исходным кодом, понятной установкой и быстрым доступом к актуальной версии.',
    en: 'Aleph Studio builds mods, games, DLCs and small digital releases with open source code, clear setup steps and direct access to the latest build.',
    ua: 'Aleph Studio створює моди, ігри, DLC та невеликі цифрові релізи з відкритим кодом, зрозумілим встановленням і швидким доступом до актуальної збірки.'
});

function injectRouteLocale(html, locale) {
    const htmlLang = locale === 'ua' ? 'uk' : locale;
    let result = html.replace('<html lang="ru" class="scroll-smooth">', `<html lang="${htmlLang}" class="scroll-smooth">`);
    result = result.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${routeDescriptions[locale].replace(/"/g, '&quot;')}">`);
    result = result.replace(/<script type="module" src="\.\/src\/app\.js"><\/script>/, `<script>window.__ALEPH_ROUTE_LOCALE__ = '${locale}';</script>\n    <script type="module" src="../src/app.js"></script>`);
    result = result.replace(/href="\.\/assets\//g, 'href="../assets/');
    result = result.replace(/src="\.\/assets\//g, 'src="../assets/');
    result = result.replace(/href="\.\/favicon\.ico/g, 'href="../favicon.ico');
    result = result.replace(/href="\.\/src\//g, 'href="../src/');
    return result;
}

function buildLegacyUkRedirect() {
    return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=../ua/">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aleph Studio</title>
    <link rel="canonical" href="../ua/">
    <script>window.location.replace('../ua/' + (window.location.search || '') + (window.location.hash || ''));</script>
</head>
<body></body>
</html>
`;
}

async function main() {
    const sourceHtml = await readFile(sourcePath, 'utf8');

    for (const locale of routeLocales) {
        const localeDir = join(rootDir, locale);
        await mkdir(localeDir, { recursive: true });
        const outputHtml = injectRouteLocale(sourceHtml, locale);
        await writeFile(join(localeDir, 'index.html'), outputHtml, 'utf8');
    }

    const legacyUkDir = join(rootDir, 'uk');
    await mkdir(legacyUkDir, { recursive: true });
    await writeFile(join(legacyUkDir, 'index.html'), buildLegacyUkRedirect(), 'utf8');
}

await main();
