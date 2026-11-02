import { useState, useEffect, useCallback, useMemo } from 'react';
import { WordEntry, UserProgressData, SRSGrade, SRSState } from '../types/word';
import { useLocalStorage } from './useLocalStorage';
import { calculateNextSRS, createDefaultSRSState, isWordDue } from '../services/srsAlgorithm';

const PROGRESS_STORAGE_KEY = 'vocab_user_progress_v1';
const LOCAL_WORDS_STORAGE_KEY = 'vocab_user_custom_words_v1';

export function useWords() {
  const [canonicalWords, setCanonicalWords] = useState<WordEntry[]>([]);
  const [localWords, setLocalWords] = useLocalStorage<WordEntry[]>(LOCAL_WORDS_STORAGE_KEY, []);
  const [progress, setProgress] = useLocalStorage<UserProgressData>(PROGRESS_STORAGE_KEY, {});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch words.json from public/static route
  useEffect(() => {
    let isMounted = true;
    async function loadWords() {
      setIsLoading(true);
      setError(null);
      try {
        let res = await fetch('/words.json');
        if (!res.ok) {
          res = await fetch('./words.json');
        }
        if (!res.ok) {
          throw new Error(`Failed to fetch words.json: HTTP ${res.status}`);
        }
        const data: WordEntry[] = await res.json();
        if (isMounted) {
          setCanonicalWords(data);
          setIsLoading(false);
        }
      } catch (err: any) {
        console.warn('Could not load ./words.json directly, falling back...', err);
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    }
    loadWords();
    return () => {
      isMounted = false;
    };
  }, []);

  // Merge canonical words from repo with user's local words
  const allWords = useMemo<WordEntry[]>(() => {
    const wordMap = new Map<string, WordEntry>();
    canonicalWords.forEach((w) => wordMap.set(w.id, w));
    localWords.forEach((w) => wordMap.set(w.id, w)); // local words take precedence or add new
    return Array.from(wordMap.values());
  }, [canonicalWords, localWords]);

  // Words that are due for review based on SRS algorithm
  const dueWords = useMemo<WordEntry[]>(() => {
    return allWords.filter((w) => isWordDue(progress[w.id]));
  }, [allWords, progress]);

  // Add new word locally (and available to commit/export)
  const addWord = useCallback((newEntry: WordEntry) => {
    setLocalWords((prev) => {
      const filtered = prev.filter((w) => w.id !== newEntry.id);
      return [newEntry, ...filtered];
    });

    // Initialize SRS state
    setProgress((prev) => ({
      ...prev,
      [newEntry.id]: createDefaultSRSState(newEntry.id),
    }));
  }, [setLocalWords, setProgress]);

  // Delete a locally added word
  const deleteWord = useCallback((wordId: string) => {
    setLocalWords((prev) => prev.filter((w) => w.id !== wordId));
    setProgress((prev) => {
      const next = { ...prev };
      delete next[wordId];
      return next;
    });
  }, [setLocalWords, setProgress]);

  // Record an SRS review rating
  const reviewWord = useCallback((wordId: string, grade: SRSGrade) => {
    setProgress((prev) => {
      const currentSRS: SRSState = prev[wordId] || createDefaultSRSState(wordId);
      const nextSRS = calculateNextSRS(currentSRS, grade);
      return {
        ...prev,
        [wordId]: nextSRS,
      };
    });
  }, [setProgress]);

  // Toggle favorite / bookmark
  const toggleFavorite = useCallback((wordId: string) => {
    setProgress((prev) => {
      const currentSRS: SRSState = prev[wordId] || createDefaultSRSState(wordId);
      return {
        ...prev,
        [wordId]: {
          ...currentSRS,
          isFavorite: !currentSRS.isFavorite,
        },
      };
    });
  }, [setProgress]);

  // Reset all SRS progress (learning stats)
  const resetProgress = useCallback(() => {
    setProgress({});
  }, [setProgress]);

  return {
    words: allWords,
    canonicalWords,
    localWords,
    progress,
    dueWords,
    isLoading,
    error,
    addWord,
    deleteWord,
    reviewWord,
    toggleFavorite,
    resetProgress,
  };
}
