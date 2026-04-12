import { GITHUB_CONFIG, DATA_MARKERS } from '../core/constants.js';
import { normalizeData } from '../core/data-utils.js';

const HTML_PATH_PATTERN = /\.html?$/i;
const JS_PATH_PATTERN = /\.js$/i;
const JSON_PATH_PATTERN = /\.json$/i;

function buildRepoAssetPath(relativePath) {
    return String(relativePath || '')
        .trim()
        .replace(/\\/g, '/')
        .replace(/^\.\//, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function resolveGitHubConfig() {
    return {
        owner: String(GITHUB_CONFIG.owner || '').trim(),
        repo: String(GITHUB_CONFIG.repo || '').trim(),
        branch: String(GITHUB_CONFIG.branch || 'main').trim() || 'main',
        path: String(GITHUB_CONFIG.dataPath || 'src/data/site-data.js').trim().replace(/\\/g, '/'),
    };
}

function uint8ToBase64(bytes) {
    let binary = '';
    const chunkSize = 0x8000;
    for (let index = 0; index < bytes.length; index += chunkSize) {
        const chunk = bytes.subarray(index, index + chunkSize);
        binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
}

function base64ToText(base64) {
    const cleaned = String(base64 || '').replace(/\s+/g, '');
    if (!cleaned) return '';
    try {
        const binary = atob(cleaned);
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch {
        throw new Error('Failed to decode base64 content from GitHub.');
    }
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
            .map((line, index) => (index === 0 ? line : `        ${line}`))
            .join('\n');
        return [
            `        ${DATA_MARKERS.start}`,
            `        const DEFAULT_SITE_DATA = ${indentedJson};`,
            `        ${DATA_MARKERS.end}`,
        ].join('\n');
    }

    if (format === 'js') {
        return [
            DATA_MARKERS.start,
            `export const DEFAULT_SITE_DATA = ${json};`,
            DATA_MARKERS.end,
        ].join('\n');
    }

    return json;
}

function injectEmbeddedSiteData(content, data, format) {
    if (format === 'json') {
        return JSON.stringify(normalizeData(data), null, 4);
    }

    if (!DATA_MARKERS.pattern.test(content)) {
        throw new Error('Site data block not found in the target file.');
    }

    return content.replace(DATA_MARKERS.pattern, buildEmbeddedSiteDataBlock(data, format));
}

function describeGitHubTokenAccessError(status, errorText, config) {
    const text = String(errorText || '');
    if (status === 403 && /Resource not accessible by personal access token/i.test(text)) {
        return [
            `Token does not have access to ${config.owner}/${config.repo}.`,
            `For a fine-grained token set Resource owner = ${config.owner},`,
            `Repository access = ${config.repo}, Permissions -> Contents: Read and write.`,
            'For a classic token the repo scope is required.',
        ].join(' ');
    }
    return null;
}

function buildGitHubContentsApiUrl(config, repoPath) {
    return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${repoPath
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
}

function buildGitHubHeaders(token) {
    return {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

async function fetchGitHubFileEntry(config, headers, repoPath) {
    const apiUrl = buildGitHubContentsApiUrl(config, repoPath);
    const response = await fetch(`${apiUrl}?ref=${encodeURIComponent(config.branch)}`, { headers });

    if (response.ok) {
        return {
            apiUrl,
            entry: await response.json(),
        };
    }

    if (response.status === 404) {
        return {
            apiUrl,
            entry: null,
        };
    }

    const errorText = await response.text();
    const accessHint = describeGitHubTokenAccessError(response.status, errorText, config);
    if (accessHint) throw new Error(accessHint);
    throw new Error(`Could not read target file: ${errorText}`);
}

async function upsertGitHubRepoFile(config, token, repoPath, bytes, message) {
    const headers = buildGitHubHeaders(token);
    const { apiUrl, entry } = await fetchGitHubFileEntry(config, headers, repoPath);
    const payload = {
        message,
        content: uint8ToBase64(bytes),
        branch: config.branch,
    };

    if (entry?.sha) payload.sha = entry.sha;

    const putResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
    });

    if (!putResponse.ok) {
        const errorText = await putResponse.text();
        const accessHint = describeGitHubTokenAccessError(putResponse.status, errorText, config);
        if (accessHint) throw new Error(accessHint);
        throw new Error(`GitHub rejected the update: ${errorText}`);
    }

    return putResponse.json();
}

export function createGitHubPublisher({ getPendingUploads, clearPendingUploads, renderProductUploadMeta, syncDraftControls, getMessage = (_key, fallback = '') => fallback }) {
    const githubTokenEl = document.getElementById('githubToken');
    const githubSyncTargetEl = document.getElementById('githubSyncTarget');

    function renderGitHubSyncTarget() {
        const config = resolveGitHubConfig();
        if (githubSyncTargetEl) {
            githubSyncTargetEl.textContent = `Publish target: ${config.owner}/${config.repo} -> ${config.branch}:${config.path}`;
        }
        return config;
    }

    async function uploadPendingProductFiles(config, token, data) {
        const uploads = getPendingUploads();
        if (!uploads.size) return normalizeData(data);

        const normalized = normalizeData(data);
        for (const product of normalized.products) {
            const upload = uploads.get(product.id);
            if (!upload) continue;

            const bytes = new Uint8Array(await upload.file.arrayBuffer());
            const repoPath = buildRepoAssetPath(upload.relativePath);
            await upsertGitHubRepoFile(
                config,
                token,
                repoPath,
                bytes,
                `Upload ${upload.originalName} for ${product.title}`,
            );
            product.downloadUrl = `./${upload.relativePath}`;
        }

        return normalized;
    }

    async function saveToGitHub(data) {
        const config = resolveGitHubConfig();
        const token = githubTokenEl?.value.trim() || '';

        if (!config.owner || !config.repo || !config.branch || !config.path) {
            throw new Error(getMessage('githubTargetMissing', 'Could not determine the GitHub repository for publishing.'));
        }
        if (!token) {
            throw new Error(getMessage('githubTokenRequired', 'A GitHub token is required to save.'));
        }

        const normalizedPath = config.path.replace(/\\/g, '/');
        const format = getContentFormat(normalizedPath);
        const headers = buildGitHubHeaders(token);
        const normalizedWithUploads = await uploadPendingProductFiles(config, token, data);
        const { entry } = await fetchGitHubFileEntry(config, headers, normalizedPath);

        if (!entry && format !== 'json') {
            throw new Error('Target data file not found in the repository.');
        }

        if (format !== 'json' && !entry?.content) {
            throw new Error('Target data file exists but has no content (file may exceed GitHub API size limit).');
        }

        const nextContentText = format === 'json'
            ? injectEmbeddedSiteData('', normalizedWithUploads, format)
            : injectEmbeddedSiteData(base64ToText(entry.content), normalizedWithUploads, format);

        await upsertGitHubRepoFile(
            config,
            token,
            normalizedPath,
            new TextEncoder().encode(nextContentText),
            'Update Aleph Studio site content',
        );

        clearPendingUploads();
        renderProductUploadMeta();
        syncDraftControls();
        return normalizedWithUploads;
    }

    return {
        renderGitHubSyncTarget,
        saveToGitHub,
        resolveGitHubConfig,
    };
}
