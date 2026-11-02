import React, { useState, useMemo } from 'react';
import { Link2, Copy, Download, FileText, Printer, Check, Search, ExternalLink, Sparkles, Volume2 } from 'lucide-react';
import { WordEntry } from '../types/word';
import { AudioButton } from './AudioButton';
import {
  getWordDeepLink,
  exportToMarkdownList,
  exportToMarkdownTable,
  exportToPlainTextList,
  exportToAnkiCSV,
  downloadFile,
} from '../utils/exportUtils';

interface TextListViewProps {
  words: WordEntry[];
  isPlaying: boolean;
  onPlay: (word: string, audioUrl?: string) => void;
  onOpenDetail: (word: WordEntry) => void;
  onCopyLink: (wordId: string) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const TextListView: React.FC<TextListViewProps> = ({
  words,
  isPlaying,
  onPlay,
  onOpenDetail,
  onCopyLink,
  showToast,
}) => {
  const [search, setSearch] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const filteredWords = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return words;
    return words.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        w.meaningVi.toLowerCase().includes(q) ||
        w.phonetic.toLowerCase().includes(q) ||
        (w.tags && w.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }, [words, search]);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(label);
      showToast('success', `Đã copy thành công: ${label}`);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      showToast('error', 'Không thể copy vào clipboard.');
    }
  };

  const handleCopyAllMarkdown = () => {
    const md = exportToMarkdownList(filteredWords);
    copyToClipboard(md, 'Toàn bộ link Markdown');
  };

  const handleCopyAllPlainText = () => {
    const txt = exportToPlainTextList(filteredWords);
    copyToClipboard(txt, 'Toàn bộ Plain Text link');
  };

  const handleDownloadMarkdown = () => {
    const md = exportToMarkdownTable(filteredWords);
    downloadFile(md, 'VOCABULARY_TABLE.md', 'text/markdown;charset=utf-8');
    showToast('success', 'Đã tải bảng từ vựng Markdown!');
  };

  const handleDownloadAnki = () => {
    const csv = exportToAnkiCSV(filteredWords);
    downloadFile(csv, 'anki_vocab_deck.tsv', 'text/tab-separated-values;charset=utf-8');
    showToast('success', 'Đã xuất file Anki Deck (.tsv)! Có thể import ngay vào Anki.');
  };

  const handleDownloadJSON = () => {
    downloadFile(JSON.stringify(words, null, 2), 'words.json', 'application/json;charset=utf-8');
    showToast('success', 'Đã tải file words.json!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-indigo-400/30">
            <Link2 size={14} />
            <span>Thư Viện Link Text & Định Dạng Học Tập</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tra Cứu Link Text & Xuất Dữ Liệu Học Dần
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Mỗi từ mới đều có một đường dẫn trực tiếp (<code className="text-indigo-300 bg-indigo-950/80 px-1.5 py-0.5 rounded font-mono text-xs">#word=&lt;slug&gt;</code>) cùng phát âm chuẩn. Bạn có thể copy nhanh link text để lưu vào Notion, Obsidian, Anki hoặc học lại bất cứ lúc nào!
          </p>

          {/* Quick Actions Row */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={handleCopyAllMarkdown}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedType === 'Toàn bộ link Markdown' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>Copy toàn bộ Markdown</span>
            </button>
            <button
              onClick={handleCopyAllPlainText}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedType === 'Toàn bộ Plain Text link' ? <Check size={14} className="text-emerald-400" /> : <FileText size={14} />}
              <span>Copy Plain Text</span>
            </button>
            <button
              onClick={handleDownloadAnki}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Xuất Anki Deck (TSV)</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Tải file Markdown</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} />
              <span>Tải words.json</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer size={14} />
              <span>In trang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo từ, phiên âm, nghĩa tiếng Việt, tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="text-xs text-slate-500 whitespace-nowrap">
          Hiển thị <span className="font-bold text-slate-900 dark:text-white">{filteredWords.length}</span> từ
        </div>
      </div>

      {/* Directory Table / List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Từ vựng & Phát âm</th>
                <th className="py-3.5 px-4">Loại từ</th>
                <th className="py-3.5 px-4">Nghĩa tiếng Việt</th>
                <th className="py-3.5 px-4">Link Text trực tiếp</th>
                <th className="py-3.5 px-4 text-center">Audio</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredWords.map((w) => {
                const deepLink = getWordDeepLink(w.id);
                return (
                  <tr
                    key={w.id}
                    className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors group"
                  >
                    {/* Word & IPA */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenDetail(w)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-base transition-colors text-left"
                        >
                          {w.word}
                        </button>
                        <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                          {w.phonetic}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 italic truncate max-w-xs mt-0.5">
                        {w.meaningEn}
                      </div>
                    </td>

                    {/* Part of Speech */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold capitalize bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {w.partOfSpeech}
                      </span>
                    </td>

                    {/* Vietnamese Definition */}
                    <td className="py-3 px-4 max-w-sm">
                      <span className="text-slate-800 dark:text-slate-200 line-clamp-2">
                        {w.meaningVi}
                      </span>
                    </td>

                    {/* Direct Link Text */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <a
                          href={`#word=${w.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onOpenDetail(w);
                          }}
                          className="font-mono text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                          title={`Xem chi tiết từ ${w.word}`}
                        >
                          #{w.id}
                        </a>
                      </div>
                    </td>

                    {/* Audio Button */}
                    <td className="py-3 px-4 text-center">
                      <AudioButton
                        word={w.word}
                        audioUrl={w.audio}
                        isPlaying={isPlaying}
                        onPlay={onPlay}
                        size="sm"
                      />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onCopyLink(w.id)}
                          title="Copy đường dẫn trực tiếp"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Copy size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenDetail(w)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <ExternalLink size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
