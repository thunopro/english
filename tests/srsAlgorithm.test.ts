import { describe, it, expect } from 'vitest';
import {
  createDefaultSRSState,
  calculateNextSRS,
  isWordDue,
  INITIAL_EASE_FACTOR,
} from '../src/services/srsAlgorithm';
import { SRSState } from '../src/types/word';

describe('SRS Spaced Repetition Algorithm (SM-2)', () => {
  it('creates initial default SRS state correctly', () => {
    const state = createDefaultSRSState('test-word');
    expect(state.status).toBe('new');
    expect(state.interval).toBe(0);
    expect(state.easeFactor).toBe(INITIAL_EASE_FACTOR);
    expect(state.repetitions).toBe(0);
    expect(state.timesCorrect).toBe(0);
    expect(state.timesIncorrect).toBe(0);
    expect(state.isFavorite).toBe(false);
  });

  it('marks new word as due', () => {
    const state = createDefaultSRSState();
    expect(isWordDue(state)).toBe(true);
  });

  it('advances repetition and interval on Good (grade 3)', () => {
    const initial = createDefaultSRSState();
    const fixedNow = new Date('2026-11-01T00:00:00Z');

    // First review: grade 3 (Good) -> interval = 1 day
    const rev1 = calculateNextSRS(initial, 3, fixedNow);
    expect(rev1.repetitions).toBe(1);
    expect(rev1.interval).toBe(1);
    expect(rev1.timesCorrect).toBe(1);
    expect(rev1.status).toBe('learning');

    // Due date should be 1 day after fixedNow
    const due1 = new Date(rev1.dueDate);
    expect(due1.getUTCDate()).toBe(2);

    // Second review: grade 3 (Good) -> interval = 3 days
    const rev2 = calculateNextSRS(rev1, 3, due1);
    expect(rev2.repetitions).toBe(2);
    expect(rev2.interval).toBe(3);

    // Third review: grade 3 (Good) -> interval = round(3 * easeFactor)
    const rev3 = calculateNextSRS(rev2, 3, new Date(rev2.dueDate));
    expect(rev3.repetitions).toBe(3);
    expect(rev3.interval).toBeGreaterThanOrEqual(7);
    expect(rev3.status).toBe('reviewing');
  });

  it('handles Easy (grade 4) with larger initial intervals', () => {
    const initial = createDefaultSRSState();
    const fixedNow = new Date('2026-11-01T00:00:00Z');

    const rev1 = calculateNextSRS(initial, 4, fixedNow);
    expect(rev1.interval).toBe(2);
    expect(rev1.repetitions).toBe(1);

    const rev2 = calculateNextSRS(rev1, 4, new Date(rev1.dueDate));
    expect(rev2.interval).toBe(5);
    expect(rev2.repetitions).toBe(2);
  });

  it('resets interval and repetitions on Again (grade 1)', () => {
    const existing: SRSState = {
      status: 'reviewing',
      interval: 14,
      easeFactor: 2.5,
      repetitions: 4,
      dueDate: '2026-11-01T00:00:00Z',
      timesCorrect: 4,
      timesIncorrect: 0,
    };

    const fixedNow = new Date('2026-11-01T00:00:00Z');
    const failed = calculateNextSRS(existing, 1, fixedNow);

    expect(failed.repetitions).toBe(0);
    expect(failed.interval).toBe(1);
    expect(failed.status).toBe('learning');
    expect(failed.timesIncorrect).toBe(1);
    expect(failed.easeFactor).toBeLessThan(2.5);
  });

  it('marks word as mastered when interval reaches 21 days', () => {
    const existing: SRSState = {
      status: 'reviewing',
      interval: 15,
      easeFactor: 2.5,
      repetitions: 5,
      dueDate: '2026-11-01T00:00:00Z',
      timesCorrect: 5,
      timesIncorrect: 0,
    };

    const fixedNow = new Date('2026-11-01T00:00:00Z');
    const next = calculateNextSRS(existing, 4, fixedNow);

    expect(next.interval).toBeGreaterThanOrEqual(21);
    expect(next.status).toBe('mastered');
  });
});
