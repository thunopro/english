#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const wordsFilePath = path.resolve(__dirname, '../data/words.json');

console.log('🔍 Validating data/words.json...');

if (!fs.existsSync(wordsFilePath)) {
  console.error(`❌ Error: File not found: ${wordsFilePath}`);
  process.exit(1);
}

try {
  const content = fs.readFileSync(wordsFilePath, 'utf8');
  const words = JSON.parse(content);

  if (!Array.isArray(words)) {
    throw new Error('data/words.json must be a JSON array of word objects.');
  }

  const seenIds = new Set();
  const validPOS = new Set([
    'noun', 'verb', 'adjective', 'adverb',
    'idiom', 'phrasal verb', 'preposition', 'phrase', 'other'
  ]);
  const validLevels = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

  let errors = 0;

  words.forEach((entry, idx) => {
    const loc = `Word #${idx + 1} (${entry.word || 'unknown'})`;

    if (!entry.id || typeof entry.id !== 'string') {
      console.error(`❌ [${loc}]: Missing or invalid 'id' field.`);
      errors++;
    } else if (seenIds.has(entry.id)) {
      console.error(`❌ [${loc}]: Duplicate id detected: "${entry.id}".`);
      errors++;
    } else {
      seenIds.add(entry.id);
    }

    if (!entry.word || typeof entry.word !== 'string') {
      console.error(`❌ [${loc}]: Missing or invalid 'word' string.`);
      errors++;
    }

    if (!entry.phonetic || typeof entry.phonetic !== 'string') {
      console.error(`❌ [${loc}]: Missing or invalid 'phonetic' IPA string.`);
      errors++;
    }

    if (!entry.partOfSpeech || !validPOS.has(entry.partOfSpeech)) {
      console.error(`❌ [${loc}]: Invalid partOfSpeech "${entry.partOfSpeech}".`);
      errors++;
    }

    if (!entry.meaningVi || typeof entry.meaningVi !== 'string') {
      console.error(`❌ [${loc}]: Missing 'meaningVi'.`);
      errors++;
    }

    if (!entry.meaningEn || typeof entry.meaningEn !== 'string') {
      console.error(`❌ [${loc}]: Missing 'meaningEn'.`);
      errors++;
    }

    if (!Array.isArray(entry.examples) || entry.examples.length === 0) {
      console.error(`❌ [${loc}]: Must have at least 1 example sentence.`);
      errors++;
    } else {
      entry.examples.forEach((ex, exIdx) => {
        if (!ex.en || typeof ex.en !== 'string') {
          console.error(`❌ [${loc}]: Example #${exIdx + 1} missing English sentence 'en'.`);
          errors++;
        }
      });
    }

    if (entry.level && !validLevels.has(entry.level)) {
      console.error(`❌ [${loc}]: Invalid CEFR level "${entry.level}".`);
      errors++;
    }
  });

  if (errors > 0) {
    console.error(`\n❌ Validation FAILED with ${errors} error(s).`);
    process.exit(1);
  }

  console.log(`✅ Validation PASSED! Verified ${words.length} vocabulary entries with 0 errors.`);
} catch (err) {
  console.error(`❌ Fatal syntax or reading error: ${err.message}`);
  process.exit(1);
}
