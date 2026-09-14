#!/usr/bin/env node
// Headless checks for app/game.js. Run: node tools/test-game.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
new Function(readFileSync(join(ROOT, 'app', 'game.js'), 'utf8'))();
new Function(readFileSync(join(ROOT, 'app', 'misspell.js'), 'utf8'))();
const { Game, Misspell } = globalThis;

const bank = {};
for (let t = 1; t <= 8; t++) bank[t] = JSON.parse(readFileSync(join(ROOT, 'data', 'words', `tier-${t}.json`), 'utf8'));
const forbidden = new Set();
Object.values(bank).flat().forEach(e => {
  forbidden.add(e.word.toLowerCase());
  (e.alsoAccepted || []).forEach(v => forbidden.add(v.toLowerCase()));
});
const choices = word => Misspell.buildChoices(word, forbidden);

let failures = 0;
function check(label, condition, detail) {
  if (condition) { console.log(`  ok   ${label}`); return; }
  failures++;
  console.log(`  FAIL ${label}${detail ? ' - ' + detail : ''}`);
}

const NAMES = ['Mike', 'Dana', 'Ruth', 'Sam', 'Ellie', 'Jo'];
const blank = () => ({ gameCounter: 0, usedWords: {}, games: [] });
const CLASSIC = { chooseDifficulty: false, lifelines: 0, secondChance: false };
const FULL = { chooseDifficulty: true, lifelines: 3, secondChance: true };
const newGame = (names = NAMES, settings = FULL, history = blank()) =>
  Game.createGame(names, bank, history, settings).game;

console.log('\nscoring ladder');
check('rounds 1-2 are worth 1 point', Game.pointsForRound(1) === 1 && Game.pointsForRound(2) === 1);
check('rounds 7-8 are worth 4', Game.pointsForRound(7) === 4 && Game.pointsForRound(8) === 4);
check('a classic perfect game is still 20', Game.maxPossible(CLASSIC) === 20, String(Game.maxPossible(CLASSIC)));
check('gambling every word raises the ceiling to 34', Game.maxPossible(FULL) === 34, String(Game.maxPossible(FULL)));

console.log('\ndifficulty choice');
check('round 1 offers no safer option', !Game.choiceFor(1, 'safe').available);
check('round 8 offers no riskier option', !Game.choiceFor(8, 'risky').available);
check('round 1 still offers a gamble', Game.choiceFor(1, 'risky').available);
check('round 8 still offers a safe word', Game.choiceFor(8, 'safe').available);
check('safe in round 6 is tier 4 for 2 points',
  Game.choiceFor(6, 'safe').tier === 4 && Game.choiceFor(6, 'safe').points === 2);
check('risky in round 6 is tier 8 for 5 points',
  Game.choiceFor(6, 'risky').tier === 8 && Game.choiceFor(6, 'risky').points === 5);
check('safe never pays less than 1 point',
  [1,2,3,4,5,6,7,8].every(r => Game.choiceFor(r, 'safe').points >= 1));

const c = newGame();
check('a turn starts on the choice step', Game.turnStage(c) === 'choose');
check('cannot judge before choosing', !Game.judge(c, true, choices));
const standardWord = Game.currentEntry(c).word.word;
check('choosing risky swaps in a harder word',
  Game.chooseDifficulty(c, 'risky') && Game.currentEntry(c).word.tier === 3
  && Game.currentEntry(c).word.word !== standardWord);
check('the turn moves on to spelling', Game.turnStage(c) === 'spell');
check('the discarded word returns to its pool',
  c.pool.fresh[1].some(w => w.word === standardWord));
check('an unavailable choice is refused', !Game.chooseDifficulty(newGame(), 'safe'));

console.log('\nlifelines');
const L = newGame();
Game.chooseDifficulty(L, 'standard');
const spellerId = Game.currentEntry(L).playerId;
check('players start with the configured allowance', Game.lifelinesLeft(L, spellerId) === 3);
check('a first letter can be spent', !!Game.useLifeline(L, 'letter'));
check('that cost one lifeline', Game.lifelinesLeft(L, spellerId) === 2);
check('the same help cannot be spent twice on one word', !Game.canUseLifeline(L, 'letter'));
check('a different help still can', Game.canUseLifeline(L, 'table'));
const beforePass = Game.currentEntry(L).word.word;
const passed = Game.useLifeline(L, 'pass');
check('a pass draws a new word', passed && Game.currentEntry(L).word.word !== beforePass);
check('the pass kept the same difficulty', Game.currentEntry(L).word.tier === 1);
check('two helps spent leaves one', Game.lifelinesLeft(L, spellerId) === 1);
Game.useLifeline(L, 'table');
check('the allowance is now empty', Game.lifelinesLeft(L, spellerId) === 0);
check('a fourth help is refused', !Game.canUseLifeline(L, 'letter') && !Game.canUseLifeline(L, 'table'));

const mixed = Game.createGame(
  [{ name: 'Champ', lifelines: 1 }, { name: 'Novice', lifelines: 5 }], bank, blank(), FULL).game;
check('per-player allowances are honored',
  mixed.players[0].lifelines === 1 && mixed.players[1].lifelines === 5);
check('lifelines can be switched off entirely',
  newGame(NAMES, { ...FULL, lifelines: 0 }).players.every(p => p.lifelines === 0));

console.log('\nsecond chance');
const S = newGame();
Game.chooseDifficulty(S, 'standard');
Game.judge(S, false, choices);
check('a miss opens the second chance', Game.turnStage(S) === 'second');
const opts = Game.currentEntry(S).secondOptions;
check('three spellings are offered', opts.options.length === 3);
check('exactly one of them is the real word',
  opts.options.filter(o => o === Game.currentEntry(S).word.word).length === 1);
check('the recorded answer points at the real word',
  opts.options[opts.answer] === Game.currentEntry(S).word.word);
check('the turn is not resolved while it is pending', !Game.entryResolved(Game.currentEntry(S)));
Game.answerSecondChance(S, opts.answer);
check('a recovered word pays half, rounded up',
  Game.entryPoints(S, Game.currentRound(S), Game.currentEntry(S)) === 1);
check('the turn is now judged', Game.turnStage(S) === 'judged');

const S5 = newGame();
Game.chooseDifficulty(S5, 'risky');   // round 1 risky = 3 points
Game.judge(S5, false, choices);
Game.answerSecondChance(S5, Game.currentEntry(S5).secondOptions.answer);
check('half of a 3-point gamble rounds up to 2',
  Game.entryPoints(S5, Game.currentRound(S5), Game.currentEntry(S5)) === 2);

const SW = newGame();
Game.chooseDifficulty(SW, 'standard');
Game.judge(SW, false, choices);
Game.answerSecondChance(SW, (SW.rounds[0].entries[0].secondOptions.answer + 1) % 3);
check('a wrong pick scores nothing',
  Game.entryPoints(SW, Game.currentRound(SW), Game.currentEntry(SW)) === 0);
const SK = newGame();
Game.chooseDifficulty(SK, 'standard');
Game.judge(SK, false, choices);
check('the second chance can be skipped', Game.skipSecondChance(SK) && Game.turnStage(SK) === 'judged');
const NC = newGame(NAMES, { ...FULL, secondChance: false });
Game.chooseDifficulty(NC, 'standard');
Game.judge(NC, false, choices);
check('with the option off a miss goes straight to judged', Game.turnStage(NC) === 'judged');

console.log('\nundo');
const U = newGame();
Game.chooseDifficulty(U, 'standard');
Game.judge(U, false, choices);
Game.answerSecondChance(U, 0);
check('undo clears the whole ruling in one press',
  Game.undo(U) && Game.turnStage(U) === 'spell');
check('undo kept the chosen word', U.rounds[0].entries[0].choice === 'standard');
Game.judge(U, true, choices);
Game.advance(U);
check('undo steps back to the previous speller',
  Game.undo(U) && U.cursor.index === 0 && Game.turnStage(U) === 'spell');

console.log('\nfull playthrough');
function playOut(game, pick = () => 'standard', correctRate = 0.6) {
  let guard = 0;
  while (game.phase === 'playing' && guard++ < 2000) {
    const stage = Game.turnStage(game);
    if (stage === 'choose') {
      const round = Game.currentRound(game).round;
      const wanted = pick(game);
      const open = Game.choicesForRound(round).map(o => o.key);
      Game.chooseDifficulty(game, open.includes(wanted) ? wanted : 'standard');
    }
    else if (stage === 'spell') Game.judge(game, Math.random() < correctRate, choices);
    else if (stage === 'second') Game.answerSecondChance(game, Math.floor(Math.random() * 3));
    else if (stage === 'judged') Game.advance(game);
  }
  return game;
}
const P = playOut(newGame(), () => ['safe', 'standard', 'risky'][Math.floor(Math.random() * 3)]);
check('the game ends', P.phase === 'done');
check('every word was resolved', Game.progress(P).done === 8 * NAMES.length);
const table = Game.standings(P);
let expected = 0;
P.rounds.forEach(r => r.entries.forEach(e => { expected += Game.entryPoints(P, r, e); }));
check('standings match the rounds played',
  table.reduce((s, r) => s + r.score, 0) === expected);
check('nobody exceeds the ceiling', table.every(r => r.score <= Game.maxPossible(FULL)));
check('gambles are counted', table.some(r => r.gambles > 0));

const C2 = playOut(newGame(NAMES, CLASSIC), () => 'standard', 1);
check('a flawless classic game is exactly 20',
  Game.standings(C2).every(r => r.score === 20), JSON.stringify(Game.standings(C2).map(r => r.score)));
const G2 = playOut(newGame(NAMES, FULL), () => 'risky', 1);
check('gambling every word and landing them all is 34',
  Game.standings(G2).every(r => r.score === 34), JSON.stringify(Game.standings(G2).map(r => r.score)));

console.log('\nties');
const T = playOut(newGame(['A', 'B', 'C'], CLASSIC), () => 'standard', 1);
check('an all-correct game ties everyone at rank 1', Game.winners(T).length === 3);

console.log('\nno-repeat rule at 10 players');
/* Runs a season and reports the game number on which a word first repeats.
   Difficulty choice redistributes demand across tiers, so this is no longer a
   single number - it depends on how the table plays. */
function runSeason(pick, settings, games) {
  const history = blank();
  const seen = new Set();
  let firstRepeat = 0;
  let repeats = 0;
  for (let n = 1; n <= games; n++) {
    const g = playOut(Game.createGame('abcdefghij'.split(''), bank, history, settings).game, pick, 0.6);
    const used = g.rounds.flatMap(r => r.entries.map(e => e.word.word));
    for (const w of used) {
      if (seen.has(w)) { repeats++; if (!firstRepeat) firstRepeat = n; }
      seen.add(w);
    }
    history.gameCounter += 1;
    used.forEach(w => { history.usedWords[w] = history.gameCounter; });
  }
  return { firstRepeat: firstRepeat || games + 1, repeats };
}
const rand = ws => () => {
  let r = Math.random();
  for (const [key, w] of Object.entries(ws)) { if ((r -= w) < 0) return key; }
  return 'standard';
};

const classicSeason = runSeason(() => 'standard', CLASSIC, 20);
check('classic play: 20 games with zero repeats',
  classicSeason.repeats === 0, `${classicSeason.repeats} repeats`);

// Five nervous spellers who lean safe, five confident ones who lean risky.
const mikesTable = runSeason(
  () => (Math.random() < 0.5
    ? rand({ safe: 0.60, standard: 0.35, risky: 0.05 })()
    : rand({ safe: 0.05, standard: 0.50, risky: 0.45 })()),
  FULL, 20);
check('a mixed-confidence table: no repeat before game 12',
  mikesTable.firstRepeat >= 12, `first repeat in game ${mikesTable.firstRepeat}`);
console.log(`  note  mixed-confidence table - first repeat in game ${mikesTable.firstRepeat}`);

const evenThirds = runSeason(rand({ safe: 1/3, standard: 1/3, risky: 1/3 }), FULL, 20);
check('an evenly split table: no repeat before game 12',
  evenThirds.firstRepeat >= 12, `first repeat in game ${evenThirds.firstRepeat}`);
console.log(`  note  evenly split table    - first repeat in game ${evenThirds.firstRepeat}`);

/* Skewed tables are reported rather than asserted. When a tier runs dry the
   app falls back to neighbouring tiers and then to the oldest words, so play
   degrades gently instead of failing - and the setup screen warns first. */
for (const [label, pick] of [
  ['everyone always plays safe ', () => 'safe'],
  ['everyone always gambles    ', () => 'risky']
]) {
  const season = runSeason(pick, FULL, 30);
  console.log(`  note  ${label} - first repeat in game ${season.firstRepeat}`);
}

console.log(failures === 0 ? '\nAll checks passed.\n' : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
