import { WordEntry, FilterOptions, UserProgressData } from '../types/word';

export function filterAndSortWords(
  words: WordEntry[],
  progress: UserProgressData,
  options: FilterOptions
): WordEntry[] {
  const q = options.search.trim().toLowerCase();

  return words
    .filter((w) => {
      // 1. Text Search
      if (q) {
        const matchWord = w.word.toLowerCase().includes(q);
        const matchVi = w.meaningVi.toLowerCase().includes(q);
        const matchEn = w.meaningEn.toLowerCase().includes(q);
        const matchPhonetic = w.phonetic.toLowerCase().includes(q);
        const matchNotes = w.notes ? w.notes.toLowerCase().includes(q) : false;
        const matchTags = w.tags ? w.tags.some(t => t.toLowerCase().includes(q)) : false;
        const matchSynonyms = w.synonyms ? w.synonyms.some(s => s.toLowerCase().includes(q)) : false;

        if (!matchWord && !matchVi && !matchEn && !matchPhonetic && !matchNotes && !matchTags && !matchSynonyms) {
          return false;
        }
      }

      // 2. Tag filter
      if (options.tag && options.tag !== 'all') {
        if (!w.tags || !w.tags.includes(options.tag)) {
          return false;
        }
      }

      // 3. Part of speech filter
      if (options.partOfSpeech && options.partOfSpeech !== 'all') {
        if (w.partOfSpeech !== options.partOfSpeech) {
          return false;
        }
      }

      // 4. CEFR Level filter
      if (options.level && options.level !== 'all') {
        if (w.level !== options.level) {
          return false;
        }
      }

      // 5. Favorite only
      const srs = progress[w.id];
      if (options.favoriteOnly) {
        if (!srs || !srs.isFavorite) {
          return false;
        }
      }

      // 6. Mastery status filter
      if (options.mastery && options.mastery !== 'all') {
        const status = srs ? srs.status : 'new';
        if (status !== options.mastery) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      switch (options.sortBy) {
        case 'alpha-asc':
          return a.word.localeCompare(b.word);
        case 'alpha-desc':
          return b.word.localeCompare(a.word);
        case 'dateAdded-asc':
          return (a.dateAdded || '').localeCompare(b.dateAdded || '');
        case 'dateAdded-desc':
          return (b.dateAdded || '').localeCompare(a.dateAdded || '');
        case 'dueDate-asc': {
          const dueA = progress[a.id]?.dueDate || '9999';
          const dueB = progress[b.id]?.dueDate || '9999';
          return dueA.localeCompare(dueB);
        }
        default:
          return 0;
      }
    });
}

/**
 * Collect unique list of all tags present in the vocabulary
 */
export function getAllTags(words: WordEntry[]): string[] {
  const set = new Set<string>();
  words.forEach(w => {
    if (Array.isArray(w.tags)) {
      w.tags.forEach(t => set.add(t));
    }
  });
  return Array.from(set).sort();
}
