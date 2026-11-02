import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const wordsFilePath = path.resolve(__dirname, '../data/words.json');
const publicWordsPath = path.resolve(__dirname, '../public/words.json');
const audioDir = path.resolve(__dirname, '../public/audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const words = JSON.parse(fs.readFileSync(wordsFilePath, 'utf8'));

async function downloadAudio(text, outputPath) {
  const encoded = encodeURIComponent(text);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encoded}`;
  
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch audio for "${text}": HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(outputPath, buffer);
  return buffer.length;
}

async function run() {
  console.log(`Starting audio download for ${words.length} vocabulary words...`);

  for (const item of words) {
    const audioFileName = `${item.id}.mp3`;
    const audioPath = path.join(audioDir, audioFileName);

    // Audio text to pronounce
    const textToSpeak = item.word;

    try {
      const bytes = await downloadAudio(textToSpeak, audioPath);
      console.log(`✓ [${item.id}] Downloaded ${bytes} bytes for "${textToSpeak}" -> /audio/${audioFileName}`);
      item.audio = `/audio/${audioFileName}`;
    } catch (err) {
      console.error(`✗ Error downloading audio for ${item.id}: ${err.message}`);
    }

    // Small delay to be polite
    await new Promise((r) => setTimeout(r, 200));
  }

  // Save updated words.json
  fs.writeFileSync(wordsFilePath, JSON.stringify(words, null, 2), 'utf8');
  fs.writeFileSync(publicWordsPath, JSON.stringify(words, null, 2), 'utf8');
  console.log(`\n🎉 Successfully downloaded all audio files and updated words.json!`);
}

run();
