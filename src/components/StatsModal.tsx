import React from 'react';
import { X, Award, CheckCircle2, BookOpen, Clock, Flame, RotateCcw } from 'lucide-react';
import { WordEntry, UserProgressData } from '../types/word';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: WordEntry[];
  progress: UserProgressData;
  onResetProgress: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  words,
  progress,
  onResetProgress,
}) => {
  if (!isOpen) return null;

  let totalCorrect = 0;
  let totalIncorrect = 0;
  let masteredCount = 0;
  let reviewingCount = 0;
  let learningCount = 0;
  let newCount = 0;

  words.forEach((w) => {
    const s = progress[w.id];
    if (!s || s.status === 'new') {
      newCount++;
    } else if (s.status === 'learning') {
      learningCount++;
    } else if (s.status === 'reviewing') {
      reviewingCount++;
    } else if (s.status === 'mastered') {
      masteredCount++;
    }

    if (s) {
      totalCorrect += s.timesCorrect || 0;
      totalIncorrect += s.timesIncorrect || 0;
    }
  });

  const totalReviews = totalCorrect + totalIncorrect;
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tiến Độ Học Tập & SRS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
              <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {words.length}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Tổng số từ vựng
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900">
              <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {masteredCount}
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Đã thuộc (Mastered)
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">Đang ôn tập (Reviewing):</span>
              <span className="font-bold text-purple-600">{reviewingCount} từ</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">Đang học (Learning):</span>
              <span className="font-bold text-amber-600">{learningCount} từ</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-600 dark:text-slate-400">Từ mới chưa ôn:</span>
              <span className="font-bold text-blue-600">{newCount} từ</span>
            </div>
            <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400">Tỷ lệ trả lời đúng:</span>
              <span className="font-bold text-emerald-600">{accuracy}% ({totalCorrect}/{totalReviews})</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ tiến độ học tập?')) {
                  onResetProgress();
                  onClose();
                }
              }}
              className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Đặt lại tiến độ SRS</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
