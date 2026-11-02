import { describe, it, expect, beforeEach } from 'vitest';
import { getGitHubConfig, saveGitHubConfig, clearGitHubConfig } from '../src/services/githubSync';

// Mock localStorage for node environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: storageMock,
  writable: true,
});

describe('githubSync Configuration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no configuration is stored', () => {
    expect(getGitHubConfig()).toBeNull();
  });

  it('saves and retrieves GitHub configuration', () => {
    const config = {
      owner: 'luongminhthu',
      repo: 'english',
      branch: 'main',
      token: 'ghp_secret_token_123',
    };

    saveGitHubConfig(config);
    expect(getGitHubConfig()).toEqual(config);
  });

  it('clears GitHub configuration cleanly', () => {
    saveGitHubConfig({
      owner: 'test',
      repo: 'repo',
      branch: 'main',
      token: 'token',
    });
    expect(getGitHubConfig()).not.toBeNull();

    clearGitHubConfig();
    expect(getGitHubConfig()).toBeNull();
  });
});
