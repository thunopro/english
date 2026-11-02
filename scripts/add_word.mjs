#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wordsFilePath = path.resolve(__dirname, '../data/words.json');
const publicWordsFilePath = path.resolve(__dirname, '../public/words.json');

const targetWord = process.argv[2]?.trim().toLowerCase();
const argMeaningVi = process.argv[3]?.trim();

if (!targetWord) {
  console.log(`
📖 Cách sử dụng script thêm từ vựng:
  node scripts/add_word.mjs <từ_tiếng_anh> [nghĩa_tiếng_việt]

Ví dụ:
  node scripts/add_word.mjs "perseverance" "sự kiên trì, bền bỉ"
  node scripts/add_word.mjs "ephemeral"
`);
  process.exit(0);
}

const slug = targetWord.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

async function lookupDictionary(word) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch {
    return null;
  }
}

async function main() {
  console.log(`🔍 Đang tra cứu thông tin từ điển cho: "${targetWord}"...`);

  // Load existing words
  let words = [];
  if (fs.existsSync(wordsFilePath)) {
    try {
      words = JSON.parse(fs.readFileSync(wordsFilePath, 'utf8'));
    } catch {
      words = [];
    }
  }

  const existingIdx = words.findIndex((w) => w.id === slug || w.word.toLowerCase() === targetWord);
  if (existingIdx !== -1) {
    console.warn(`⚠️ Từ "${targetWord}" đã tồn tại trong danh sách (id: ${words[existingIdx].id})!`);
  }

  const dictData = await lookupDictionary(targetWord);

  let phonetic = '';
  let audioUrl = '';
  let partOfSpeech = 'noun';
  let meaningEn = '';
  /** @type {Array<{en: string, vi?: string}>} */
  const examples = [];
  /** @type {string[]} */
  const synonyms = [];
  /** @type {string[]} */
  const antonyms = [];

  if (dictData) {
    // 1. Phonetics
    if (dictData.phonetic) {
      phonetic = dictData.phonetic;
    }
    if (Array.isArray(dictData.phonetics)) {
      for (const p of dictData.phonetics) {
        if (!phonetic && p.text) phonetic = p.text;
        if (!audioUrl && p.audio && p.audio.endsWith('.mp3')) {
          audioUrl = p.audio.startsWith('http') ? p.audio : `https:${p.audio}`;
        }
      }
    }

    // 2. Meanings
    if (Array.isArray(dictData.meanings) && dictData.meanings.length > 0) {
      const firstMeaning = dictData.meanings[0];
      partOfSpeech = firstMeaning.partOfSpeech || 'noun';

      if (Array.isArray(firstMeaning.definitions) && firstMeaning.definitions.length > 0) {
        const def = firstMeaning.definitions[0];
        meaningEn = def.definition || '';
        if (def.example) {
          examples.push({ en: def.example, vi: '' });
        }
      }

      if (Array.isArray(firstMeaning.synonyms)) {
        synonyms.push(...firstMeaning.synonyms.slice(0, 5));
      }
      if (Array.isArray(firstMeaning.antonyms)) {
        antonyms.push(...firstMeaning.antonyms.slice(0, 5));
      }
    }
  }

  // Fallbacks if not found in API
  if (!phonetic) phonetic = `/${targetWord}/`;
  if (!meaningEn) meaningEn = `Definition of ${targetWord}`;
  if (examples.length === 0) {
    examples.push({ en: `This is an example sentence using the word "${targetWord}".`, vi: '' });
  }

  const newEntry = {
    id: slug,
    word: targetWord,
    phonetic: phonetic,
    audio: audioUrl || undefined,
    partOfSpeech: partOfSpeech,
    meaningVi: argMeaningVi || `(Nghĩa của từ ${targetWord})`,
    meaningEn: meaningEn,
    examples: examples,
    synonyms: synonyms.length > 0 ? synonyms : undefined,
    antonyms: antonyms.length > 0 ? antonyms : undefined,
    collocations: [],
    tags: ['Learning'],
    level: 'B2',
    notes: '',
    dateAdded: new Date().toISOString().split('T')[0]
  };

  if (existingIdx !== -1) {
    words[existingIdx] = { ...words[existingIdx], ...newEntry };
    console.log(`🔄 Đã cập nhật từ vựng: ${targetWord}`);
  } else {
    words.unshift(newEntry);
    console.log(`✨ Đã thêm từ vựng mới: ${targetWord}`);
  }

  // Save to data/words.json
  fs.writeFileSync(wordsFilePath, JSON.stringify(words, null, 2), 'utf8');

  // Copy to public/words.json
  if (fs.existsSync(path.dirname(publicWordsFilePath))) {
    fs.writeFileSync(publicWordsFilePath, JSON.stringify(words, null, 2), 'utf8');
  }

  console.log(`💾 Đã lưu vào ${wordsFilePath} (Tổng số: ${words.length} từ)`);

  // Run markdown export
  try {
    const { execSync } = await import('node:child_process');
    execSync(`node "${path.resolve(__dirname, 'export_markdown.mjs')}"`, { stdio: 'inherit' });
  } catch (err) {
    console.warn('Không thể tự động xuất VOCABULARY.md:', err.message);
  }

  console.log(`\n🎉 Thành công! Link trực tiếp: #word=${slug}`);
  if (audioUrl) {
    console.log(`🔊 Audio URL: ${audioUrl}`);
  }
}

main().catch((err) => {
  console.error('Lỗi khi thêm từ:', err);
  process.exit(1);
});
