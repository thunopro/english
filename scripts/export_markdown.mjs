#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wordsFilePath = path.resolve(__dirname, '../data/words.json');
const outputPath = path.resolve(__dirname, '../VOCABULARY.md');

try {
  const content = fs.readFileSync(wordsFilePath, 'utf8');
  /** @type {Array<any>} */
  const words = JSON.parse(content);

  // Sort alphabetically
  const sorted = [...words].sort((a, b) => a.word.localeCompare(b.word));

  const lines = [
    '# 📚 Bảng Từ Vựng Tiếng Anh & Liên Kết Học Tập (Vocabulary Index)',
    '',
    `> **Tổng số từ hiện tại**: ${words.length} từ | Cập nhật tự động lần cuối: ${new Date().toISOString().split('T')[0]}`,
    '',
    'Mục lục này cho phép bạn truy cập nhanh link text của tất cả các từ mới, bấm nghe phát âm trực tiếp hoặc chuyển hướng vào ứng dụng web học tập.',
    '',
    '## 🔗 Danh Sách Nhanh (Quick Text Links)',
    ''
  ];

  sorted.forEach((w) => {
    const audioMd = w.audio ? `[🔊 Nghe](${w.audio})` : '*(TTS)*';
    lines.push(`- **[${w.word}](#word-${w.id})** \`${w.phonetic}\` (*${w.partOfSpeech}*): ${w.meaningVi} — ${audioMd} | [🔗 Học từ này](#word=${w.id})`);
  });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 📖 Chi Tiết Từng Từ Vựng (Detailed Word Vault)');
  lines.push('');

  sorted.forEach((w) => {
    lines.push(`### <a id="word-${w.id}"></a>${w.word} \`${w.phonetic}\``);
    lines.push(`- **Loại từ:** *${w.partOfSpeech}* ${w.level ? `| **Cấp độ:** \`${w.level}\`` : ''}`);
    lines.push(`- **Định nghĩa tiếng Việt:** **${w.meaningVi}**`);
    lines.push(`- **English definition:** *${w.meaningEn}*`);
    if (w.audio) {
      lines.push(`- **Phát âm chuẩn (Audio Link):** [Bấm nghe trực tiếp MP3](${w.audio})`);
    }
    if (w.collocations && w.collocations.length > 0) {
      lines.push(`- **Collocations:** \`${w.collocations.join('`, `')}\``);
    }
    if (w.synonyms && w.synonyms.length > 0) {
      lines.push(`- **Đồng nghĩa:** ${w.synonyms.join(', ')}`);
    }
    if (w.antonyms && w.antonyms.length > 0) {
      lines.push(`- **Trái nghĩa:** ${w.antonyms.join(', ')}`);
    }
    lines.push('- **Ví dụ minh họa:**');
    w.examples.forEach((ex) => {
      lines.push(`  - *"${ex.en}"*`);
      if (ex.vi) {
        lines.push(`    ↳ *${ex.vi}*`);
      }
    });
    if (w.notes) {
      lines.push(`- 💡 **Ghi chú & Mẹo nhớ:** ${w.notes}`);
    }
    if (w.tags && w.tags.length > 0) {
      lines.push(`- 🏷️ **Tags:** ${w.tags.map(t => `\`#${t}\``).join(' ')}`);
    }
    lines.push('');
  });

  fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
  console.log(`✅ Generated VOCABULARY.md with ${words.length} entries.`);
} catch (err) {
  console.error(`❌ Error generating VOCABULARY.md: ${err.message}`);
  process.exit(1);
}
