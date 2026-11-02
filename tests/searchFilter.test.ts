import { describe, it, expect } from 'vitest';
import { filterAndSortWords, getAllTags } from '../src/utils/searchFilter';
import { WordEntry, FilterOptions, UserProgressData } from '../src/types/word';

const mockWords: WordEntry[] = [
  {
    id: 'resilient',
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    meaningVi: 'Kiên cường, có khả năng phục hồi nhanh chóng',
    meaningEn: 'Able to withstand or recover quickly from difficult conditions',
    examples: [{ en: 'She is a resilient leader.' }],
    tags: ['IELTS', 'Psychology'],
    level: 'B2',
    dateAdded: '2026-11-01',
  },
  {
    id: 'ubiquitous',
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wə.təs/',
    partOfSpeech: 'adjective',
    meaningVi: 'Phổ biến ở khắp nơi',
    meaningEn: 'Present, appearing, or found everywhere',
    examples: [{ en: 'Smartphones are ubiquitous.' }],
    tags: ['IELTS', 'Technology'],
    level: 'C1',
    dateAdded: '2026-11-02',
  },
  {
    id: 'catalyst',
    word: 'catalyst',
    phonetic: '/ˈkæt̬.əl.ɪst/',
    partOfSpeech: 'noun',
    meaningVi: 'Chất xúc tác, nhân tố kích hoạt thay đổi',
    meaningEn: 'A person or thing that precipitates an event',
    examples: [{ en: 'A catalyst for reform.' }],
    tags: ['Business', 'Science'],
    level: 'C1',
    dateAdded: '2026-10-30',
  },
];

const mockProgress: UserProgressData = {
  resilient: {
    status: 'learning',
    interval: 3,
    easeFactor: 2.5,
    repetitions: 2,
    dueDate: '2026-11-05',
    timesCorrect: 2,
    timesIncorrect: 0,
    isFavorite: true,
  },
  ubiquitous: {
    status: 'mastered',
    interval: 25,
    easeFactor: 2.7,
    repetitions: 6,
    dueDate: '2026-11-28',
    timesCorrect: 6,
    timesIncorrect: 0,
    isFavorite: false,
  },
};

describe('Search and Filter Engine', () => {
  const baseOptions: FilterOptions = {
    search: '',
    tag: 'all',
    partOfSpeech: 'all',
    mastery: 'all',
    level: 'all',
    favoriteOnly: false,
    sortBy: 'dateAdded-desc',
  };

  it('searches by word text correctly', () => {
    const res = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, search: 'ubiq' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('ubiquitous');
  });

  it('searches by Vietnamese definition correctly', () => {
    const res = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, search: 'kiên cường' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('resilient');
  });

  it('filters by Tag correctly', () => {
    const res = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, tag: 'IELTS' });
    expect(res).toHaveLength(2);
  });

  it('filters by Part of Speech', () => {
    const res = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, partOfSpeech: 'noun' });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('catalyst');
  });

  it('filters by Favorites', () => {
    const res = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, favoriteOnly: true });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('resilient');
  });

  it('sorts alphabetically A-Z and Z-A', () => {
    const asc = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, sortBy: 'alpha-asc' });
    expect(asc[0].id).toBe('catalyst');
    expect(asc[2].id).toBe('ubiquitous');

    const desc = filterAndSortWords(mockWords, mockProgress, { ...baseOptions, sortBy: 'alpha-desc' });
    expect(desc[0].id).toBe('ubiquitous');
    expect(desc[2].id).toBe('catalyst');
  });

  it('collects all unique tags', () => {
    const tags = getAllTags(mockWords);
    expect(tags).toContain('IELTS');
    expect(tags).toContain('Business');
    expect(tags).toContain('Technology');
    expect(tags).toContain('Psychology');
    expect(tags).toContain('Science');
  });
});
