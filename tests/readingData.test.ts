import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  READING_PASSAGE,
  MATCHING_QUESTIONS,
  SUMMARY_OPTIONS,
  SUMMARY_BLANKS,
  TFNG_QUESTIONS,
  PEARLS_DOC_URL,
  GITHUB_REPO_URL
} from '../src/data/pearlsReading';
import { WordEntry } from '../src/types/word';

describe('Reading 01 Pearls Data & Quiz Integrity', () => {
  it('has valid passage structure with 7 paragraphs (A through G)', () => {
    expect(READING_PASSAGE.paragraphs.length).toBe(7);
    const expectedIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    READING_PASSAGE.paragraphs.forEach((p, index) => {
      expect(p.id).toBe(expectedIds[index]);
      expect(p.text.length).toBeGreaterThan(100);
    });
  });

  it('all vocabNotes correspond to words in data/words.json', () => {
    const wordsFilePath = path.resolve(__dirname, '../data/words.json');
    const words: WordEntry[] = JSON.parse(fs.readFileSync(wordsFilePath, 'utf8'));
    const wordIdSet = new Set(words.map((w) => w.id));

    READING_PASSAGE.paragraphs.forEach((p) => {
      p.vocabNotes.forEach((v) => {
        expect(wordIdSet.has(v.wordId)).toBe(true);
        expect(v.meaningVi).toBeTruthy();
        expect(v.term).toBeTruthy();
      });
    });
  });

  it('matching questions 1-4 are valid and point to existing paragraphs', () => {
    expect(MATCHING_QUESTIONS.length).toBe(4);
    const paragraphIds = new Set(READING_PASSAGE.paragraphs.map((p) => p.id));
    MATCHING_QUESTIONS.forEach((q) => {
      expect(q.id).toBeGreaterThanOrEqual(1);
      expect(q.id).toBeLessThanOrEqual(4);
      expect(paragraphIds.has(q.answer)).toBe(true);
      expect(q.explanation.length).toBeGreaterThan(10);
    });
  });

  it('summary completion questions 5-10 have valid options', () => {
    expect(SUMMARY_BLANKS.length).toBe(6);
    const optionCodes = new Set(SUMMARY_OPTIONS.map((o) => o.code));
    SUMMARY_BLANKS.forEach((b) => {
      expect(b.id).toBeGreaterThanOrEqual(5);
      expect(b.id).toBeLessThanOrEqual(10);
      expect(optionCodes.has(b.answer)).toBe(true);
      expect(b.explanation.length).toBeGreaterThan(10);
    });
  });

  it('TFNG questions 11-13 have valid answers and explanations', () => {
    expect(TFNG_QUESTIONS.length).toBe(3);
    const validChoices = new Set(['TRUE', 'FALSE', 'NOT GIVEN']);
    TFNG_QUESTIONS.forEach((q) => {
      expect(q.id).toBeGreaterThanOrEqual(11);
      expect(q.id).toBeLessThanOrEqual(13);
      expect(validChoices.has(q.answer)).toBe(true);
      expect(q.explanation.length).toBeGreaterThan(10);
    });
  });

  it('contains verified URLs for Google Docs and GitHub repo', () => {
    expect(PEARLS_DOC_URL).toContain('docs.google.com/document');
    expect(GITHUB_REPO_URL).toBe('https://github.com/thunopro/english');
  });
});
