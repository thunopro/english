import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { WordEntry } from '../src/types/word';

describe('data/words.json Integrity', () => {
  const filePath = path.resolve(__dirname, '../data/words.json');

  it('exists and is valid JSON array', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf8');
    const words: WordEntry[] = JSON.parse(content);
    expect(Array.isArray(words)).toBe(true);
    expect(words.length).toBeGreaterThanOrEqual(20);
  });

  it('all words have required fields and no duplicate ids', () => {
    const content = fs.readFileSync(filePath, 'utf8');
    const words: WordEntry[] = JSON.parse(content);
    const seenIds = new Set<string>();

    words.forEach((w) => {
      expect(w.id).toBeTruthy();
      expect(seenIds.has(w.id)).toBe(false);
      seenIds.add(w.id);

      expect(w.word).toBeTruthy();
      expect(w.phonetic).toBeTruthy();
      expect(w.meaningVi).toBeTruthy();
      expect(w.meaningEn).toBeTruthy();
      expect(Array.isArray(w.examples)).toBe(true);
      expect(w.examples.length).toBeGreaterThan(0);
      expect(w.examples[0].en).toBeTruthy();
    });
  });
});
