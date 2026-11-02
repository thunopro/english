import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  ArrowUpDown,
  Plus,
  Star,
  Clock,
  BarChart2,
  X,
  Volume2,
  GitBranch,
} from 'lucide-react';

import { WordEntry, ViewMode, FilterOptions, SRSGrade } from './types/word';
import { useWords } from './hooks/useWords';
import { useAudio } from './hooks/useAudio';
import { useLocalStorage } from './hooks/useLocalStorage';
import { filterAndSortWords, getAllTags } from './utils/searchFilter';
import { getWordDeepLink } from './utils/exportUtils';

import { Navbar } from './components/Navbar';
import { ReadingView } from './components/ReadingView';
import { WordCard } from './components/WordCard';
import { WordDetailModal } from './components/WordDetailModal';
import { AddWordModal } from './components/AddWordModal';
import { FlashcardView } from './components/FlashcardView';
import { QuizView } from './components/QuizView';
import { TextListView } from './components/TextListView';
import { StatsModal } from './components/StatsModal';
import { Toast, ToastMessage } from './components/Toast';
import { GITHUB_REPO_URL, PEARLS_DOC_URL } from './data/pearlsReading';

export const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('vocab_dark_mode', false);

  // Active View ('reading' | 'bank' | 'flashcards' | 'quiz' | 'text-list')
  const [currentView, setCurrentView] = useState<ViewMode>('reading');

  // Selected word for detail modal
  const [selectedWord, setSelectedWord] = useState<WordEntry | null>(null);

  // Modal open states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // Toast notification
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      text,
    });
  }, []);

  // Word hooks and audio engine
  const {
    words,
    progress,
    dueWords,
    isLoading,
    error,
    addWord,
    reviewWord,
    toggleFavorite,
    resetProgress,
  } = useWords();

  const {
    isPlaying,
    playingWordId,
    preferredAccent,
    setPreferredAccent,
    playbackRate,
    setPlaybackRate,
    play,
    stop,
  } = useAudio();

  // Search & Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    tag: 'all',
    partOfSpeech: 'all',
    mastery: 'all',
    level: 'all',
    favoriteOnly: false,
    sortBy: 'dateAdded-desc',
  });

  const [cardLayout, setCardLayout] = useState<'grid' | 'compact'>('grid');

  // Sync dark class on document root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Deep linking via hash (#word=<slug>, #flashcards, #quiz, #text-list)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) return;

      if (hash.startsWith('#word=')) {
        const wordId = decodeURIComponent(hash.replace('#word=', ''));
        const matched = words.find((w) => w.id === wordId);
        if (matched) {
          setSelectedWord(matched);
        }
      } else if (hash === '#reading') {
        setCurrentView('reading');
      } else if (hash === '#flashcards') {
        setCurrentView('flashcards');
      } else if (hash === '#quiz') {
        setCurrentView('quiz');
      } else if (hash === '#text-list') {
        setCurrentView('text-list');
      } else if (hash === '#bank') {
        setCurrentView('bank');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [words]);

  const handleSelectView = (view: ViewMode) => {
    setCurrentView(view);
    window.location.hash = `#${view}`;
  };

  const handleOpenDetail = (word: WordEntry) => {
    setSelectedWord(word);
    window.location.hash = `#word=${word.id}`;
  };

  const handleCloseDetail = () => {
    setSelectedWord(null);
    if (window.location.hash.startsWith('#word=')) {
      window.history.replaceState(null, '', window.location.pathname + (currentView !== 'bank' ? `#${currentView}` : ''));
    }
  };

  const handleCopyLink = (wordId: string) => {
    const link = getWordDeepLink(wordId);
    navigator.clipboard.writeText(link).then(() => {
      showToast('success', `Đã copy link: #${wordId}`);
    });
  };

  // Filtered words for Explorer
  const filteredWords = useMemo(() => {
    return filterAndSortWords(words, progress, filters);
  }, [words, progress, filters]);

  const allTags = useMemo(() => {
    return getAllTags(words);
  }, [words]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        dueCount={dueWords.length}
        totalWords={words.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        preferredAccent={preferredAccent}
        onChangeAccent={setPreferredAccent}
        playbackRate={playbackRate}
        onChangeRate={setPlaybackRate}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 0: READING 01 (PEARLS & IELTS QUIZ) */}
        {currentView === 'reading' && (
          <ReadingView
            words={words}
            onSelectWord={handleOpenDetail}
            onPlayWordAudio={play}
            preferredAccent={preferredAccent}
            onChangeAccent={setPreferredAccent}
            onNavigateToBank={() => handleSelectView('bank')}
          />
        )}

        {/* VIEW 1: WORD BANK / EXPLORER */}
        {currentView === 'bank' && (
          <div className="space-y-6 animate-fade-in">
            {/* Hero / Quick Stats Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Kho Từ Vựng Của Bạn
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Đã lưu trữ <span className="font-bold text-indigo-600 dark:text-indigo-400">{words.length} từ</span> kèm phát âm chuẩn và liên kết học tập.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {dueWords.length > 0 && (
                  <button
                    onClick={() => handleSelectView('flashcards')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <Clock size={14} />
                    <span>Ôn ngay {dueWords.length} từ cần nhớ</span>
                  </button>
                )}

                <button
                  onClick={() => setIsStatsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <BarChart2 size={14} />
                  <span>Tiến độ SRS</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Thêm từ</span>
                </button>
              </div>
            </div>

            {/* Search & Filter Toolbar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
              {/* Search row */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Tìm theo từ tiếng Anh, phiên âm, nghĩa tiếng Việt, ghi chú..."
                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {filters.search && (
                    <button
                      onClick={() => setFilters({ ...filters, search: '' })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Favorite filter toggle */}
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, favoriteOnly: !filters.favoriteOnly })}
                  className={`p-2.5 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                    filters.favoriteOnly
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                      : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                  title="Chỉ xem từ yêu thích"
                >
                  <Star size={15} className={filters.favoriteOnly ? 'fill-amber-400' : ''} />
                  <span className="hidden sm:inline">Yêu thích</span>
                </button>
              </div>

              {/* Filters & Sorters row */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Tag Filter */}
                  <select
                    value={filters.tag}
                    onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">🏷️ Tất cả Tags</option>
                    {allTags.map((t) => (
                      <option key={t} value={t}>
                        #{t}
                      </option>
                    ))}
                  </select>

                  {/* Part of Speech */}
                  <select
                    value={filters.partOfSpeech}
                    onChange={(e) => setFilters({ ...filters, partOfSpeech: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">📖 Tất cả loại từ</option>
                    <option value="noun">Danh từ (Noun)</option>
                    <option value="verb">Động từ (Verb)</option>
                    <option value="adjective">Tính từ (Adjective)</option>
                    <option value="adverb">Trạng từ (Adverb)</option>
                    <option value="idiom">Thành ngữ (Idiom)</option>
                    <option value="phrasal verb">Cụm động từ</option>
                  </select>

                  {/* Mastery Status */}
                  <select
                    value={filters.mastery}
                    onChange={(e) => setFilters({ ...filters, mastery: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">🎯 Trạng thái nhớ</option>
                    <option value="new">Từ mới (New)</option>
                    <option value="learning">Đang học (Learning)</option>
                    <option value="reviewing">Đang ôn (Reviewing)</option>
                    <option value="mastered">Đã thuộc (Mastered)</option>
                  </select>

                  {/* Level */}
                  <select
                    value={filters.level}
                    onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="all">📊 Cấp độ CEFR</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>

                {/* Sorter */}
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown size={13} className="text-slate-400" />
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none font-medium"
                  >
                    <option value="dateAdded-desc">Mới thêm nhất</option>
                    <option value="dateAdded-asc">Cũ nhất</option>
                    <option value="alpha-asc">Từ A đến Z</option>
                    <option value="alpha-desc">Từ Z đến A</option>
                    <option value="dueDate-asc">Cần ôn trước</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Word List Grid */}
            {filteredWords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWords.map((word) => (
                  <WordCard
                    key={word.id}
                    word={word}
                    srsState={progress[word.id]}
                    isPlaying={isPlaying && playingWordId === word.word}
                    onPlay={play}
                    onOpenDetail={handleOpenDetail}
                    onToggleFavorite={toggleFavorite}
                    onCopyLink={handleCopyLink}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
                <Search className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Không tìm thấy từ vựng nào khớp với bộ lọc
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Thử xóa bớt bộ lọc hoặc thêm từ vựng mới vào kho từ.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: '',
                      tag: 'all',
                      partOfSpeech: 'all',
                      mastery: 'all',
                      level: 'all',
                      favoriteOnly: false,
                      sortBy: 'dateAdded-desc',
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Đặt lại tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: FLASHCARDS (SRS) */}
        {currentView === 'flashcards' && (
          <FlashcardView
            words={words}
            progress={progress}
            onReview={reviewWord}
            isPlaying={isPlaying}
            onPlay={play}
          />
        )}

        {/* VIEW 3: PRACTICE & QUIZ */}
        {currentView === 'quiz' && (
          <QuizView
            words={words}
            onReview={reviewWord}
            isPlaying={isPlaying}
            onPlay={play}
          />
        )}

        {/* VIEW 4: TEXT LIST VIEW (Direct Link Sheet) */}
        {currentView === 'text-list' && (
          <TextListView
            words={words}
            isPlaying={isPlaying}
            onPlay={play}
            onOpenDetail={handleOpenDetail}
            onCopyLink={handleCopyLink}
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <span>VocabVault — Sổ tay từ vựng & Phát âm chuẩn bản xứ</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={PEARLS_DOC_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-medium"
            >
              <span>📄 Tài liệu Docs Pearls</span>
            </a>
            <span>•</span>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 font-medium"
            >
              <GitBranch size={13} />
              <span>GitHub: thunopro/english</span>
            </a>
            <span>•</span>
            <span>Vercel Live</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <WordDetailModal
        word={selectedWord}
        srsState={selectedWord ? progress[selectedWord.id] : undefined}
        isPlaying={isPlaying && selectedWord ? playingWordId === selectedWord.word : false}
        onPlay={play}
        onClose={handleCloseDetail}
        onToggleFavorite={toggleFavorite}
        onReview={reviewWord}
        onCopyLink={handleCopyLink}
      />

      <AddWordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddWord={addWord}
        allWords={words}
        showToast={showToast}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        words={words}
        progress={progress}
        onResetProgress={resetProgress}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
