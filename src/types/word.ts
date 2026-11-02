export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'idiom'
  | 'phrasal verb'
  | 'preposition'
  | 'phrase'
  | 'other';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ExampleSentence {
  en: string;
  vi?: string;
}

export interface WordEntry {
  id: string;                      // Unique slug (e.g., 'resilient')
  word: string;                    // Word, idiom or phrase
  phonetic: string;                // IPA e.g. /rɪˈzɪl.jənt/
  audio?: string;                  // Direct MP3 URL or relative audio path
  partOfSpeech: PartOfSpeech;
  meaningVi: string;               // Vietnamese definition / meaning
  meaningEn: string;               // English definition
  examples: ExampleSentence[];     // Example sentences with translation
  synonyms?: string[];             // Synonyms
  antonyms?: string[];             // Antonyms
  collocations?: string[];         // Common collocations / phrases
  tags?: string[];                 // E.g., ['IELTS', 'C1', 'Work', 'Emotion']
  level?: CEFRLevel;               // CEFR difficulty level
  notes?: string;                  // Personal notes, mnemonics, usage warnings
  dateAdded: string;               // ISO date string e.g. '2026-11-02'
  source?: string;                 // Source: Book, Movie, Podcast, Article
}

export type MasteryStatus = 'new' | 'learning' | 'reviewing' | 'mastered';

export interface SRSState {
  status: MasteryStatus;
  interval: number;         // Current interval in days
  easeFactor: number;       // SuperMemo SM-2 ease factor (starts at 2.5)
  repetitions: number;      // Successful review streak
  dueDate: string;          // ISO Date when word is due for review
  lastReviewed?: string;    // ISO Date of last review
  timesCorrect: number;     // Total times answered correctly
  timesIncorrect: number;   // Total times failed
  isFavorite?: boolean;     // Starred / Bookmarked
}

export type SRSGrade = 1 | 2 | 3 | 4;
// 1 = Again / Fail
// 2 = Hard
// 3 = Good
// 4 = Easy

export interface UserProgressData {
  [wordId: string]: SRSState;
}

export type ViewMode = 'bank' | 'flashcards' | 'quiz' | 'text-list';

export interface FilterOptions {
  search: string;
  tag: string;
  partOfSpeech: string;
  mastery: string;
  level: string;
  favoriteOnly: boolean;
  sortBy: 'dateAdded-desc' | 'dateAdded-asc' | 'alpha-asc' | 'alpha-desc' | 'dueDate-asc';
}
