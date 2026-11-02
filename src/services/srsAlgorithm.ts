import { SRSState, SRSGrade, MasteryStatus } from '../types/word';

export const INITIAL_EASE_FACTOR = 2.5;

/**
 * Creates default SRS state for a newly added word.
 */
export function createDefaultSRSState(wordId?: string): SRSState {
  return {
    status: 'new',
    interval: 0,
    easeFactor: INITIAL_EASE_FACTOR,
    repetitions: 0,
    dueDate: new Date().toISOString(),
    timesCorrect: 0,
    timesIncorrect: 0,
    isFavorite: false,
  };
}

/**
 * SuperMemo SM-2 Spaced Repetition calculation
 * @param current Current SRSState
 * @param grade Review performance: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @returns Updated SRSState with new interval and dueDate
 */
export function calculateNextSRS(current: SRSState, grade: SRSGrade, now = new Date()): SRSState {
  const isCorrect = grade >= 2;
  const timesCorrect = current.timesCorrect + (isCorrect ? 1 : 0);
  const timesIncorrect = current.timesIncorrect + (isCorrect ? 0 : 1);

  let interval = current.interval;
  let repetitions = current.repetitions;
  let easeFactor = current.easeFactor;
  let status: MasteryStatus = current.status;

  if (grade === 1) {
    // Again / Failed
    repetitions = 0;
    interval = 1;
    status = 'learning';
    // Decrease ease factor slightly
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    // Correct response (Hard, Good, Easy)
    if (repetitions === 0) {
      interval = grade === 4 ? 2 : 1;
    } else if (repetitions === 1) {
      interval = grade === 4 ? 5 : (grade === 2 ? 2 : 3);
    } else {
      let multiplier = easeFactor;
      if (grade === 2) {
        multiplier = Math.max(1.2, easeFactor * 0.85);
      } else if (grade === 4) {
        multiplier = easeFactor * 1.3;
      }
      interval = Math.round(interval * multiplier);
    }

    repetitions += 1;

    // Adjust ease factor based on SM-2 formula
    // grade: 2 -> q=3, 3 -> q=4, 4 -> q=5
    const q = grade + 1;
    const efDelta = 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02);
    easeFactor = Math.max(1.3, easeFactor + efDelta);

    if (interval >= 21) {
      status = 'mastered';
    } else if (interval >= 7) {
      status = 'reviewing';
    } else {
      status = 'learning';
    }
  }

  // Calculate new due date
  const nextDate = new Date(now.getTime());
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    ...current,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    repetitions,
    status,
    dueDate: nextDate.toISOString(),
    lastReviewed: now.toISOString(),
    timesCorrect,
    timesIncorrect,
  };
}

/**
 * Checks if a word is due for review today.
 */
export function isWordDue(srsState?: SRSState, now = new Date()): boolean {
  if (!srsState) return true;
  if (srsState.status === 'new') return true;
  const dueDate = new Date(srsState.dueDate);
  return dueDate <= now;
}
