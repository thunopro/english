import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Award, Volume2, CheckCircle2, XCircle, RotateCcw, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordEntry, SRSGrade } from '../types/word';
import { AudioButton } from './AudioButton';

type QuizMode = 'multiple-choice' | 'dictation';

interface QuizViewProps {
  words: WordEntry[];
  onReview: (wordId: string, grade: SRSGrade) => void;
  isPlaying: boolean;
  onPlay: (word: string, audioUrl?: string) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  words,
  onReview,
  isPlaying,
  onPlay,
}) => {
  const [mode, setMode] = useState<QuizMode>('multiple-choice');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [dictationInput, setDictationInput] = useState('');
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Shuffle quiz questions
  const quizWords = useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5).slice(0, 15);
  }, [words]);

  const currentQuestion = quizWords[questionIndex];

  // Options for multiple choice (1 correct + 3 random distractors)
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const others = words.filter((w) => w.id !== currentQuestion.id);
    const shuffledOthers = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const pool = [currentQuestion, ...shuffledOthers].sort(() => Math.random() - 0.5);
    return pool;
  }, [currentQuestion, words]);

  // Autoplay pronunciation in dictation mode when question loads
  useEffect(() => {
    if (mode === 'dictation' && currentQuestion && !isAnswerChecked && !isFinished) {
      const timer = setTimeout(() => {
        onPlay(currentQuestion.word, currentQuestion.audio);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [mode, questionIndex, isAnswerChecked, isFinished, onPlay, currentQuestion]);

  const handleSelectChoice = (wordId: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(wordId);
    setIsAnswerChecked(true);

    const isCorrect = wordId === currentQuestion.id;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      onReview(currentQuestion.id, 4); // Easy
    } else {
      setStreak(0);
      onReview(currentQuestion.id, 1); // Again
    }
  };

  const handleCheckDictation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dictationInput.trim() || isAnswerChecked) return;

    setIsAnswerChecked(true);
    const normalizedInput = dictationInput.trim().toLowerCase();
    const normalizedTarget = currentQuestion.word.trim().toLowerCase();

    const isCorrect = normalizedInput === normalizedTarget;
    if (isCorrect) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      onReview(currentQuestion.id, 4);
    } else {
      setStreak(0);
      onReview(currentQuestion.id, 1);
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < quizWords.length - 1) {
      setQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setDictationInput('');
      setIsAnswerChecked(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setDictationInput('');
    setIsAnswerChecked(false);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
  };

  if (words.length < 4) {
    return (
      <div className="text-center py-20 px-4">
        <Award className="w-12 h-12 mx-auto text-indigo-500 mb-4" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Cần ít nhất 4 từ vựng để bắt đầu bài luyện tập!
        </h3>
        <p className="text-sm text-slate-500 mt-2">
          Hiện tại bạn có {words.length} từ. Hãy thêm vài từ nữa nhé!
        </p>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((score / quizWords.length) * 100);
    return (
      <div className="max-w-md mx-auto py-12 px-6 text-center animate-fade-in bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl my-8">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-6">
          <Award size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Hoàn Thành Bài Luyện Tập!
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Bạn đã ôn luyện xuất sắc {quizWords.length} từ vựng.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900">
            <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {score} / {quizWords.length}
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Số câu đúng
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900">
            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {accuracy}%
            </span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Độ chính xác
            </span>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} />
          <span>Luyện tập lượt mới</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      {/* Top Quiz Header: Mode selector & Score/Streak */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('multiple-choice');
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              mode === 'multiple-choice'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Trắc nghiệm nghĩa
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('dictation');
              handleRestart();
            }}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              mode === 'dictation'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Nghe & Viết chính tả
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          {streak > 1 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1 animate-pulse">
              🔥 Streak: {streak}
            </span>
          )}
          <span className="text-slate-500">
            Câu: <span className="font-bold text-slate-900 dark:text-white">{questionIndex + 1}</span>/{quizWords.length}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
        {mode === 'multiple-choice' ? (
          /* MULTIPLE CHOICE MODE */
          <div>
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Chọn nghĩa tiếng Việt đúng cho từ:
              </span>
              <div className="flex items-center justify-center gap-3 mt-2">
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {currentQuestion.word}
                </h3>
                <AudioButton
                  word={currentQuestion.word}
                  audioUrl={currentQuestion.audio}
                  isPlaying={isPlaying}
                  onPlay={onPlay}
                  size="md"
                />
              </div>
              <span className="font-mono text-sm text-indigo-600 dark:text-indigo-400 mt-1 block">
                {currentQuestion.phonetic} ({currentQuestion.partOfSpeech})
              </span>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {options.map((opt) => {
                const isCorrect = opt.id === currentQuestion.id;
                const isSelected = selectedAnswer === opt.id;

                let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';

                if (isAnswerChecked) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 shadow-md';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200';
                  } else {
                    btnStyle = 'opacity-40 border-slate-200 dark:border-slate-800';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectChoice(opt.id)}
                    disabled={isAnswerChecked}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-medium text-sm transition-all duration-200 flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt.meaningVi}</span>
                    {isAnswerChecked && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isAnswerChecked && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* DICTATION / SPELLING MODE */
          <div>
            <div className="text-center mb-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nghe phát âm chuẩn và gõ đúng chính tả:
              </span>
              <div className="my-5 flex flex-col items-center">
                <AudioButton
                  word={currentQuestion.word}
                  audioUrl={currentQuestion.audio}
                  isPlaying={isPlaying}
                  onPlay={onPlay}
                  size="lg"
                  showLabel
                />
                <span className="text-xs text-slate-400 mt-2">
                  (Bấm nút hoặc nghe lại để nhận diện từ)
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                Gợi ý nghĩa: "{currentQuestion.meaningVi}"
              </p>
            </div>

            <form onSubmit={handleCheckDictation} className="space-y-4">
              <input
                type="text"
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                placeholder="Gõ từ tiếng Anh bạn nghe được..."
                disabled={isAnswerChecked}
                autoFocus
                className="w-full text-center text-xl font-bold tracking-wider px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none"
              />

              {!isAnswerChecked && (
                <button
                  type="submit"
                  disabled={!dictationInput.trim()}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all"
                >
                  Kiểm tra đáp án
                </button>
              )}
            </form>

            {isAnswerChecked && (
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center animate-fade-in">
                {dictationInput.trim().toLowerCase() === currentQuestion.word.toLowerCase() ? (
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={20} />
                    <span>Chính xác tuyệt đối!</span>
                  </div>
                ) : (
                  <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center justify-center gap-2">
                    <XCircle size={20} />
                    <span>Chưa đúng! Đáp án là: <span className="underline">{currentQuestion.word}</span></span>
                  </div>
                )}
                <span className="font-mono text-sm text-indigo-500 mt-1 block">
                  {currentQuestion.phonetic}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Next Question Button */}
        {isAnswerChecked && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end animate-fade-in">
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all"
            >
              <span>{questionIndex < quizWords.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
