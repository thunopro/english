import { describe, it, expect } from 'vitest';
import {
  getWordDeepLink,
  exportToMarkdownList,
  exportToMarkdownTable,
  exportToPlainTextList,
  exportToAnkiCSV,
} from '../src/utils/exportUtils';
import { WordEntry } from '../src/types/word';

const mockWords: WordEntry[] = [
  {
    id: 'serendipity',
    word: 'serendipity',
    phonetic: '/ˌser.ənˈdɪp.ə.ti/',
    audio: 'https://example.com/audio.mp3',
    partOfSpeech: 'noun',
    meaningVi: 'Sự tình cờ may mắn',
    meaningEn: 'The occurrence of events by chance in a happy way',
    examples: [{ en: 'Pure serendipity.' }],
    tags: ['IELTS', 'C2'],
    dateAdded: '2026-11-01',
  },
];

describe('Export Utilities & Deep Linking', () => {
  it('generates word deep link with hash anchor', () => {
    const link = getWordDeepLink('serendipity');
    expect(link).toContain('#word=serendipity');
  });

  it('generates clean Markdown list format', () => {
    const md = exportToMarkdownList(mockWords);
    expect(md).toContain('# 📚 Danh Sách Từ Vựng');
    expect(md).toContain('**[serendipity]');
    expect(md).toContain('/ˌser.ənˈdɪp.ə.ti/');
    expect(md).toContain('Sự tình cờ may mắn');
    expect(md).toContain('[🔊 Nghe](https://example.com/audio.mp3)');
  });

  it('generates Markdown table format', () => {
    const table = exportToMarkdownTable(mockWords);
    expect(table).toContain('| Từ vựng | Phiên âm |');
    expect(table).toContain('| **serendipity** |');
  });

  it('generates plain text link list', () => {
    const txt = exportToPlainTextList(mockWords);
    expect(txt).toContain('serendipity /ˌser.ənˈdɪp.ə.ti/ (noun): Sự tình cờ may mắn ->');
    expect(txt).toContain('#word=serendipity');
  });

  it('generates Anki-compatible TSV output', () => {
    const anki = exportToAnkiCSV(mockWords);
    expect(anki).toContain('serendipity');
    expect(anki).toContain('Sự tình cờ may mắn');
    expect(anki).toContain('IELTS C2');
  });
});
