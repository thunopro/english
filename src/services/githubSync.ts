import { WordEntry } from '../types/word';

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

const STORAGE_KEY = 'vocab_github_sync_config';

export function getGitHubConfig(): GitHubSyncConfig | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveGitHubConfig(config: GitHubSyncConfig): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
}

export function clearGitHubConfig(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Commits updated words.json directly to GitHub via the GitHub REST API
 */
export async function commitWordsToGitHub(
  words: WordEntry[],
  commitMessage: string,
  config: GitHubSyncConfig
): Promise<{ success: boolean; message: string; sha?: string }> {
  try {
    const path = 'data/words.json';
    const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;

    // 1. Get current file SHA
    let currentSha: string | undefined;
    const getRes = await fetch(`${apiUrl}?ref=${config.branch}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const existingData = await getRes.json();
      currentSha = existingData.sha;
    }

    // 2. Prepare JSON content encoded in UTF-8 base64
    const jsonStr = JSON.stringify(words, null, 2);
    // Browser compatible base64 encoding with utf-8 support
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    utf8Bytes.forEach(b => (binary += String.fromCharCode(b)));
    const base64Content = btoa(binary);

    // 3. Put commit
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: currentSha,
        branch: config.branch,
      }),
    });

    if (!putRes.ok) {
      const errData = await putRes.json();
      return {
        success: false,
        message: `GitHub API error (${putRes.status}): ${errData.message || putRes.statusText}`,
      };
    }

    const resData = await putRes.json();
    return {
      success: true,
      message: `Đã commit thành công lên GitHub (${resData.commit?.sha?.substring(0, 7) || 'OK'})! GitHub Pages sẽ tự động cập nhật sau vài giây.`,
      sha: resData.commit?.sha,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Lỗi kết nối GitHub: ${err.message}`,
    };
  }
}
