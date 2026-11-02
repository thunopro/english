import React, { useEffect } from 'react';
import { X, Volume2, Link2, Star, Check, ExternalLink, Calendar, BookOpen, Tag, Sparkles } from 'lucide-react';
import { WordEntry, SRSState, SRSGrade } from '../types/word';
import { AudioButton } from './AudioButton';
import { getWordDeepLink } from '../utils/exportUtils';

interface WordDetailModalProps {
  word: WordEntry | null;
  srsState?: SRSState;
  isPlaying: boolean;
  onPlay: (word: string, audioUrl?: string) => void;
  onClose: () => void;
  onToggleFavorite: (wordId: string) => void;
  onReview: (wordId: string, grade: SRSGrade) => void;
  onCopyLink: (wordId: string) => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  srsState,
  isPlaying,
  onPlay,
  onClose,
  onToggleFavorite,
  onReview,
  onCopyLink,
}) => {
  // Listen for Escape key to close modal & Space/P to pronounce
  useEffect(() => {
    if (!word) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'p' || e.key === 'P') {
        onPlay(word.word, word.audio);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [word, onClose, onPlay]);

  if (!word) return null;

  const directLink = getWordDeepLink(word.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 capitalize">
              {word.partOfSpeech}
            </span>
            {word.level && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {word.level}
              </span>
            )}
            {srsState?.status && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Trạng thái: {srsState.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(word.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={srsState?.isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
            >
              <Star
                size={20}
                className={srsState?.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Word Heading + Pronunciation */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {word.word}
              </h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-mono text-lg text-indigo-600 dark:text-indigo-400 font-medium">
                  {word.phonetic}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  (Bấm 'P' hoặc icon để nghe)
                </span>
              </div>
            </div>

            <AudioButton
              word={word.word}
              audioUrl={word.audio}
              isPlaying={isPlaying}
              onPlay={onPlay}
              size="lg"
              showLabel
            />
          </div>

          {/* Deep link box (User request: Dễ dàng truy cập link text) */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 min-w-0">
              <Link2 size={16} className="text-indigo-500 shrink-0" />
              <span className="font-semibold shrink-0">Link trực tiếp:</span>
              <span className="truncate font-mono text-indigo-600 dark:text-indigo-400 select-all">
                {directLink}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onCopyLink(word.id)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <Link2 size={13} />
              <span>Copy Link</span>
            </button>
          </div>

          {/* Meanings */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Định nghĩa tiếng Việt
              </h4>
              <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                {word.meaningVi}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                English Definition
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                {word.meaningEn}
              </p>
            </div>
          </div>

          {/* Example Sentences */}
          {word.examples && word.examples.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Ví dụ minh họa
              </h4>
              <div className="space-y-2.5">
                {word.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-sm"
                  >
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      • "{ex.en}"
                    </p>
                    {ex.vi && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-3 border-l-2 border-indigo-400">
                        {ex.vi}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collocations */}
          {word.collocations && word.collocations.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Cụm từ hay gặp (Collocations)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {word.collocations.map((col, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synonyms & Antonyms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {word.synonyms && word.synonyms.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Đồng nghĩa (Synonyms)
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {word.synonyms.join(', ')}
                </p>
              </div>
            )}
            {word.antonyms && word.antonyms.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                  Trái nghĩa (Antonyms)
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {word.antonyms.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Notes / Mnemonics */}
          {word.notes && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Mẹo nhớ & Ghi chú: </span>
                {word.notes}
              </div>
            </div>
          )}

          {/* Tags & Date Added */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag size={13} />
              {word.tags?.map((t) => (
                <span key={t} className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-300">
                  #{t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={13} />
              <span>{word.dateAdded}</span>
            </div>
          </div>
        </div>

        {/* Footer: Quick SRS Rating Buttons */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Đánh giá mức độ nhớ (SRS):
          </span>
          <div className="grid grid-cols-4 gap-2 w-full sm:w-auto">
            <button
              onClick={() => onReview(word.id, 1)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/80 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 transition-colors"
            >
              1. Lại (&lt;1 ngày)
            </button>
            <button
              onClick={() => onReview(word.id, 2)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/80 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 transition-colors"
            >
              2. Khó (1 ngày)
            </button>
            <button
              onClick={() => onReview(word.id, 3)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-100 hover:bg-sky-200 dark:bg-sky-950/80 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 transition-colors"
            >
              3. Tốt (3 ngày)
            </button>
            <button
              onClick={() => onReview(word.id, 4)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors"
            >
              4. Dễ (7 ngày)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
