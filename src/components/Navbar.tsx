import React, { useState } from 'react';
import {
  BookOpen,
  Layers,
  Award,
  Link2,
  Plus,
  Moon,
  Sun,
  Volume2,
  Sparkles,
  Menu,
  X,
  FileText,
  ExternalLink
} from 'lucide-react';
import { ViewMode } from '../types/word';
import { PreferredAccent } from '../hooks/useAudio';
import { GITHUB_REPO_URL, PEARLS_DOC_URL } from '../data/pearlsReading';

export const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenAddModal: () => void;
  dueCount: number;
  totalWords: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  preferredAccent: PreferredAccent;
  onChangeAccent: (accent: PreferredAccent) => void;
  playbackRate: number;
  onChangeRate: (rate: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenAddModal,
  dueCount,
  totalWords,
  isDarkMode,
  onToggleDarkMode,
  preferredAccent,
  onChangeAccent,
  playbackRate,
  onChangeRate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: ViewMode; label: string; icon: React.ReactNode; badge?: string | number }> = [
    {
      id: 'reading',
      label: 'Bài Đọc 01: Pearls',
      icon: <FileText className="w-4 h-4 text-emerald-500" />,
      badge: 'IELTS',
    },
    {
      id: 'bank',
      label: 'Kho Từ Vựng',
      icon: <BookOpen className="w-4 h-4" />,
      badge: totalWords,
    },
    {
      id: 'flashcards',
      label: 'Thẻ Ghi Nhớ (SRS)',
      icon: <Layers className="w-4 h-4" />,
      badge: dueCount > 0 ? dueCount : undefined,
    },
    {
      id: 'quiz',
      label: 'Luyện Tập & Chính Tả',
      icon: <Award className="w-4 h-4" />,
    },
    {
      id: 'text-list',
      label: 'Link Text & Xuất Dữ Liệu',
      icon: <Link2 className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectView('bank')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent flex items-center gap-1.5">
                  VocabVault
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    v1.0
                  </span>
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Sổ tay từ vựng & Phát âm chuẩn
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectView(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                        item.id === 'flashcards' && dueCount > 0
                          ? 'bg-amber-500 text-white animate-pulse'
                          : active
                          ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Controls: Accent, Speed, Add Word, Theme */}
          <div className="flex items-center gap-2">
            {/* Audio Voice Accent Selector */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onChangeAccent('en-US')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  preferredAccent === 'en-US'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Giọng Mỹ (US Accent)"
              >
                🇺🇸 US
              </button>
              <button
                type="button"
                onClick={() => onChangeAccent('en-GB')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  preferredAccent === 'en-GB'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Giọng Anh (UK Accent)"
              >
                🇬🇧 UK
              </button>
              <button
                type="button"
                onClick={() => onChangeAccent('en-AU')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  preferredAccent === 'en-AU'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Giọng Úc (AU Accent)"
              >
                🇦🇺 AU
              </button>
            </div>

            {/* Audio Speed Selector */}
            <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => onChangeRate(playbackRate === 1.0 ? 0.8 : playbackRate === 0.8 ? 1.2 : 1.0)}
                className="px-2 py-1 rounded-md font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                title="Tốc độ phát âm"
              >
                ⚡ {playbackRate}x
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* GitHub Repo Link */}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold shadow-xs transition-colors border border-slate-700"
              title="Mã nguồn GitHub: thunopro/english"
            >
              <GithubIcon className="w-4 h-4 text-white" />
              <span className="hidden lg:inline">GitHub</span>
            </a>

            {/* Add Word Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold shadow-sm shadow-indigo-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm từ mới</span>
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSelectView(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                currentView === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Giọng phát âm:</span>
            <div className="flex gap-1">
              {(['en-US', 'en-GB', 'en-AU'] as PreferredAccent[]).map((acc) => (
                <button
                  key={acc}
                  onClick={() => onChangeAccent(acc)}
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    preferredAccent === acc
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {acc.replace('en-', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile GitHub & Google Docs Links */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              <span className="flex items-center gap-2">
                <GithubIcon className="w-4 h-4" />
                Mã nguồn: thunopro/english
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <a
              href={PEARLS_DOC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Tài liệu Google Docs gốc
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
