import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, RotateCw, ChevronLeft, ChevronRight, CheckCircle, Sparkles, Filter, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordEntry, SRSGrade, SRSState } from '../types/word';
import { AudioButton } from './AudioButton';
import { isWordDue } from '../services/srsAlgorithm';

interface FlashcardViewProps {
  words: WordEntry[];
  progress: Record<string, SRSState>;
  onReview: (wordId: string, grade: SRSGrade) => void;
  isPlaying: boolean;
  onPlay: (word: string, audioUrl?: string) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  words,
  progress,
  onReview,
  isPlaying,
  onPlay,
}) => {
  const [onlyDue, setOnlyDue] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  // Filter words
  const activeWords = React.useMemo(() => {
    if (onlyDue) {
      const filtered = words.filter((w) => isWordDue(progress[w.id]));
      return filtered.length > 0 ? filtered : words;
    }
    return words;
  }, [words, onlyDue, progress]);

  // Reset or initialize index order
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffledIndices(activeWords.map((_, i) => i));
  }, [activeWords.length, onlyDue]);

  const currentWord: WordEntry | undefined = activeWords[currentIndex];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < activeWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed full cycle!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setCurrentIndex(0);
    }
  }, [currentIndex, activeWords.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    (grade: SRSGrade) => {
      if (!currentWord) return;
      onReview(currentWord.id, grade);
      handleNext();
    },
    [currentWord, onReview, handleNext]
  );

  const handleShuffle = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
    const indices = [...Array(activeWords.length).keys()].sort(() => Math.random() - 0.5);
    setShuffledIndices(indices);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcut if typing in input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (currentWord) onPlay(currentWord.word, currentWord.audio);
      } else if (isFlipped) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleRate, currentWord, onPlay, isFlipped]);

  if (activeWords.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <Sparkles className="w-12 h-12 mx-auto text-indigo-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Chưa có từ vựng nào để học!
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Hãy thêm từ vựng mới hoặc chuyển bộ lọc sang "Tất cả từ".
        </p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / activeWords.length) * 100);

  return (
    <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4 flex flex-col items-center">
      {/* Top Controls: Filter & Shuffle */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyDue(!onlyDue)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              onlyDue
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Filter size={13} />
            <span>{onlyDue ? 'Đang lọc: Cần ôn (SRS)' : 'Tất cả thẻ'}</span>
          </button>
          <button
            type="button"
            onClick={handleShuffle}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            title="Trộn ngẫu nhiên"
          >
            <Shuffle size={15} />
          </button>
        </div>

        <div className="text-xs font-medium text-slate-500">
          Thẻ <span className="font-bold text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</span> / {activeWords.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* The 3D Flashcard Container */}
      <div
        onClick={handleFlip}
        className="w-full h-[400px] sm:h-[420px] perspective-1000 cursor-pointer select-none"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-3xl shadow-xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE */}
          <div className="absolute inset-0 backface-hidden w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between items-center text-center">
            {/* Top info */}
            <div className="w-full flex justify-between items-center text-xs">
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold capitalize">
                {currentWord.partOfSpeech}
              </span>
              {currentWord.level && (
                <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentWord.level}
                </span>
              )}
            </div>

            {/* Word Center */}
            <div className="space-y-4 my-auto">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {currentWord.word}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl text-indigo-600 dark:text-indigo-400 font-medium">
                  {currentWord.phonetic}
                </span>
              </div>
              <div className="pt-2">
                <AudioButton
                  word={currentWord.word}
                  audioUrl={currentWord.audio}
                  isPlaying={isPlaying}
                  onPlay={onPlay}
                  size="lg"
                  showLabel
                />
              </div>
            </div>

            {/* Flip hint footer */}
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <RotateCw size={14} className="animate-spin-slow" />
              <span>Bấm vào thẻ hoặc nhấn <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 font-mono text-[10px]">Space</kbd> để lật nghĩa</span>
            </div>
          </div>

          {/* BACK FACE */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            {/* Top Back Info */}
            <div className="w-full flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-lg font-bold text-white">{currentWord.word}</span>
                <span className="font-mono text-xs text-indigo-400 ml-2">{currentWord.phonetic}</span>
              </div>
              <AudioButton
                word={currentWord.word}
                audioUrl={currentWord.audio}
                isPlaying={isPlaying}
                onPlay={onPlay}
                size="sm"
              />
            </div>

            {/* Meanings */}
            <div className="my-auto space-y-4 py-2">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Nghĩa tiếng Việt
                </h4>
                <p className="text-xl sm:text-2xl font-bold text-white leading-snug">
                  {currentWord.meaningVi}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  English Definition
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 italic">
                  {currentWord.meaningEn}
                </p>
              </div>

              {currentWord.examples && currentWord.examples.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
                  <p className="font-medium">• "{currentWord.examples[0].en}"</p>
                  {currentWord.examples[0].vi && (
                    <p className="text-slate-400 mt-1 italic pl-2 border-l border-indigo-400">
                      {currentWord.examples[0].vi}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* SRS Rating Actions */}
            <div
              className="pt-3 border-t border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[11px] font-semibold text-slate-400 text-center mb-2">
                Đánh giá để lên lịch ôn tiếp theo:
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate(1)}
                  className="px-2 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-all text-center"
                >
                  <span className="block text-[10px] text-rose-400">1</span>
                  Lại
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(2)}
                  className="px-2 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold transition-all text-center"
                >
                  <span className="block text-[10px] text-amber-400">2</span>
                  Khó
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(3)}
                  className="px-2 py-2 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white text-xs font-bold transition-all text-center"
                >
                  <span className="block text-[10px] text-sky-400">3</span>
                  Tốt
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(4)}
                  className="px-2 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition-all text-center"
                >
                  <span className="block text-[10px] text-emerald-400">4</span>
                  Dễ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="w-full flex items-center justify-between mt-6 px-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Thẻ trước</span>
        </button>

        <span className="text-xs text-slate-400">
          Phím tắt: <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Space</kbd> (lật), <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">P</kbd> (nghe), <kbd className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">1-4</kbd> (đánh giá)
        </span>

        <button
          type="button"
          onClick={handleNext}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Thẻ tiếp</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
