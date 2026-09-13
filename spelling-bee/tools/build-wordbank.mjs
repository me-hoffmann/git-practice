#!/usr/bin/env node
// Bundles data/words/*.json into app/wordbank.js as a plain global.
// A <script> tag works when the page is opened straight from disk; fetch()
// of a local JSON file does not. Run after any change to the word bank.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const bank = {};
let total = 0;
for (let tier = 1; tier <= 8; tier++) {
  const entries = JSON.parse(readFileSync(join(ROOT, 'data', 'words', `tier-${tier}.json`), 'utf8'));
  bank[tier] = entries;
  total += entries.length;
}

const out = `// GENERATED FILE - do not edit.
// Source: data/words/tier-*.json   Rebuild: node tools/build-wordbank.mjs
window.WORD_BANK = ${JSON.stringify(bank)};
window.WORD_BANK_SIZE = ${total};
`;
writeFileSync(join(ROOT, 'app', 'wordbank.js'), out);
console.log(`app/wordbank.js written - ${total} words`);
