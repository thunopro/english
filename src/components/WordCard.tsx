import React from 'react';
import { Star, Link2, ChevronRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { WordEntry, SRSState } from '../types/word';
import { AudioButton } from './AudioButton';
import { isWordDue } from '../services/srsAlgorithm';

interface WordCardProps {
  word: WordEntry;
  srsState?: SRSState;
  isPlaying: boolean;
  onPlay: (word: string, audioUrl?: string) => void;
  onOpenDetail: (word: WordEntry) => void;
  onToggleFavorite: (wordId: string) => void;
  onCopyLink: (wordId: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  srsState,
  isPlaying,
  onPlay,
  onOpenDetail,
  onToggleFavorite,
  onCopyLink,
}) => {
  const isDue = isWordDue(srsState);
  const status = srsState?.status || 'new';

  const statusBadges = {
    new: { label: 'Từ mới', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
    learning: { label: 'Đang học', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
    reviewing: { label: 'Đang ôn', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
    mastered: { label: 'Đã thuộc', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  };

  const posColors: Record<string, string> = {
    noun: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60',
    verb: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
    adjective: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
    adverb: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60',
    idiom: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60',
  };

  const badge = statusBadges[status] || statusBadges.new;

  return (
    <div
      onClick={() => onOpenDetail(word)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top Header: POS, Level, Status, Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-semibold capitalize ${
                posColors[word.partOfSpeech] || 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {word.partOfSpeech}
            </span>
            {word.level && (
              <span className="px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {word.level}
              </span>
            )}
            {isDue && status !== 'new' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
                <Clock size={11} /> Cần ôn
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink(word.id);
              }}
              title="Copy link trực tiếp tới từ này"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Link2 size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(word.id);
              }}
              title={srsState?.isFavorite ? 'Bỏ yêu thích' : 'Đánh dấu yêu thích'}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Star
                size={16}
                className={
                  srsState?.isFavorite
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'
                }
              />
            </button>
          </div>
        </div>

        {/* Word + Audio Playback */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {word.word}
            </h3>
            <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 tracking-wide font-medium">
              {word.phonetic}
            </span>
          </div>

          <AudioButton
            word={word.word}
            audioUrl={word.audio}
            isPlaying={isPlaying}
            onPlay={onPlay}
            size="md"
          />
        </div>

        {/* Vietnamese Meaning */}
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-2 mt-2">
          {word.meaningVi}
        </p>

        {/* English Meaning Snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic mt-1">
          {word.meaningEn}
        </p>

        {/* First Example */}
        {word.examples && word.examples.length > 0 && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            <span className="font-medium text-slate-900 dark:text-white">Ví dụ: </span>
            <span>"{word.examples[0].en}"</span>
          </div>
        )}
      </div>

      {/* Footer: Tags & Status */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 flex-wrap max-w-[70%]">
          {word.tags?.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full"
            >
              #{t}
            </span>
          ))}
          {word.tags && word.tags.length > 2 && (
            <span className="text-[10px] text-slate-400">+{word.tags.length - 2}</span>
          )}
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.color}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
};
