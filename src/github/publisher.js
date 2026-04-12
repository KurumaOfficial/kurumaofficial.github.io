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
        binary += String.fromCharCode(...chunk);
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
        return `The provided password does not have permission to publish to ${config.owner}/${config.repo}. Check the access settings and try again.`;
    }
    return null;
}

function buildGitHubContentsApiUrl(config, repoPath) {
    return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${repoPath
        .split('/')
        .map(encodeURIComponent)
        .join('/')}`;
}

function buildGitHubRepoApiUrl(config, suffix) {
    return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}${suffix}`;
}

function buildGitHubRefPath(branch) {
    return `heads/${String(branch || '')
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

async function readGitHubError(response) {
    const fallbackText = await response.text();
    if (!fallbackText) return '';

    try {
        const parsed = JSON.parse(fallbackText);
        return parsed?.message || fallbackText;
    } catch {
        return fallbackText;
    }
}

async function githubRequestJson(url, options, config, fallbackMessage) {
    const response = await fetch(url, options);
    if (response.ok) {
        if (response.status === 204) return null;
        return response.json();
    }

    const errorText = await readGitHubError(response);
    const accessHint = describeGitHubTokenAccessError(response.status, errorText, config);
    if (accessHint) throw new Error(accessHint);

    throw new Error(errorText ? `${fallbackMessage}: ${errorText}` : fallbackMessage);
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

function buildPublishCommitMessage(uploadCount) {
    if (uploadCount > 0) {
        return `Update Aleph Studio site content (${uploadCount} asset${uploadCount === 1 ? '' : 's'})`;
    }

    return 'Update Aleph Studio site content';
}

function applyPendingUploadsToData(data, uploads) {
    const normalized = normalizeData(data);
    const files = [];

    for (const product of normalized.products) {
        const upload = uploads.get(product.id);
        if (!upload) continue;

        const repoPath = buildRepoAssetPath(upload.relativePath);
        product.downloadUrl = `./${upload.relativePath}`;
        files.push({
            path: repoPath,
            file: upload.file,
        });
    }

    return {
        normalized,
        files,
    };
}

async function fetchBranchCommitState(config, headers) {
    const refPath = buildGitHubRefPath(config.branch);
    const refUrl = buildGitHubRepoApiUrl(config, `/git/ref/${refPath}`);
    const refData = await githubRequestJson(refUrl, { headers }, config, 'Could not read target branch reference');
    const commitSha = refData?.object?.sha;

    if (!commitSha) {
        throw new Error('Target branch does not have a readable commit SHA.');
    }

    const commitUrl = buildGitHubRepoApiUrl(config, `/git/commits/${encodeURIComponent(commitSha)}`);
    const commitData = await githubRequestJson(commitUrl, { headers }, config, 'Could not read target branch commit');
    const treeSha = commitData?.tree?.sha;

    if (!treeSha) {
        throw new Error('Target branch commit does not have a readable tree SHA.');
    }

    return {
        commitSha,
        treeSha,
        refPath,
    };
}

async function createGitHubBlob(config, headers, bytes) {
    const blobUrl = buildGitHubRepoApiUrl(config, '/git/blobs');
    const blob = await githubRequestJson(blobUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            content: uint8ToBase64(bytes),
            encoding: 'base64',
        }),
    }, config, 'Could not create GitHub blob');

    if (!blob?.sha) {
        throw new Error('GitHub blob response did not include a SHA.');
    }

    return blob.sha;
}

async function commitRepoFilesAtomically(config, token, files, message) {
    const headers = buildGitHubHeaders(token);
    const { commitSha, treeSha, refPath } = await fetchBranchCommitState(config, headers);

    const treeEntries = await Promise.all(files.map(async (file) => {
        const bytes = file.bytes instanceof Uint8Array
            ? file.bytes
            : new Uint8Array(await file.file.arrayBuffer());
        const blobSha = await createGitHubBlob(config, headers, bytes);
        return {
            path: file.path,
            mode: '100644',
            type: 'blob',
            sha: blobSha,
        };
    }));

    const treeUrl = buildGitHubRepoApiUrl(config, '/git/trees');
    const treeData = await githubRequestJson(treeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            base_tree: treeSha,
            tree: treeEntries,
        }),
    }, config, 'Could not create GitHub tree');

    if (!treeData?.sha) {
        throw new Error('GitHub tree response did not include a SHA.');
    }

    const commitUrl = buildGitHubRepoApiUrl(config, '/git/commits');
    const commitData = await githubRequestJson(commitUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            message,
            tree: treeData.sha,
            parents: [commitSha],
        }),
    }, config, 'Could not create GitHub commit');

    if (!commitData?.sha) {
        throw new Error('GitHub commit response did not include a SHA.');
    }

    const updateRefUrl = buildGitHubRepoApiUrl(config, `/git/refs/${refPath}`);
    await githubRequestJson(updateRefUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
            sha: commitData.sha,
            force: false,
        }),
    }, config, 'Could not update the publish branch');
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

    async function saveToGitHub(data) {
        const config = resolveGitHubConfig();
        const token = githubTokenEl?.value.trim() || '';

        if (!config.owner || !config.repo || !config.branch || !config.path) {
            throw new Error(getMessage('githubTargetMissing', 'Could not determine the GitHub repository for publishing.'));
        }
        if (!token) {
            throw new Error(getMessage('githubTokenRequired', 'A password is required to save.'));
        }

        const normalizedPath = config.path.replace(/\\/g, '/');
        const format = getContentFormat(normalizedPath);
        const headers = buildGitHubHeaders(token);
        const { entry } = await fetchGitHubFileEntry(config, headers, normalizedPath);
        const uploads = getPendingUploads();
        const { normalized: normalizedWithUploads, files: uploadFiles } = applyPendingUploadsToData(data, uploads);

        if (!entry && format !== 'json') {
            throw new Error('Target data file not found in the repository.');
        }

        if (format !== 'json' && !entry?.content) {
            throw new Error('Target data file exists but has no content (file may exceed GitHub API size limit).');
        }

        const nextContentText = format === 'json'
            ? injectEmbeddedSiteData('', normalizedWithUploads, format)
            : injectEmbeddedSiteData(base64ToText(entry.content), normalizedWithUploads, format);

        const filesToCommit = [
            {
                path: normalizedPath,
                bytes: new TextEncoder().encode(nextContentText),
            },
            ...uploadFiles,
        ];

        await commitRepoFilesAtomically(
            config,
            token,
            filesToCommit,
            buildPublishCommitMessage(uploadFiles.length),
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
