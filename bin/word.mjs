#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate the english vocab repository directory
function findRepoRoot() {
  if (process.env.VOCAB_REPO_PATH && fs.existsSync(process.env.VOCAB_REPO_PATH)) {
    return path.resolve(process.env.VOCAB_REPO_PATH);
  }

  // Check parent of bin
  const candidateFromBin = path.resolve(__dirname, '..');
  if (fs.existsSync(path.join(candidateFromBin, 'data', 'words.json'))) {
    return candidateFromBin;
  }

  // Check current working directory
  let curr = process.cwd();
  while (curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, 'data', 'words.json'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }

  // Default fallback
  const defaultDir = '/home/luongminhthu/Documents/english';
  if (fs.existsSync(path.join(defaultDir, 'data', 'words.json'))) {
    return defaultDir;
  }

  return candidateFromBin;
}

const REPO_ROOT = findRepoRoot();
const WORDS_JSON_PATH = path.join(REPO_ROOT, 'data', 'words.json');
const PUBLIC_WORDS_PATH = path.join(REPO_ROOT, 'public', 'words.json');
const EXPORT_MD_SCRIPT = path.join(REPO_ROOT, 'scripts', 'export_markdown.mjs');

// ANSI Color Helpers
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

// Slugify helper
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-');
}

// Lookup English Dictionary API
async function fetchDictionaryData(queryWord) {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(queryWord.toLowerCase())}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch {
    return null;
  }
}

// Lookup Vietnamese Translation API (MyMemory)
async function fetchVietnameseTranslation(queryWord) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(queryWord)}&langpair=en|vi`
    );
    if (!res.ok) return '';
    const json = await res.json();
    if (json && json.responseData && json.responseData.translatedText) {
      let tr = json.responseData.translatedText.trim();
      // Remove accidental echoes of original word
      if (tr.toLowerCase() === queryWord.toLowerCase()) {
        if (Array.isArray(json.matches)) {
          for (const m of json.matches) {
            if (m.translation && m.translation.toLowerCase() !== queryWord.toLowerCase()) {
              tr = m.translation.trim();
              break;
            }
          }
        }
      }
      return tr;
    }
    return '';
  } catch {
    return '';
  }
}

// Process and enrich word through API filter
async function enrichWord(rawInput) {
  // Check if user entered "word : meaning" or just "word"
  let targetWord = rawInput.trim();
  let customMeaning = '';

  if (targetWord.includes(':')) {
    const parts = targetWord.split(':');
    targetWord = parts[0].trim();
    customMeaning = parts.slice(1).join(':').trim();
  } else if (targetWord.includes(' - ')) {
    const parts = targetWord.split(' - ');
    targetWord = parts[0].trim();
    customMeaning = parts.slice(1).join(' - ').trim();
  }

  const slug = slugify(targetWord);
  process.stdout.write(`  ${c.cyan}⏳ Đang lọc API cho "${c.bold}${targetWord}${c.reset}${c.cyan}"...${c.reset}\r`);

  // Parallel fetch: Dictionary + Translation
  const [dictData, autoVi] = await Promise.all([
    fetchDictionaryData(targetWord),
    customMeaning ? Promise.resolve(customMeaning) : fetchVietnameseTranslation(targetWord),
  ]);

  let phonetic = '';
  let audioUrl = '';
  let partOfSpeech = 'noun';
  let meaningEn = '';
  const examples = [];
  const synonyms = [];
  const antonyms = [];

  if (dictData) {
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

    if (Array.isArray(dictData.meanings) && dictData.meanings.length > 0) {
      const primary = dictData.meanings[0];
      partOfSpeech = primary.partOfSpeech || 'noun';

      if (Array.isArray(primary.definitions) && primary.definitions.length > 0) {
        meaningEn = primary.definitions[0].definition || '';
        for (const def of primary.definitions) {
          if (def.example && examples.length < 2) {
            examples.push({ en: def.example });
          }
        }
      }

      if (Array.isArray(primary.synonyms)) {
        synonyms.push(...primary.synonyms.slice(0, 4));
      }
      if (Array.isArray(primary.antonyms)) {
        antonyms.push(...primary.antonyms.slice(0, 4));
      }
    }
  }

  // Fallbacks
  if (!phonetic) phonetic = `/${targetWord}/`;
  if (!meaningEn) meaningEn = `Definition and usage of ${targetWord}`;
  if (examples.length === 0) {
    examples.push({ en: `Example sentence with the word "${targetWord}".` });
  }

  const finalMeaningVi = customMeaning || autoVi || `Nghĩa của từ ${targetWord}`;

  // Clear line
  process.stdout.write(' '.repeat(70) + '\r');

  return {
    id: slug,
    word: targetWord,
    phonetic,
    audio: audioUrl || undefined,
    partOfSpeech,
    meaningVi: finalMeaningVi,
    meaningEn,
    examples,
    synonyms: synonyms.length > 0 ? synonyms : undefined,
    antonyms: antonyms.length > 0 ? antonyms : undefined,
    collocations: [],
    tags: ['TerminalBuffer', 'Daily'],
    level: 'B2',
    notes: 'Thêm qua terminal word (Ctrl+G)',
    dateAdded: new Date().toISOString().split('T')[0],
  };
}

// Git commit & push pipeline
function syncAndPushToGitHub(addedEntries) {
  console.log(`\n${c.bold}${c.cyan}🚀 Bắt đầu quá trình đồng bộ và push lên GitHub...${c.reset}`);

  try {
    // 1. Regenerate VOCABULARY.md
    if (fs.existsSync(EXPORT_MD_SCRIPT)) {
      execSync(`node "${EXPORT_MD_SCRIPT}"`, { cwd: REPO_ROOT, stdio: 'ignore' });
      console.log(`  ${c.green}✓${c.reset} Đã tạo lại VOCABULARY.md với liên kết tĩnh cho từng từ.`);
    }

    // 2. Git stage
    execSync('git add data/words.json public/words.json VOCABULARY.md', { cwd: REPO_ROOT });
    console.log(`  ${c.green}✓${c.reset} Đã đưa các file vào git staging.`);

    // 3. Git commit
    const wordListStr = addedEntries.map((w) => w.word).slice(0, 3).join(', ') + (addedEntries.length > 3 ? ` (+${addedEntries.length - 3})` : '');
    const commitMsg = `vocab: add ${addedEntries.length} word(s) [${wordListStr}] via word terminal`;
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: REPO_ROOT, stdio: 'pipe' });
    console.log(`  ${c.green}✓${c.reset} Đã tạo commit: "${commitMsg}"`);

    // 4. Git push
    let hasRemote = false;
    try {
      const remotes = execSync('git remote', { cwd: REPO_ROOT }).toString().trim();
      hasRemote = remotes.length > 0;
    } catch {
      hasRemote = false;
    }

    if (hasRemote) {
      console.log(`  ${c.yellow}⏳ Đang đẩy code lên remote repository (git push)...${c.reset}`);
      try {
        const pushResult = execSync('git push', { cwd: REPO_ROOT, stdio: 'pipe' }).toString();
        console.log(`  ${c.green}🎉 PUSH GITHUB THÀNH CÔNG!${c.reset}`);
        if (pushResult.trim()) console.log(`  ${c.dim}${pushResult.trim()}${c.reset}`);
      } catch (pushErr) {
        console.warn(`  ${c.yellow}⚠️ Không thể tự động push: ${pushErr.message.trim()}${c.reset}`);
        console.log(`  ${c.dim}Mẹo: Kiểm tra quyền truy cập git remote hoặc chạy 'git push origin main'${c.reset}`);
      }
    } else {
      console.log(`  ${c.yellow}ℹ️ Git repo hiện chưa gắn remote origin.${c.reset}`);
      console.log(`  ${c.dim}Code đã commit cục bộ an toàn. Khi tạo repo trên GitHub, hãy chạy:${c.reset}`);
      console.log(`  ${c.cyan}git remote add origin https://github.com/<username>/<repo>.git && git push -u origin main${c.reset}`);
    }

    return true;
  } catch (err) {
    console.error(`  ${c.red}❌ Lỗi Git: ${err.message}${c.reset}`);
    return false;
  }
}

// Main interactive buffer terminal
async function runInteractiveTerminal() {
  console.clear();
  console.log(`
${c.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${c.reset}
${c.cyan}║${c.reset}  ${c.bold}${c.magenta}📖 VOCABVAULT TERMINAL BUFFER (Lưu từ nhanh & Lọc API chuẩn hóa)${c.reset}        ${c.cyan}║${c.reset}
${c.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${c.reset}
  📂 Repo từ vựng: ${c.yellow}${REPO_ROOT}${c.reset}
  💡 ${c.bold}Cách sử dụng:${c.reset}
     • Nhập từng từ tiếng Anh bạn vừa học (vd: ${c.green}serendipity${c.reset} hoặc ${c.green}resilience : sự kiên cường${c.reset})
     • Nhấn ${c.bold}Enter${c.reset} để thêm từ vào bộ đệm (Buffer).
     • Nhấn ${c.bold}${c.bgMagenta} Ctrl+G ${c.reset} để ${c.bold}Lọc API từ điển ➔ Chuẩn hóa IPA/Audio ➔ PUSH GITHUB${c.reset}!
     • Nhấn ${c.bold}Ctrl+L${c.reset} để xem các từ đang có trong đệm | ${c.bold}Ctrl+C${c.reset} để thoát.
${c.dim}──────────────────────────────────────────────────────────────────────────────────${c.reset}
`);

  const pendingWords = [];
  let currentInput = '';

  // Setup raw mode for keypress handling
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }

  function promptLine() {
    process.stdout.write(`\r\x1b[K${c.cyan}${c.bold}word (${pendingWords.length}) > ${c.reset}${currentInput}`);
  }

  promptLine();

  process.stdin.on('keypress', async (str, key) => {
    // Check Ctrl+C: Exit
    if (key.ctrl && key.name === 'c') {
      console.log(`\n${c.yellow}👋 Đã đóng VocabVault Buffer. Tạm biệt!${c.reset}\n`);
      process.exit(0);
    }

    // Check Ctrl+L: View Buffer
    if (key.ctrl && key.name === 'l') {
      console.log(`\n\n${c.bold}📋 Danh sách từ đang chờ trong buffer (${pendingWords.length} từ):${c.reset}`);
      if (pendingWords.length === 0) {
        console.log(`  ${c.dim}(Bộ đệm đang trống. Hãy nhập từ rồi gõ Enter)${c.reset}`);
      } else {
        pendingWords.forEach((w, i) => {
          console.log(`  ${i + 1}. ${c.green}${w}${c.reset}`);
        });
      }
      console.log(`${c.dim}Bấm Ctrl+G để lọc API và push lên GitHub.${c.reset}\n`);
      promptLine();
      return;
    }

    // Check Ctrl+G (ASCII 0x07 or key event): Process Buffer & Push!
    const isCtrlG = (key.ctrl && key.name === 'g') || str === '\x07' || str === '\u0007';
    if (isCtrlG) {
      // If there's pending text in input, add it first
      if (currentInput.trim()) {
        pendingWords.push(currentInput.trim());
        currentInput = '';
      }

      if (pendingWords.length === 0) {
        console.log(`\n${c.yellow}⚠️ Bộ đệm đang trống! Hãy nhập ít nhất 1 từ trước khi nhấn Ctrl+G.${c.reset}`);
        promptLine();
        return;
      }

      console.log(`\n\n${c.bold}${c.magenta}⚡ BẮT ĐẦU XỬ LÝ BỘ ĐỆM: ${pendingWords.length} TỪ${c.reset}`);
      console.log(`${c.dim}Đang kết nối API từ điển & API dịch thuật...${c.reset}`);

      // Temporary pause raw mode while doing async batch processing
      process.stdin.pause();

      // Read existing words
      let wordsData = [];
      try {
        wordsData = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
      } catch {
        wordsData = [];
      }

      const addedList = [];
      for (let i = 0; i < pendingWords.length; i++) {
        const raw = pendingWords[i];
        console.log(`\n[${i + 1}/${pendingWords.length}] Đang xử lý: "${c.bold}${raw}${c.reset}"`);
        const enriched = await enrichWord(raw);

        // Check duplicate
        const existingIdx = wordsData.findIndex((w) => w.id === enriched.id);
        if (existingIdx !== -1) {
          console.log(`  ${c.yellow}🔄 Cập nhật từ đã có:${c.reset} ${enriched.word} (${enriched.phonetic})`);
          wordsData[existingIdx] = { ...wordsData[existingIdx], ...enriched };
        } else {
          console.log(`  ${c.green}✨ Thêm từ mới:${c.reset} ${enriched.word} ${c.cyan}${enriched.phonetic}${c.reset} (${enriched.partOfSpeech})`);
          console.log(`     ↳ Nghĩa: ${enriched.meaningVi}`);
          wordsData.unshift(enriched);
        }
        addedList.push(enriched);
      }

      // Write updated words.json
      fs.writeFileSync(WORDS_JSON_PATH, JSON.stringify(wordsData, null, 2), 'utf8');
      if (fs.existsSync(PUBLIC_WORDS_PATH)) {
        fs.writeFileSync(PUBLIC_WORDS_PATH, JSON.stringify(wordsData, null, 2), 'utf8');
      }
      console.log(`\n${c.green}💾 Đã ghi dữ liệu vào data/words.json (Tổng cộng: ${wordsData.length} từ)${c.reset}`);

      // Run Git commit & push
      syncAndPushToGitHub(addedList);

      // Print Summary Table
      console.log(`\n${c.bold}📊 KẾT QUẢ ĐÃ LỌC & LƯU VÀO KHO TỪ:${c.reset}`);
      addedList.forEach((w) => {
        const audioInfo = w.audio ? `${c.green}🔊 Có audio${c.reset}` : `${c.dim}(TTS)${c.reset}`;
        console.log(`  • ${c.bold}${w.word}${c.reset} ${c.cyan}${w.phonetic}${c.reset} [${w.partOfSpeech}] - ${w.meaningVi} | ${audioInfo}`);
        console.log(`    Link text: ${c.blue}#word=${w.id}${c.reset}`);
      });

      // Clear pending
      pendingWords.length = 0;
      currentInput = '';

      console.log(`\n${c.green}✅ Đã hoàn thành đợt thêm từ! Bạn có thể tiếp tục nhập từ mới hoặc nhấn Ctrl+C để thoát.${c.reset}\n`);

      // Resume raw mode
      process.stdin.resume();
      promptLine();
      return;
    }

    // Handle Backspace
    if (key.name === 'backspace') {
      currentInput = currentInput.slice(0, -1);
      promptLine();
      return;
    }

    // Handle Enter: add word to buffer
    if (key.name === 'return' || key.name === 'enter') {
      const trimmed = currentInput.trim();
      if (trimmed) {
        pendingWords.push(trimmed);
        console.log(`\n  ${c.green}➕ Đã ghi nhận vào đệm:${c.reset} "${c.bold}${trimmed}${c.reset}" (Hiện có: ${c.bold}${pendingWords.length}${c.reset} từ chờ Ctrl+G)`);
      }
      currentInput = '';
      promptLine();
      return;
    }

    // Normal typing
    if (str && !key.ctrl && !key.meta) {
      currentInput += str;
      promptLine();
    }
  });
}

// Single-shot CLI execution (e.g., word "serendipity")
async function runSingleWord(arg) {
  console.log(`\n${c.cyan}📖 VocabVault Quick Add: "${arg}"${c.reset}`);
  const enriched = await enrichWord(arg);

  let wordsData = [];
  try {
    wordsData = JSON.parse(fs.readFileSync(WORDS_JSON_PATH, 'utf8'));
  } catch {
    wordsData = [];
  }

  const existingIdx = wordsData.findIndex((w) => w.id === enriched.id);
  if (existingIdx !== -1) {
    wordsData[existingIdx] = { ...wordsData[existingIdx], ...enriched };
    console.log(`${c.yellow}🔄 Cập nhật từ vựng:${c.reset} ${enriched.word}`);
  } else {
    wordsData.unshift(enriched);
    console.log(`${c.green}✨ Thêm từ mới:${c.reset} ${enriched.word}`);
  }

  fs.writeFileSync(WORDS_JSON_PATH, JSON.stringify(wordsData, null, 2), 'utf8');
  if (fs.existsSync(PUBLIC_WORDS_PATH)) {
    fs.writeFileSync(PUBLIC_WORDS_PATH, JSON.stringify(wordsData, null, 2), 'utf8');
  }

  syncAndPushToGitHub([enriched]);

  console.log(`\n${c.bold}Link trực tiếp:${c.reset} ${c.blue}#word=${enriched.id}${c.reset}`);
  if (enriched.audio) console.log(`${c.bold}Audio:${c.reset} ${enriched.audio}`);
  console.log(`${c.green}✅ Hoàn tất!${c.reset}\n`);
}

// Entry point
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
${c.bold}VocabVault CLI Terminal${c.reset} - Ghi chép từ vựng tiếng Anh kèm audio và sync Git

${c.cyan}Cách dùng:${c.reset}
  1. Thêm nhanh 1 từ:
     ${c.bold}word <từ_tiếng_anh>${c.reset}
     ${c.bold}word <từ_tiếng_anh> : <nghĩa_tiếng_việt>${c.reset}
     Ví dụ:
       word serendipity
       word perseverance : sự kiên trì, bền bỉ

  2. Chế độ tương tác nhập từ liên tục:
     ${c.bold}word${c.reset}
     Nhập từ -> gõ Enter để xếp vào đệm -> nhấn Ctrl+G để duyệt & commit hàng loạt lên Git.
`);
  process.exit(0);
}

if (args.length > 0) {
  runSingleWord(args.join(' ')).catch((err) => {
    console.error('Lỗi:', err);
    process.exit(1);
  });
} else {
  runInteractiveTerminal().catch((err) => {
    console.error('Lỗi terminal:', err);
    process.exit(1);
  });
}
