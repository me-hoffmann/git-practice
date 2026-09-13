#!/usr/bin/env node
// Prints the word bank for human calibration review.
// Run: node tools/review-sheet.mjs          (words only, for a fast difficulty scan)
//      node tools/review-sheet.mjs --full   (every field, as the pronouncer will see it)
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORDS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'words');
const full = process.argv.includes('--full');
const POINTS = { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4 };

for (let tier = 1; tier <= 8; tier++) {
  const entries = JSON.parse(readFileSync(join(WORDS_DIR, `tier-${tier}.json`), 'utf8'));
  console.log(`\n=== ROUND ${tier}  (${POINTS[tier]} point${POINTS[tier] > 1 ? 's' : ''})  -  ${entries.length} words ===\n`);
  for (const e of entries) {
    if (!full) {
      console.log(`  ${e.word.padEnd(32)} ${e.respelling}`);
      continue;
    }
    console.log(`  ${e.word}`);
    console.log(`    say:    ${e.respelling}   (${e.partOfSpeech}, ${e.origin})`);
    console.log(`    means:  ${e.definition}`);
    console.log(`    usage:  ${e.sentence}`);
    if (e.alsoAccepted?.length) console.log(`    ALSO OK: ${e.alsoAccepted.join(', ')}`);
    if (e.notes) console.log(`    note:   ${e.notes}`);
    console.log('');
  }
}
