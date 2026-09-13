#!/usr/bin/env node
// Validates the word bank. Run: node tools/validate.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORDS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'words');

// One word per player per round, so a full 10-player game burns this many per tier.
const WORDS_PER_TIER_PER_GAME = 10;
const TARGET_GAMES_WITHOUT_REPEAT = 20;
const TARGET_PER_TIER = WORDS_PER_TIER_PER_GAME * TARGET_GAMES_WITHOUT_REPEAT;

const REQUIRED = ['word', 'tier', 'respelling', 'partOfSpeech', 'origin', 'definition', 'sentence'];
const OPTIONAL = ['alsoAccepted', 'notes'];
const PARTS = new Set(['noun', 'verb', 'adjective', 'adverb']);
const KNOWN_ORIGINS = new Set([
  'Greek', 'Latin', 'French', 'Italian', 'Spanish', 'German', 'Dutch', 'Japanese',
  'Old English', 'English', 'Hebrew', 'Portuguese', 'Arabic', 'Sanskrit', 'Russian',
  'Yiddish', 'Norwegian', 'Swedish', 'Welsh', 'Irish', 'Scottish Gaelic', 'Hindi',
  'Chinese', 'Turkish', 'Persian', 'Malay', 'Hawaiian', 'Nahuatl', 'Algonquian',
]);

const errors = [];
const warnings = [];
const seen = new Map(); // lowercased word/variant -> "tier-N"

function err(where, msg) { errors.push(`${where}: ${msg}`); }
function warn(where, msg) { warnings.push(`${where}: ${msg}`); }

// "sycophant" appears inside "sycophants", so a plain substring check covers
// the inflections our sentences actually use.
function sentenceUsesWord(entry) {
  const hay = entry.sentence.toLowerCase();
  return [entry.word, ...(entry.alsoAccepted ?? [])]
    .some((w) => hay.includes(w.toLowerCase()));
}

// A definition that contains the word (or a near-inflection of it) hands the
// speller the answer.
function definitionGivesItAway(entry) {
  const hay = entry.definition.toLowerCase();
  const w = entry.word.toLowerCase();
  const stems = [w];
  for (const suffix of ['s', 'es', 'ed', 'd', 'ing', 'ly']) {
    if (w.endsWith(suffix) && w.length - suffix.length >= 4) stems.push(w.slice(0, -suffix.length));
  }
  return stems.some((s) => hay.includes(s));
}

const tierCounts = new Map();
const files = readdirSync(WORDS_DIR).filter((f) => f.endsWith('.json')).sort();

for (const file of files) {
  const expectedTier = Number(file.match(/tier-(\d+)\.json/)?.[1]);
  let entries;
  try {
    entries = JSON.parse(readFileSync(join(WORDS_DIR, file), 'utf8'));
  } catch (e) {
    err(file, `invalid JSON - ${e.message}`);
    continue;
  }
  if (!Array.isArray(entries)) { err(file, 'top level must be an array'); continue; }

  entries.forEach((entry, i) => {
    const where = `${file}[${i}] ${entry?.word ?? '<no word>'}`;

    for (const key of REQUIRED) {
      if (typeof entry[key] === 'undefined' || entry[key] === '') err(where, `missing required field "${key}"`);
    }
    for (const key of Object.keys(entry)) {
      if (!REQUIRED.includes(key) && !OPTIONAL.includes(key)) err(where, `unknown field "${key}"`);
    }
    if (errors.length && !entry.word) return;

    if (!/^[a-zA-Z]+$/.test(entry.word ?? '')) err(where, 'word must be a single run of letters (no spaces or hyphens)');
    if (entry.tier !== expectedTier) err(where, `tier is ${entry.tier} but lives in ${file}`);
    if (!PARTS.has(entry.partOfSpeech)) err(where, `partOfSpeech "${entry.partOfSpeech}" is not one of ${[...PARTS].join(', ')}`);
    if (!KNOWN_ORIGINS.has(entry.origin)) warn(where, `origin "${entry.origin}" is not in the known list - typo?`);

    // Respelling must mark exactly where the stress falls, or the pronouncer
    // is guessing on words like "eleemosynary".
    if (entry.respelling && !/[A-Z]{2,}/.test(entry.respelling)) {
      err(where, `respelling "${entry.respelling}" has no CAPS stressed syllable`);
    }
    if (entry.respelling && /[^A-Za-z-]/.test(entry.respelling)) {
      warn(where, `respelling "${entry.respelling}" contains characters other than letters and hyphens`);
    }

    if (entry.definition && definitionGivesItAway(entry)) {
      err(where, 'definition contains the word itself - that gives away the spelling');
    }
    if (entry.definition && !/^[A-Z]/.test(entry.definition)) warn(where, 'definition should start with a capital letter');
    if (entry.definition && !entry.definition.endsWith('.')) warn(where, 'definition should end with a period');

    if (entry.sentence && !sentenceUsesWord(entry)) err(where, 'sentence does not contain the word');
    if (entry.sentence && entry.sentence.split(/\s+/).length > 18) {
      warn(where, 'sentence is long; keep it short enough to read aloud twice');
    }

    for (const form of [entry.word, ...(entry.alsoAccepted ?? [])]) {
      const key = form?.toLowerCase();
      if (!key) continue;
      if (seen.has(key)) err(where, `"${form}" already appears in ${seen.get(key)}`);
      else seen.set(key, file);
    }

    tierCounts.set(entry.tier, (tierCounts.get(entry.tier) ?? 0) + 1);
  });
}

console.log('Word bank coverage\n');
let totalWords = 0;
for (let tier = 1; tier <= 8; tier++) {
  const count = tierCounts.get(tier) ?? 0;
  totalWords += count;
  const games = Math.floor(count / WORDS_PER_TIER_PER_GAME);
  const bar = '#'.repeat(Math.round((count / TARGET_PER_TIER) * 40)).padEnd(40, '.');
  const flag = count >= TARGET_PER_TIER ? 'ok  ' : 'need';
  console.log(
    `  tier ${tier}  ${String(count).padStart(4)} / ${TARGET_PER_TIER}  [${bar}]  ${flag}  ${games} game(s)`
  );
}
const fullGames = Math.min(...[...Array(8)].map((_, i) => Math.floor((tierCounts.get(i + 1) ?? 0) / WORDS_PER_TIER_PER_GAME)));
console.log(`\n  ${totalWords} words total. Supports ${fullGames} repeat-free game(s) at 10 players; target is ${TARGET_GAMES_WITHOUT_REPEAT}.\n`);

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log('');
}
if (errors.length) {
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) console.log(`  x ${e}`);
  console.log('');
  process.exit(1);
}
console.log('No errors.');
