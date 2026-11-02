import { WordEntry, PartOfSpeech } from '../types/word';

export interface FetchedWordData {
  word: string;
  phonetic: string;
  audioUrl?: string;
  partOfSpeech: PartOfSpeech;
  meaningEn: string;
  meaningViSuggestion: string;
  examples: Array<{ en: string; vi?: string }>;
  synonyms: string[];
  antonyms: string[];
}

/**
 * Clean and convert word into a safe slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Queries Free Dictionary API for English definitions, phonetics, and audio mp3
 */
export async function fetchFromFreeDictionary(queryWord: string): Promise<FetchedWordData | null> {
  const cleanWord = queryWord.trim().toLowerCase();
  if (!cleanWord) return null;

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];

    // Extract IPA phonetic
    let phonetic = entry.phonetic || '';
    let audioUrl = '';

    if (Array.isArray(entry.phonetics)) {
      for (const p of entry.phonetics) {
        if (!phonetic && p.text) {
          phonetic = p.text;
        }
        if (!audioUrl && p.audio) {
          // Prefer US or UK audio mp3
          const audio = p.audio.startsWith('http') ? p.audio : `https:${p.audio}`;
          if (audio.endsWith('.mp3')) {
            audioUrl = audio;
          }
        }
      }
    }

    if (!phonetic) {
      phonetic = `/${cleanWord}/`;
    }

    // Extract primary meaning & definitions
    let partOfSpeech: PartOfSpeech = 'noun';
    let meaningEn = '';
    const examples: Array<{ en: string; vi?: string }> = [];
    const synonyms: string[] = [];
    const antonyms: string[] = [];

    if (Array.isArray(entry.meanings) && entry.meanings.length > 0) {
      const primary = entry.meanings[0];
      const pos = (primary.partOfSpeech || 'noun').toLowerCase();

      if (['noun', 'verb', 'adjective', 'adverb', 'idiom', 'phrasal verb', 'preposition', 'phrase'].includes(pos)) {
        partOfSpeech = pos as PartOfSpeech;
      }

      if (Array.isArray(primary.definitions) && primary.definitions.length > 0) {
        meaningEn = primary.definitions[0].definition || '';
        for (const def of primary.definitions) {
          if (def.example && examples.length < 3) {
            examples.push({ en: def.example });
          }
        }
      }

      if (Array.isArray(primary.synonyms)) {
        synonyms.push(...primary.synonyms.slice(0, 6));
      }
      if (Array.isArray(primary.antonyms)) {
        antonyms.push(...primary.antonyms.slice(0, 6));
      }
    }

    if (examples.length === 0) {
      examples.push({ en: `Example with the word "${cleanWord}".` });
    }

    return {
      word: cleanWord,
      phonetic,
      audioUrl: audioUrl || undefined,
      partOfSpeech,
      meaningEn,
      meaningViSuggestion: '',
      examples,
      synonyms,
      antonyms,
    };
  } catch (error) {
    console.error('Error fetching dictionary data:', error);
    return null;
  }
}

/**
 * Builds a valid WordEntry object from user input
 */
export function createWordEntry(params: {
  word: string;
  phonetic: string;
  audio?: string;
  partOfSpeech: PartOfSpeech;
  meaningVi: string;
  meaningEn: string;
  examples: Array<{ en: string; vi?: string }>;
  tags?: string[];
  level?: string;
  notes?: string;
  synonyms?: string[];
  antonyms?: string[];
  collocations?: string[];
}): WordEntry {
  const slug = slugify(params.word);
  return {
    id: slug,
    word: params.word.trim(),
    phonetic: params.phonetic.trim() || `/${params.word.trim()}/`,
    audio: params.audio?.trim() || undefined,
    partOfSpeech: params.partOfSpeech,
    meaningVi: params.meaningVi.trim(),
    meaningEn: params.meaningEn.trim(),
    examples: params.examples.filter(e => e.en.trim().length > 0),
    tags: params.tags && params.tags.length > 0 ? params.tags : ['General'],
    level: (params.level as any) || 'B2',
    notes: params.notes?.trim() || undefined,
    synonyms: params.synonyms && params.synonyms.length > 0 ? params.synonyms : undefined,
    antonyms: params.antonyms && params.antonyms.length > 0 ? params.antonyms : undefined,
    collocations: params.collocations && params.collocations.length > 0 ? params.collocations : undefined,
    dateAdded: new Date().toISOString().split('T')[0],
  };
}
