import { WordEntry } from '../types/word';

/**
 * Generates direct link to a word within the current web app
 */
export function getWordDeepLink(wordId: string): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    return `${origin}${pathname}#word=${encodeURIComponent(wordId)}`;
  }
  return `#word=${encodeURIComponent(wordId)}`;
}

/**
 * Generates a clean Markdown list of all words with deep links
 */
export function exportToMarkdownList(words: WordEntry[]): string {
  const lines: string[] = [
    '# 📚 Danh Sách Từ Vựng Tiếng Anh (Vocabulary List)',
    '',
    `*Tổng số từ: ${words.length}* | Ngày xuất: ${new Date().toISOString().split('T')[0]}`,
    '',
  ];

  words.forEach((w) => {
    const link = getWordDeepLink(w.id);
    const audioPart = w.audio ? ` [🔊 Nghe](${w.audio})` : '';
    lines.push(`- **[${w.word}](${link})** \`${w.phonetic}\` (*${w.partOfSpeech}*): ${w.meaningVi}${audioPart}`);
  });

  return lines.join('\n');
}

/**
 * Generates a Markdown Table of all words
 */
export function exportToMarkdownTable(words: WordEntry[]): string {
  const lines: string[] = [
    '| Từ vựng | Phiên âm | Loại từ | Nghĩa tiếng Việt | Link chi tiết | Audio |',
    '| :--- | :--- | :--- | :--- | :--- | :--- |',
  ];

  words.forEach((w) => {
    const link = getWordDeepLink(w.id);
    const audioCol = w.audio ? `[Nghe MP3](${w.audio})` : 'TTS';
    lines.push(`| **${w.word}** | \`${w.phonetic}\` | *${w.partOfSpeech}* | ${w.meaningVi.replace(/\|/g, '/')} | [🔗 Xem từ](${link}) | ${audioCol} |`);
  });

  return lines.join('\n');
}

/**
 * Generates raw Plain Text links for sharing or pasting into notes
 */
export function exportToPlainTextList(words: WordEntry[]): string {
  return words
    .map((w) => {
      const link = getWordDeepLink(w.id);
      return `${w.word} ${w.phonetic} (${w.partOfSpeech}): ${w.meaningVi} -> ${link}`;
    })
    .join('\n');
}

/**
 * Generates Anki-compatible TSV/CSV format
 * Format: Word + IPA \t Meaning (VI + EN) + Examples \t Tags
 */
export function exportToAnkiCSV(words: WordEntry[]): string {
  const rows = words.map((w) => {
    const front = `<b>${w.word}</b> <span style="color:#6366f1;">${w.phonetic}</span><br><i>(${w.partOfSpeech})</i>`;
    const examplesHtml = (w.examples || [])
      .map((ex) => `<li>${ex.en}${ex.vi ? `<br><small style="color:#64748b;">${ex.vi}</small>` : ''}</li>`)
      .join('');

    const back = `<b>${w.meaningVi}</b><br><div style="margin-top:6px; color:#475569;">${w.meaningEn}</div>${examplesHtml ? `<ul style="margin-top:8px; text-align:left;">${examplesHtml}</ul>` : ''}`;
    const tags = (w.tags || []).join(' ');

    return `"${front.replace(/"/g, '""')}"\t"${back.replace(/"/g, '""')}"\t"${tags.replace(/"/g, '""')}"`;
  });

  return rows.join('\n');
}

/**
 * Triggers a browser file download for text/json content
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
