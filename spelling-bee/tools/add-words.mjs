#!/usr/bin/env node
// Merges a JSON array of entries into the right tier files.
// Run: node tools/add-words.mjs batch.json
// Skips words already in the bank and keeps each tier alphabetical.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORDS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'words');
const incoming = JSON.parse(readFileSync(process.argv[2], 'utf8'));

const banks = new Map();
for (let t = 1; t <= 8; t++) {
  banks.set(t, JSON.parse(readFileSync(join(WORDS_DIR, `tier-${t}.json`), 'utf8')));
}
const known = new Set(
  [...banks.values()].flat().flatMap((e) => [e.word, ...(e.alsoAccepted ?? [])]).map((w) => w.toLowerCase())
);

let added = 0;
const skipped = [];
for (const entry of incoming) {
  const key = entry.word.toLowerCase();
  if (known.has(key)) { skipped.push(entry.word); continue; }
  known.add(key);
  for (const v of entry.alsoAccepted ?? []) known.add(v.toLowerCase());
  banks.get(entry.tier).push(entry);
  added++;
}

for (const [tier, entries] of banks) {
  entries.sort((a, b) => a.word.localeCompare(b.word));
  const body = entries.map((e) => '  ' + JSON.stringify(e)).join(',\n');
  writeFileSync(join(WORDS_DIR, `tier-${tier}.json`), `[\n${body}\n]\n`);
}

console.log(`added ${added}${skipped.length ? `, skipped ${skipped.length} duplicate(s): ${skipped.join(', ')}` : ''}`);
