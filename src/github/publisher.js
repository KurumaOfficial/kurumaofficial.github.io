import {
    GITHUB_SYNC_DEFAULTS,
    SITE_DATA_BLOCK_PATTERN,
    SITE_DATA_BLOCK_START,
    SITE_DATA_BLOCK_END,
    HTML_PATH_PATTERN,
    JS_PATH_PATTERN,
    JSON_PATH_PATTERN
} from '../core/constants.js';
import { normalizeData, buildRepoAssetPath } from '../core/site-utils.js';

export function createGitHubPublisher({ getPendingUploads, clearPendingUploads, renderProductUploadMeta, syncDraftControls }) {
    const githubSyncTargetEl = document.getElementById('githubSyncTarget');
    const githubTokenEl = document.getElementById('githubToken');

    function normalizeGitHubConfig(config) {
        return {
            owner: String(config.owner || '').trim(),
            repo: String(config.repo || '').trim(),
            branch: String(config.branch || 'main').trim() || 'main',
            path: String(config.path || GITHUB_SYNC_DEFAULTS.path).trim().replace(/\\/g, '/') || GITHUB_SYNC_DEFAULTS.path
        };
    }

    function resolveGitHubConfig() {
        const defaults = normalizeGitHubConfig(GITHUB_SYNC_DEFAULTS);
        const host = window.location.hostname;
        const pathParts = window.location.pathname.split('/').filter(Boolean);

        if (!host.endsWith('github.io')) {
            return defaults;
        }

        const ownerFromHost = host.replace('.github.io', '');
        const isUserSite = !pathParts.length || (pathParts.length === 1 && HTML_PATH_PATTERN.test(pathParts[0] || 'index.html'));
        const repo = isUserSite ? (ownerFromHost + '.github.io') : pathParts[0];

        return normalizeGitHubConfig({
            owner: repo === defaults.repo ? defaults.owner : ownerFromHost,
            repo,
            branch: defaults.branch,
            path: defaults.path
        });
    }

    function renderGitHubSyncTarget() {
        const config = resolveGitHubConfig();
        if (githubSyncTargetEl) {
            githubSyncTargetEl.textContent = `Публикация: ${config.owner}/${config.repo} -> ${config.branch}:${config.path}`;
        }
        return config;
    }

    function uint8ToBase64(bytes) {
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }
        return btoa(binary);
    }

    function base64ToText(base64) {
        const cleaned = String(base64 || '').replace(/\s+/g, '');
        const binary = atob(cleaned);
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    }

    function getContentFormat(filePath) {
        const normalizedPath = String(filePath || '').trim();
        if (HTML_PATH_PATTERN.test(normalizedPath)) return 'html';
        if (JS_PATH_PATTERN.test(normalizedPath)) return 'js';
        if (JSON_PATH_PATTERN.test(normalizedPath)) return 'json';
        return 'json';
    }

    function buildEmbeddedSiteDataBlock(data, format) {
        const normalized = normalizeData(data);
        const json = JSON.stringify(normalized, null, 4);

        if (format === 'html') {
            const indentedJson = json
                .split('\n')
                .map((line, index) => (index === 0 ? line : ('        ' + line)))
                .join('\n');
            return [
                '        ' + SITE_DATA_BLOCK_START,
                '        const DEFAULT_SITE_DATA = ' + indentedJson + ';',
                '        ' + SITE_DATA_BLOCK_END
            ].join('\n');
        }

        if (format === 'js') {
            return [
                SITE_DATA_BLOCK_START,
                'export const DEFAULT_SITE_DATA = ' + json + ';',
                SITE_DATA_BLOCK_END
            ].join('\n');
        }

        return json;
    }

    function injectEmbeddedSiteData(content, data, format) {
        if (format === 'json') {
            return JSON.stringify(normalizeData(data), null, 4);
        }

        if (!SITE_DATA_BLOCK_PATTERN.test(content)) {
            throw new Error('В целевом файле не найден блок данных сайта.');
        }

        return content.replace(SITE_DATA_BLOCK_PATTERN, buildEmbeddedSiteDataBlock(data, format));
    }

    function describeGitHubTokenAccessError(status, errorText, config) {
        const text = String(errorText || '');
        if (status === 403 && /Resource not accessible by personal access token/i.test(text)) {
            return [
                `Токен не имеет доступа к ${config.owner}/${config.repo}.`,
                `Если это fine-grained token, укажи Resource owner = ${config.owner},`,
                `Repository access = ${config.repo}, Permissions -> Contents: Read and write.`,
                'Если это classic token, нужен scope repo.'
            ].join(' ');
        }
        return null;
    }

    function buildGitHubContentsApiUrl(config, repoPath) {
        return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${repoPath.split('/').map(encodeURIComponent).join('/')}`;
    }

    function buildGitHubHeaders(token) {
        return {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async function fetchGitHubFileEntry(config, headers, repoPath) {
        const apiUrl = buildGitHubContentsApiUrl(config, repoPath);
        const response = await fetch(apiUrl + `?ref=${encodeURIComponent(config.branch)}`, { headers });

        if (response.ok) {
            return {
                apiUrl,
                entry: await response.json()
            };
        }

        if (response.status === 404) {
            return {
                apiUrl,
                entry: null
            };
        }

        const errorText = await response.text();
        const accessHint = describeGitHubTokenAccessError(response.status, errorText, config);
        if (accessHint) {
            throw new Error(accessHint);
        }
        throw new Error('Не удалось прочитать целевой файл: ' + errorText);
    }

    async function upsertGitHubRepoFile(config, token, repoPath, bytes, message) {
        const headers = buildGitHubHeaders(token);
        const { apiUrl, entry } = await fetchGitHubFileEntry(config, headers, repoPath);
        const payload = {
            message,
            content: uint8ToBase64(bytes),
            branch: config.branch
        };

        if (entry?.sha) {
            payload.sha = entry.sha;
        }

        const putResponse = await fetch(apiUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });

        if (!putResponse.ok) {
            const errorText = await putResponse.text();
            const accessHint = describeGitHubTokenAccessError(putResponse.status, errorText, config);
            if (accessHint) {
                throw new Error(accessHint);
            }
            throw new Error('GitHub не принял обновление: ' + errorText);
        }

        return putResponse.json();
    }

    async function uploadPendingProductFiles(config, token, data) {
        const uploads = getPendingUploads();
        if (!uploads.size) {
            return normalizeData(data);
        }

        const normalized = normalizeData(data);
        for (const product of normalized.products) {
            const upload = uploads.get(product.id);
            if (!upload) continue;

            const bytes = new Uint8Array(await upload.file.arrayBuffer());
            const repoPath = buildRepoAssetPath(config, upload.relativePath);
            await upsertGitHubRepoFile(
                config,
                token,
                repoPath,
                bytes,
                `Upload ${upload.originalName} for ${product.title}`
            );
            product.downloadUrl = './' + upload.relativePath;
        }

        return normalized;
    }

    async function saveToGitHub(data) {
        const config = resolveGitHubConfig();
        const token = githubTokenEl?.value.trim() || '';
        if (!config.owner || !config.repo || !config.branch || !config.path) {
            throw new Error('Не удалось определить репозиторий GitHub для публикации.');
        }
        if (!token) {
            throw new Error('Для сохранения в GitHub нужен token.');
        }

        const normalizedPath = config.path.replace(/\\/g, '/');
        const format = getContentFormat(normalizedPath);
        const headers = buildGitHubHeaders(token);
        const normalizedWithUploads = await uploadPendingProductFiles(config, token, data);
        const { entry } = await fetchGitHubFileEntry(config, headers, normalizedPath);

        if (!entry && format !== 'json') {
            throw new Error('Целевой файл данных не найден в репозитории.');
        }

        const nextContentText = format === 'json'
            ? injectEmbeddedSiteData('', normalizedWithUploads, format)
            : injectEmbeddedSiteData(base64ToText(entry?.content || ''), normalizedWithUploads, format);
        const contentBytes = new TextEncoder().encode(nextContentText);
        await upsertGitHubRepoFile(
            config,
            token,
            normalizedPath,
            contentBytes,
            'Update Aleph Studio site content'
        );

        clearPendingUploads();
        renderProductUploadMeta();
        syncDraftControls();
        return normalizedWithUploads;
    }

    return {
        renderGitHubSyncTarget,
        saveToGitHub,
        resolveGitHubConfig
    };
}
