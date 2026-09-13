#!/usr/bin/env node
// Headless checks for app/game.js. Run: node tools/test-game.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
new Function(readFileSync(join(ROOT, 'app', 'game.js'), 'utf8'))();
const Game = globalThis.Game;

const bank = {};
for (let t = 1; t <= 8; t++) bank[t] = JSON.parse(readFileSync(join(ROOT, 'data', 'words', `tier-${t}.json`), 'utf8'));

let failures = 0;
function check(label, condition, detail) {
  if (condition) { console.log(`  ok   ${label}`); return; }
  failures++;
  console.log(`  FAIL ${label}${detail ? ' - ' + detail : ''}`);
}

const NAMES = ['Mike', 'Dana', 'Ruth', 'Sam', 'Ellie', 'Jo'];
const emptyHistory = { gameCounter: 0, usedWords: {}, games: [] };

console.log('\nscoring');
check('rounds 1-2 are worth 1 point', Game.pointsForRound(1) === 1 && Game.pointsForRound(2) === 1);
check('rounds 3-4 are worth 2', Game.pointsForRound(3) === 2 && Game.pointsForRound(4) === 2);
check('rounds 5-6 are worth 3', Game.pointsForRound(5) === 3 && Game.pointsForRound(6) === 3);
check('rounds 7-8 are worth 4', Game.pointsForRound(7) === 4 && Game.pointsForRound(8) === 4);
check('a perfect game is 20 points', Game.perfectScore() === 20, `got ${Game.perfectScore()}`);

console.log('\nsetup validation');
check('one player is rejected', !Game.validateNames(['Mike']).ok);
check('duplicate names are rejected', !Game.validateNames(['Mike', 'mike']).ok);
check('eleven players are rejected', !Game.validateNames('abcdefghijk'.split('')).ok);
check('blank rows are ignored', Game.validateNames(['Mike', '', '  ', 'Dana']).ok);

console.log('\ngame construction');
const built = Game.createGame(NAMES, bank, emptyHistory);
check('game is created', built.ok, built.error);
const game = built.game;
check('eight rounds', game.rounds.length === 8);
check('every round seats every player', game.rounds.every(r => r.entries.length === NAMES.length));
const allWords = game.rounds.flatMap(r => r.entries.map(e => e.word.word));
check('no word repeats inside one game', new Set(allWords).size === allWords.length);
check('each round draws from its own tier', game.rounds.every(r => r.entries.every(e => e.word.tier === r.round)));
check('every word carries all five pronouncer fields', game.rounds.every(r => r.entries.every(e =>
  e.word.respelling && e.word.origin && e.word.definition && e.word.sentence && e.word.partOfSpeech)));
const orders = game.rounds.map(r => r.entries.map(e => e.playerId).join(','));
check('speller order is reshuffled between rounds', new Set(orders).size > 1, 'all rounds shared one order');

console.log('\nplaythrough');
let guard = 0;
while (game.phase === 'playing' && guard++ < 500) {
  Game.judge(game, Math.random() < 0.6);
  Game.advance(game);
}
check('the game ends', game.phase === 'done');
check('every word was judged', Game.progress(game).done === 8 * NAMES.length);
const table = Game.standings(game);
const recomputed = table.reduce((sum, row) => sum + row.score, 0);
let expected = 0;
game.rounds.forEach(r => r.entries.forEach(e => { if (e.result === 'correct') expected += r.points; }));
check('standings total matches the rounds played', recomputed === expected, `${recomputed} vs ${expected}`);
check('nobody can exceed a perfect 20', table.every(r => r.score <= 20));
check('standings are sorted high to low', table.every((r, i) => i === 0 || table[i - 1].score >= r.score));
check('at least one player holds rank 1', Game.winners(game).length >= 1);

console.log('\nties');
const tied = Game.createGame(['A', 'B', 'C'], bank, emptyHistory).game;
tied.rounds.forEach(r => r.entries.forEach(e => { e.result = 'correct'; }));
check('an all-correct game ties everyone at rank 1', Game.winners(tied).length === 3);
check('a tied perfect game scores 20 each', Game.standings(tied).every(r => r.score === 20));

console.log('\nundo');
const u = Game.createGame(['A', 'B'], bank, emptyHistory).game;
Game.judge(u, true);
Game.advance(u);
Game.judge(u, true);
Game.advance(u);
check('two rulings recorded', Game.progress(u).done === 2);
check('undo mid-round steps back', Game.undo(u) && Game.progress(u).done === 1);
check('cursor moved back across the round boundary', u.cursor.round === 0 && u.cursor.index === 1);
Game.judge(u, false);
check('undo clears a ruling before advancing', Game.undo(u) && Game.currentEntry(u).result === null);
const fin = Game.createGame(['A', 'B'], bank, emptyHistory).game;
guard = 0;
while (fin.phase === 'playing' && guard++ < 500) { Game.judge(fin, true); Game.advance(fin); }
check('undo reopens a finished game', Game.undo(fin) && fin.phase === 'playing');

console.log('\nword swap');
const s = Game.createGame(['A', 'B'], bank, emptyHistory).game;
const before = Game.currentEntry(s).word.word;
check('swap replaces the word', Game.swapWord(s) && Game.currentEntry(s).word.word !== before);
check('swap keeps the round tier', Game.currentEntry(s).word.tier === 1);
Game.judge(s, true);
check('swap is refused after a ruling', !Game.swapWord(s));

console.log('\nno-repeat rule across 20 games');
const history = { gameCounter: 0, usedWords: {}, games: [] };
const seen = [];
for (let n = 0; n < 20; n++) {
  const g = Game.createGame('abcdefghij'.split(''), bank, history).game;
  const words = g.rounds.flatMap(r => r.entries.map(e => e.word.word));
  seen.push(words);
  history.gameCounter += 1;
  words.forEach(w => { history.usedWords[w] = history.gameCounter; });
}
const flat = seen.flat();
check('20 straight games at 10 players never repeat a word', new Set(flat).size === flat.length,
  `${flat.length - new Set(flat).size} repeats`);
check('that consumed the whole bank', flat.length === 1600, `${flat.length} words`);
const g21 = Game.createGame('abcdefghij'.split(''), bank, history).game;
check('game 21 still starts once the bank is exhausted', g21.rounds.length === 8);

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
