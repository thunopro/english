import React, { useState } from 'react';
import { X, Search, Sparkles, Check, Download, Copy, GitBranch, AlertCircle, Loader2 } from 'lucide-react';
import { WordEntry, PartOfSpeech, CEFRLevel } from '../types/word';
import { fetchFromFreeDictionary, createWordEntry } from '../services/dictionaryApi';
import { downloadFile } from '../utils/exportUtils';
import { getGitHubConfig, saveGitHubConfig, commitWordsToGitHub } from '../services/githubSync';

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWord: (word: WordEntry) => void;
  allWords: WordEntry[];
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  onClose,
  onAddWord,
  allWords,
  showToast,
}) => {
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [meaningVi, setMeaningVi] = useState('');
  const [meaningEn, setMeaningEn] = useState('');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleVi, setExampleVi] = useState('');
  const [collocations, setCollocations] = useState('');
  const [synonyms, setSynonyms] = useState('');
  const [tags, setTags] = useState('Learning');
  const [level, setLevel] = useState<CEFRLevel>('B2');
  const [notes, setNotes] = useState('');

  const [isFetching, setIsFetching] = useState(false);
  const [syncWithGitHub, setSyncWithGitHub] = useState(false);
  const [ghToken, setGhToken] = useState('');
  const [ghOwner, setGhOwner] = useState('');
  const [ghRepo, setGhRepo] = useState('');
  const [ghBranch, setGhBranch] = useState('main');
  const [isSyncing, setIsSyncing] = useState(false);

  // Initialize github config if present
  React.useEffect(() => {
    const config = getGitHubConfig();
    if (config) {
      setGhOwner(config.owner);
      setGhRepo(config.repo);
      setGhBranch(config.branch);
      setGhToken(config.token);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAutoFetch = async () => {
    if (!word.trim()) {
      showToast('error', 'Vui lòng nhập từ tiếng Anh trước khi tra từ điển!');
      return;
    }
    setIsFetching(true);
    try {
      const data = await fetchFromFreeDictionary(word);
      if (data) {
        setPhonetic(data.phonetic);
        if (data.audioUrl) setAudioUrl(data.audioUrl);
        setPartOfSpeech(data.partOfSpeech);
        setMeaningEn(data.meaningEn);
        if (data.examples.length > 0) {
          setExampleEn(data.examples[0].en);
          setExampleVi(data.examples[0].vi || '');
        }
        if (data.synonyms.length > 0) {
          setSynonyms(data.synonyms.join(', '));
        }
        showToast('success', `Đã tự động lấy phiên âm, audio và định nghĩa cho "${word}"!`);
      } else {
        showToast('info', `Không tìm thấy từ "${word}" trên Free Dictionary. Bạn có thể tự điền tay nhé!`);
        if (!phonetic) setPhonetic(`/${word.trim()}/`);
      }
    } catch {
      showToast('error', 'Có lỗi xảy ra khi kết nối từ điển.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim()) {
      showToast('error', 'Vui lòng nhập từ vựng!');
      return;
    }
    if (!meaningVi.trim()) {
      showToast('error', 'Vui lòng nhập nghĩa tiếng Việt!');
      return;
    }

    const newEntry = createWordEntry({
      word,
      phonetic,
      audio: audioUrl,
      partOfSpeech,
      meaningVi,
      meaningEn: meaningEn || `Definition of ${word}`,
      examples: exampleEn ? [{ en: exampleEn, vi: exampleVi }] : [{ en: `Example sentence with ${word}.` }],
      collocations: collocations ? collocations.split(',').map((c) => c.trim()).filter(Boolean) : [],
      synonyms: synonyms ? synonyms.split(',').map((s) => s.trim()).filter(Boolean) : [],
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : ['Learning'],
      level,
      notes,
    });

    onAddWord(newEntry);
    showToast('success', `Đã thêm từ "${word}" vào kho từ vựng!`);

    // If GitHub direct sync is enabled
    if (syncWithGitHub && ghToken && ghOwner && ghRepo) {
      setIsSyncing(true);
      saveGitHubConfig({
        owner: ghOwner,
        repo: ghRepo,
        branch: ghBranch || 'main',
        token: ghToken,
      });

      const updatedWords = [newEntry, ...allWords.filter((w) => w.id !== newEntry.id)];
      const res = await commitWordsToGitHub(
        updatedWords,
        `vocab: add "${newEntry.word}" with audio & pronunciation`,
        { owner: ghOwner, repo: ghRepo, branch: ghBranch || 'main', token: ghToken }
      );

      setIsSyncing(false);
      if (res.success) {
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    }

    onClose();
  };

  const handleDownloadUpdatedJSON = () => {
    const updatedWords = [
      createWordEntry({
        word,
        phonetic,
        audio: audioUrl,
        partOfSpeech,
        meaningVi,
        meaningEn,
        examples: exampleEn ? [{ en: exampleEn, vi: exampleVi }] : [],
        collocations: collocations ? collocations.split(',').map((c) => c.trim()) : [],
        synonyms: synonyms ? synonyms.split(',').map((s) => s.trim()) : [],
        tags: tags ? tags.split(',').map((t) => t.trim()) : ['Learning'],
        level,
        notes,
      }),
      ...allWords,
    ];

    downloadFile(JSON.stringify(updatedWords, null, 2), 'words.json', 'application/json');
    showToast('success', 'Đã tải file words.json! Bạn có thể commit file này vào repo GitHub.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Thêm Từ Vựng Mới
              </h3>
              <p className="text-xs text-slate-500">
                Tự động tra cứu phát âm, IPA và đồng bộ vào GitHub repo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Word Input + Auto Fetch Button */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Từ tiếng Anh hoặc cụm từ <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Ví dụ: serendipity, resilient, catch-22..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <button
                type="button"
                onClick={handleAutoFetch}
                disabled={isFetching}
                className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 border border-indigo-200 dark:border-indigo-800"
              >
                {isFetching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
                <span>{isFetching ? 'Đang tra...' : 'Tra tự động'}</span>
              </button>
            </div>
          </div>

          {/* Phonetic & Audio URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Phiên âm IPA
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder="/ˌser.ənˈdɪp.ə.ti/"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Link Audio MP3 (Tùy chọn)
              </label>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://...mp3 (Nếu trống sẽ dùng Web Speech)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Part of Speech & Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Loại từ
              </label>
              <select
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="noun">Danh từ (Noun)</option>
                <option value="verb">Động từ (Verb)</option>
                <option value="adjective">Tính từ (Adjective)</option>
                <option value="adverb">Trạng từ (Adverb)</option>
                <option value="idiom">Thành ngữ (Idiom)</option>
                <option value="phrasal verb">Cụm động từ (Phrasal Verb)</option>
                <option value="phrase">Cụm từ (Phrase)</option>
                <option value="preposition">Giới từ (Preposition)</option>
                <option value="other">Khác (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Cấp độ CEFR
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as CEFRLevel)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="A1">A1 - Sơ cấp</option>
                <option value="A2">A2 - Tiền trung cấp</option>
                <option value="B1">B1 - Trung cấp</option>
                <option value="B2">B2 - Trung cao cấp</option>
                <option value="C1">C1 - Cao cấp</option>
                <option value="C2">C2 - Thành thạo / Bản xứ</option>
              </select>
            </div>
          </div>

          {/* Vietnamese Meaning */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Nghĩa tiếng Việt <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={meaningVi}
              onChange={(e) => setMeaningVi(e.target.value)}
              placeholder="Giải thích nghĩa tiếng Việt rõ ràng, dễ hiểu..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          {/* English Meaning */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Định nghĩa tiếng Anh (English Definition)
            </label>
            <input
              type="text"
              value={meaningEn}
              onChange={(e) => setMeaningEn(e.target.value)}
              placeholder="English definition..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Example Sentence */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Ví dụ câu mẫu
            </label>
            <input
              type="text"
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              placeholder="Câu ví dụ tiếng Anh..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <input
              type="text"
              value={exampleVi}
              onChange={(e) => setExampleVi(e.target.value)}
              placeholder="Dịch nghĩa câu ví dụ (tùy chọn)..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Collocations & Synonyms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Collocations (cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                value={collocations}
                onChange={(e) => setCollocations(e.target.value)}
                placeholder="pure serendipity, stroke of..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Đồng nghĩa (Synonyms)
              </label>
              <input
                type="text"
                value={synonyms}
                onChange={(e) => setSynonyms(e.target.value)}
                placeholder="fluke, stroke of luck..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Tags & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tags (cách nhau dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="IELTS, Work, Daily, Tech..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Ghi chú / Mẹo nhớ
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gợi nhớ, nguồn đọc được..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Optional Direct GitHub Sync Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSyncWithGitHub(!syncWithGitHub)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600"
            >
              <GitBranch size={14} />
              <span>Đồng bộ trực tiếp lên GitHub repo (Tùy chọn)</span>
            </button>

            {syncWithGitHub && (
              <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">GitHub Owner / User</label>
                    <input
                      type="text"
                      value={ghOwner}
                      onChange={(e) => setGhOwner(e.target.value)}
                      placeholder="thunopro"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Repo Name</label>
                    <input
                      type="text"
                      value={ghRepo}
                      onChange={(e) => setGhRepo(e.target.value)}
                      placeholder="english"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">
                    GitHub Personal Access Token (classic hoặc fine-grained với quyền contents:write)
                  </label>
                  <input
                    type="password"
                    value={ghToken}
                    onChange={(e) => setGhToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxx"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleDownloadUpdatedJSON}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Download size={13} />
              <span>Tải file words.json cập nhật</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
              >
                {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                <span>{isSyncing ? 'Đang sync GitHub...' : 'Lưu từ vựng'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
