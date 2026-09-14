#!/usr/bin/env node
// Every word must be able to offer two plausible wrong spellings.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
new Function(readFileSync(join(ROOT, 'app', 'misspell.js'), 'utf8'))();
const { alternatives, buildChoices } = globalThis.Misspell;

const all = [];
for (let t = 1; t <= 8; t++) all.push(...JSON.parse(readFileSync(join(ROOT, 'data', 'words', `tier-${t}.json`), 'utf8')));
const forbidden = new Set();
all.forEach(e => { forbidden.add(e.word.toLowerCase()); (e.alsoAccepted || []).forEach(v => forbidden.add(v.toLowerCase())); });
readFileSync(join(ROOT, 'data', 'british-spellings.txt'), 'utf8')
  .split('\n').filter(l => !l.startsWith('#')).flatMap(l => l.trim().split(/\s+/)).filter(Boolean)
  .forEach(w => { /* British forms stay available as decoys - they are wrong here */ });

let fails = 0, short = 0;
const minLen = Math.min(...all.map(e => e.word.length));
for (const entry of all) {
  const alts = alternatives(entry.word, forbidden, 2);
  if (alts.length < 2) { fails++; if (fails <= 5) console.log('  FAIL only ' + alts.length + ' for', entry.word, alts); continue; }
  if (new Set(alts.map(a => a.toLowerCase())).size !== 2) { fails++; console.log('  FAIL duplicate decoys for', entry.word, alts); }
  if (alts.some(a => forbidden.has(a.toLowerCase()))) { fails++; console.log('  FAIL decoy is a real bank word for', entry.word, alts); }
  if (alts.some(a => a.toLowerCase() === entry.word.toLowerCase())) { fails++; console.log('  FAIL decoy equals the answer for', entry.word); }
}
console.log(`shortest word in the bank: ${minLen} letters`);
console.log(`words unable to produce two decoys: ${fails}`);

// Capitalisation must survive.
const feb = alternatives('February', forbidden, 2);
console.log('capitalisation preserved:', feb.every(a => a[0] === 'F'), feb);

// The answer must actually be in the option list.
let bad = 0;
for (const entry of all.slice(0, 400)) {
  const { options, answer } = buildChoices(entry.word, forbidden);
  if (options.length !== 3 || options[answer] !== entry.word) bad++;
}
console.log('buildChoices consistent over 400 words:', bad === 0);

console.log('\nSamples:');
['rhythm','embarrass','separate','liaison','judgment','eudaemonic','psephology','fuchsia','syzygy','occurrence','grammar','minuscule'].forEach(w => {
  const e = all.find(x => x.word === w);
  if (e) console.log('  ' + w.padEnd(16), alternatives(w, forbidden, 2).join('   '));
});
process.exit(fails === 0 && bad === 0 ? 0 : 1);
