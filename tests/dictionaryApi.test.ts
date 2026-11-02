import { describe, it, expect } from 'vitest';
import { slugify, createWordEntry } from '../src/services/dictionaryApi';

describe('dictionaryApi Utilities', () => {
  it('slugifies words correctly', () => {
    expect(slugify('Resilience')).toBe('resilience');
    expect(slugify('Take into account')).toBe('take-into-account');
    expect(slugify('State-of-the-art!')).toBe('state-of-the-art');
    expect(slugify('   hello   world   ')).toBe('hello-world');
  });

  it('createWordEntry produces complete WordEntry object with defaults', () => {
    const entry = createWordEntry({
      word: 'Perseverance',
      phonetic: '/ˌpɜː.sɪˈvɪə.rəns/',
      audio: 'https://example.com/audio.mp3',
      partOfSpeech: 'noun',
      meaningVi: 'Sự kiên trì, bền bỉ',
      meaningEn: 'Persistence in doing something despite difficulty',
      examples: [{ en: 'Through hard work and perseverance, he succeeded.' }],
      tags: ['Mindset', 'B2'],
      level: 'B2',
      notes: 'Important IELTS vocabulary',
    });

    expect(entry.id).toBe('perseverance');
    expect(entry.word).toBe('Perseverance');
    expect(entry.phonetic).toBe('/ˌpɜː.sɪˈvɪə.rəns/');
    expect(entry.audio).toBe('https://example.com/audio.mp3');
    expect(entry.partOfSpeech).toBe('noun');
    expect(entry.meaningVi).toBe('Sự kiên trì, bền bỉ');
    expect(entry.tags).toEqual(['Mindset', 'B2']);
    expect(entry.dateAdded).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('handles fallback defaults when optional fields are missing', () => {
    const entry = createWordEntry({
      word: 'test',
      phonetic: '',
      partOfSpeech: 'verb',
      meaningVi: 'Kiểm tra',
      meaningEn: 'Take measures to check quality',
      examples: [],
    });

    expect(entry.phonetic).toBe('/test/');
    expect(entry.tags).toEqual(['General']);
    expect(entry.level).toBe('B2');
    expect(entry.audio).toBeUndefined();
  });
});
