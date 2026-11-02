import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  FileText,
  GraduationCap
} from 'lucide-react';
import { GithubIcon } from './Navbar';
import {
  READING_PASSAGE,
  MATCHING_QUESTIONS,
  SUMMARY_OPTIONS,
  SUMMARY_BLANKS,
  TFNG_QUESTIONS,
  PEARLS_DOC_URL,
  GITHUB_REPO_URL
} from '../data/pearlsReading';
import { WordEntry } from '../types/word';
import { PreferredAccent } from '../hooks/useAudio';

interface ReadingViewProps {
  words: WordEntry[];
  onSelectWord: (word: WordEntry) => void;
  onPlayWordAudio: (word: string, audioUrl?: string) => void;
  preferredAccent: PreferredAccent;
  onChangeAccent: (accent: PreferredAccent) => void;
  onNavigateToBank: () => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  words,
  onSelectWord,
  onPlayWordAudio,
  preferredAccent,
  onChangeAccent,
  onNavigateToBank
}) => {
  // Sub-tabs: 'passage' | 'quiz' | 'both'
  const [activeTab, setActiveTab] = useState<'passage' | 'quiz' | 'all'>('all');

  // Matching Q1-4 user answers
  const [matchingAnswers, setMatchingAnswers] = useState<Record<number, string>>({});

  // Summary Q5-10 user answers
  const [summaryAnswers, setSummaryAnswers] = useState<Record<number, string>>({});

  // TFNG Q11-13 user answers
  const [tfngAnswers, setTfngAnswers] = useState<Record<number, 'TRUE' | 'FALSE' | 'NOT GIVEN' | ''>>({});

  // Submitted & graded
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  // Active playing term
  const [activeTermPlaying, setActiveTermPlaying] = useState<string | null>(null);

  const handlePlayVocab = (term: string, wordId: string) => {
    setActiveTermPlaying(term);
    const matched = words.find((w) => w.id === wordId || w.word.toLowerCase() === term.toLowerCase());
    onPlayWordAudio(matched ? matched.word : term, matched?.audio);
    setTimeout(() => setActiveTermPlaying(null), 1200);
  };

  const handleOpenWordDetail = (wordId: string) => {
    const matched = words.find((w) => w.id === wordId);
    if (matched) {
      onSelectWord(matched);
    }
  };

  // Grading calculation
  const calculateScore = () => {
    let score = 0;
    // Q1-4
    MATCHING_QUESTIONS.forEach((q) => {
      if (matchingAnswers[q.id] === q.answer) score++;
    });
    // Q5-10
    SUMMARY_BLANKS.forEach((b) => {
      if (summaryAnswers[b.id] === b.answer) score++;
    });
    // Q11-13
    TFNG_QUESTIONS.forEach((q) => {
      if (tfngAnswers[q.id] === q.answer) score++;
    });
    return score;
  };

  const totalQuestions = 13;
  const currentScore = calculateScore();

  const handleResetQuiz = () => {
    setMatchingAnswers({});
    setSummaryAnswers({});
    setTfngAnswers({});
    setIsSubmitted(false);
    setShowExplanations(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wider uppercase border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              IELTS Academic Reading 01
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {READING_PASSAGE.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              {READING_PASSAGE.subtitle}. Tra cứu từ vựng chuẩn bản xứ theo từng đoạn, nghe phát âm trực tiếp và làm bài tập IELTS có chấm điểm chi tiết.
            </p>
          </div>

          {/* Quick External Links & Controls */}
          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-3 shrink-0">
            <a
              href={PEARLS_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium transition-colors border border-white/10 shadow-sm"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Tài liệu Google Docs</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/30"
            >
              <GithubIcon className="w-4 h-4" />
              <span>thunopro/english</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Accent toggle */}
            <div className="inline-flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 text-xs">
              <span className="text-slate-400 px-1 font-medium">Giọng đọc:</span>
              {(['en-US', 'en-GB', 'en-AU'] as PreferredAccent[]).map((acc) => (
                <button
                  key={acc}
                  onClick={() => onChangeAccent(acc)}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors ${
                    preferredAccent === acc
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {acc.replace('en-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Mode Pill Tabs */}
        <div className="mt-6 pt-6 border-t border-indigo-800/40 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900/60 rounded-xl border border-indigo-900/50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Xem Cả Hai (Bài Đọc & Câu Hỏi)
            </button>
            <button
              onClick={() => setActiveTab('passage')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'passage'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              📖 Chỉ Bài Đọc & Từ Vựng
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              ✍️ Chỉ Làm Bài Tập (13 Câu)
            </button>
          </div>

          <button
            onClick={onNavigateToBank}
            className="inline-flex items-center gap-2 text-indigo-300 hover:text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <span>Xem toàn bộ 24 thẻ từ vựng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid gap-8 ${activeTab === 'all' ? 'lg:grid-cols-12' : 'grid-cols-1'}`}>
        {/* Left Column: Reading Passage & Vocabulary (Columns 1-7 in 'all' mode) */}
        {(activeTab === 'all' || activeTab === 'passage') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-7' : 'max-w-4xl mx-auto'} space-y-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Văn Bản Bài Đọc (Paragraphs A – G)
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Bấm vào 🔊 để nghe phát âm từng từ
              </span>
            </div>

            {READING_PASSAGE.paragraphs.map((p) => (
              <div
                key={p.id}
                id={`paragraph-${p.id}`}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all"
              >
                {/* Paragraph Label Badge */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                    {p.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Paragraph {p.id}
                  </span>
                </div>

                {/* Paragraph Content */}
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base font-normal tracking-wide text-justify">
                  {p.text}
                </p>

                {/* Annotated Vocab for this paragraph */}
                {p.vocabNotes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                      Từ Vựng Trọng Tâm Đoạn {p.id}:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {p.vocabNotes.map((v, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                                {v.term}
                              </span>
                              {v.type && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                                  {v.type}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">
                              {v.meaningVi}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handlePlayVocab(v.term, v.wordId)}
                              title="Nghe phát âm chuẩn"
                              className={`p-1.5 rounded-lg transition-colors ${
                                activeTermPlaying === v.term
                                  ? 'bg-indigo-600 text-white animate-pulse'
                                  : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                              }`}
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenWordDetail(v.wordId)}
                              title="Xem chi tiết thẻ từ"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/40 transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Right Column: IELTS Practice Questions (Columns 8-12 in 'all' mode) */}
        {(activeTab === 'all' || activeTab === 'quiz') && (
          <div className={`${activeTab === 'all' ? 'lg:col-span-5' : 'max-w-4xl mx-auto'} space-y-6`}>
            {/* Quiz Header & Sticky Controls */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4 sticky top-20 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Luyện Tập IELTS Reading
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    13 câu hỏi thực tế theo chuẩn Cambridge IELTS
                  </p>
                </div>

                {isSubmitted && (
                  <div className="text-right">
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {currentScore}/{totalQuestions}
                    </span>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {Math.round((currentScore / totalQuestions) * 100)}% Chính xác
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {!isSubmitted ? (
                  <button
                    onClick={() => {
                      setIsSubmitted(true);
                      setShowExplanations(true);
                    }}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Nộp Bài & Chấm Điểm</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setShowExplanations(!showExplanations)}
                      className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all"
                    >
                      {showExplanations ? 'Ẩn Lời Giải' : 'Hiện Lời Giải Chi Tiết'}
                    </button>
                    <button
                      onClick={handleResetQuiz}
                      className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Part 1: Questions 1–4 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Phần 1 • Questions 1–4
                </span>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  Which paragraph contains the following information? (Write A–G)
                </h3>
              </div>

              <div className="space-y-4">
                {MATCHING_QUESTIONS.map((q) => {
                  const userAns = matchingAnswers[q.id] || '';
                  const isCorrect = userAns === q.answer;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 text-sm text-slate-800 dark:text-slate-200">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                            {q.id}.
                          </span>
                          <span className="leading-snug">{q.statement}</span>
                        </div>

                        <select
                          value={userAns}
                          onChange={(e) =>
                            setMatchingAnswers({ ...matchingAnswers, [q.id]: e.target.value })
                          }
                          disabled={isSubmitted}
                          className="shrink-0 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Chọn...</option>
                          {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((opt) => (
                            <option key={opt} value={opt}>
                              Paragraph {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Explanation */}
                      {isSubmitted && showExplanations && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold">
                            {isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng! Đoạn {q.answer}
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Đáp án đúng: Đoạn {q.answer}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            💡 {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Part 2: Questions 5–10 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Phần 2 • Questions 5–10
                </span>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  Complete the summary using the list of words, A–K.
                </h3>

                {/* Option Chips Bank */}
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                  {SUMMARY_OPTIONS.map((opt) => (
                    <span
                      key={opt.code}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-600 shadow-2xs"
                    >
                      <strong className="text-indigo-600 dark:text-indigo-400">{opt.code}</strong>{' '}
                      {opt.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Summary Passage with inline select fields */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
                <p>
                  Throughout history, people in{' '}
                  <select
                    value={summaryAnswers[5] || ''}
                    onChange={(e) => setSummaryAnswers({ ...summaryAnswers, 5: e.target.value })}
                    disabled={isSubmitted}
                    className="inline-block mx-1 text-xs font-bold py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">[ 5 ]</option>
                    {SUMMARY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.text}
                      </option>
                    ))}
                  </select>{' '}
                  used pearls for medicine and philters. There are essentially three types of pearls:
                  natural, cultured, and imitation. Natural and cultured pearls share a similar
                  growing process, while imitation pearls are different. And{' '}
                  <select
                    value={summaryAnswers[6] || ''}
                    onChange={(e) => setSummaryAnswers({ ...summaryAnswers, 6: e.target.value })}
                    disabled={isSubmitted}
                    className="inline-block mx-1 text-xs font-bold py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">[ 6 ]</option>
                    {SUMMARY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.text}
                      </option>
                    ))}
                  </select>{' '}
                  owns the reputation for its imitation pearl industry. The country{' '}
                  <select
                    value={summaryAnswers[7] || ''}
                    onChange={(e) => setSummaryAnswers({ ...summaryAnswers, 7: e.target.value })}
                    disabled={isSubmitted}
                    className="inline-block mx-1 text-xs font-bold py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">[ 7 ]</option>
                    {SUMMARY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.text}
                      </option>
                    ))}
                  </select>{' '}
                  usually produces the larger pearls due to the favorable environment along the
                  coastline, while the nation of{' '}
                  <select
                    value={summaryAnswers[8] || ''}
                    onChange={(e) => setSummaryAnswers({ ...summaryAnswers, 8: e.target.value })}
                    disabled={isSubmitted}
                    className="inline-block mx-1 text-xs font-bold py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">[ 8 ]</option>
                    {SUMMARY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.text}
                      </option>
                    ))}
                  </select>{' '}
                  manufactures some of the most glistening cultured pearls. In the past, the country{' '}
                  <select
                    value={summaryAnswers[9] || ''}
                    onChange={(e) => setSummaryAnswers({ ...summaryAnswers, 9: e.target.value })}
                    disabled={isSubmitted}
                    className="inline-block mx-1 text-xs font-bold py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">[ 9 ]</option>
                    {SUMMARY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.text}
                      </option>
                    ))}
                  </select>{' '}
                  in the Persian Gulf produced the world’s best pearls. At present, the major remaining
                  suppliers of natural pearls are in{' '}
                  <select
                    value={summaryAnswers[10] || ''}
                    onChange={(e) => setSummaryAnswers({ ...summaryAnswers, 10: e.target.value })}
                    disabled={isSubmitted}
                    className="inline-block mx-1 text-xs font-bold py-1 px-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">[ 10 ]</option>
                    {SUMMARY_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.code} - {opt.text}
                      </option>
                    ))}
                  </select>
                  .
                </p>
              </div>

              {/* Summary Explanations list */}
              {isSubmitted && showExplanations && (
                <div className="space-y-2 pt-2">
                  {SUMMARY_BLANKS.map((b) => {
                    const userAns = summaryAnswers[b.id] || '';
                    const isCorrect = userAns === b.answer;
                    return (
                      <div
                        key={b.id}
                        className={`p-2.5 rounded-xl text-xs space-y-0.5 border ${
                          isCorrect
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                            : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {isCorrect ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          Câu [{b.id}]: Đáp án {b.answer} ({b.label})
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 pl-5">💡 {b.explanation}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Part 3: Questions 11–13 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Phần 3 • Questions 11–13
                </span>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  TRUE / FALSE / NOT GIVEN
                </h3>
              </div>

              <div className="space-y-4">
                {TFNG_QUESTIONS.map((q) => {
                  const userAns = tfngAnswers[q.id] || '';
                  const isCorrect = userAns === q.answer;

                  return (
                    <div
                      key={q.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isSubmitted
                          ? isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-700'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="text-sm text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                          {q.id}.
                        </span>
                        {q.statement}
                      </div>

                      {/* Options Radio Pills */}
                      <div className="flex items-center gap-2 mt-3">
                        {(['TRUE', 'FALSE', 'NOT GIVEN'] as const).map((opt) => (
                          <button
                            key={opt}
                            disabled={isSubmitted}
                            onClick={() => setTfngAnswers({ ...tfngAnswers, [q.id]: opt })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              userAns === opt
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {/* Explanation */}
                      {isSubmitted && showExplanations && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold">
                            {isCorrect ? (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng! {q.answer}
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Đáp án đúng: {q.answer}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            💡 {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
