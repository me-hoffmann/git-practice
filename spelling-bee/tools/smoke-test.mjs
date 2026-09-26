import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const DIR = '/home/user/git-practice/spelling-bee/app';
const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript' };
const server = http.createServer((req, res) => {
  const file = path.join(DIR, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(file)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain' });
  res.end(fs.readFileSync(file));
});
await new Promise(r => server.listen(8099, r));

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('response', r => { if (r.status() === 404) errors.push('404: ' + r.url()); });

const stage = () => page.evaluate(() => {
  const vis = id => !document.getElementById(id).classList.contains('hidden');
  return vis('stage-wager') ? 'wager' : vis('stage-choose') ? 'choose'
    : vis('stage-second') ? 'second'
    : vis('judge-row') ? 'spell' : vis('verdict') ? 'judged' : 'other';
});

await page.goto('http://localhost:8099/');
await page.waitForTimeout(300);
console.log('bank:', await page.textContent('#bank-note'));
console.log('ceiling shown at setup:', await page.textContent('#perfect-note'));
await page.screenshot({ path: '/tmp/shots/1-setup.png', fullPage: true });

const NAMES = ['Mike', 'Dana', 'Ruth', 'Sam', 'Ellie', 'Jo'];
for (let i = 0; i < NAMES.length; i++) await page.fill('#name-' + i, NAMES[i]);
// Two extra lifelines for the least confident speller.
await page.fill('#lives-1', '5');

const [board] = await Promise.all([ ctx.waitForEvent('page'), page.click('#btn-scoreboard') ]);
await board.setViewportSize({ width: 1280, height: 820 });
board.on('pageerror', e => errors.push('BOARD PAGEERROR: ' + e.message));

await page.click('#btn-start');
await page.waitForTimeout(300);
console.log('\n--- difficulty choice ---');
console.log('turn opens on:', await stage());
console.log('choices offered in round 1:', await page.$$eval('.choice-card .nm', n => n.map(x => x.textContent)));
console.log('scoreboard shows the menu:', (await board.textContent('#now-label')).trim());
console.log('no word on either screen yet:', await page.isHidden('#word-block'));
await page.screenshot({ path: '/tmp/shots/2-choose.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/3-board-choose.png' });

await page.keyboard.press('2');   // risky in round 1
await page.waitForTimeout(250);
const word = (await page.textContent('#the-word')).trim();
console.log('after choosing:', await stage(), '| word:', word, '| chip:', (await page.textContent('#chip-row')).trim());
console.log('SECURITY - word leaked to scoreboard:', (await board.textContent('body')).includes(word));

console.log('\n--- lifelines ---');
console.log('lifeline row:', (await page.textContent('#lifeline-row')).replace(/\s+/g, ' ').trim());
await page.keyboard.press('l');
await page.waitForTimeout(250);
console.log('first letter revealed:', (await page.textContent('#letter-box')).trim());
console.log('scoreboard badge:', (await board.textContent('#badge-row')).replace(/\s+/g, ' ').trim());
console.log('same lifeline refused twice:', await page.$eval('#lifeline-row button', b => b.disabled));
await page.screenshot({ path: '/tmp/shots/4-spell.png', fullPage: true });

console.log('\n--- second chance ---');
await page.keyboard.press('x');
await page.waitForTimeout(300);
console.log('a miss opens:', await stage());
const opts = await page.$$eval('#option-grid .btn-option span:last-child', n => n.map(x => x.textContent));
console.log('three spellings offered:', opts);
console.log('the real word is among them:', opts.includes(word));
const boardOpts = await board.$$eval('#pick-options li span:last-child', n => n.map(x => x.textContent));
console.log('speller can read them off the scoreboard:', JSON.stringify(boardOpts) === JSON.stringify(opts));
await page.screenshot({ path: '/tmp/shots/5-second.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/6-board-second.png' });

const right = opts.indexOf(word) + 1;
await page.keyboard.press(String(right));
await page.waitForTimeout(250);
console.log('picking correctly gives:', (await page.textContent('#verdict-mark')).trim(),
  '|', (await page.textContent('#verdict-note')).trim());
const score = await page.$eval('#score-list li.up .sc', e => e.textContent);
console.log('half of a 3-point gamble scored:', score);
console.log('scoreboard verdict for a recovered word:', (await board.textContent('#reveal-verdict')).trim());
console.log('  it is not shown as a miss:', (await board.textContent('#reveal-verdict')).trim() === 'SAVED IT');
console.log('  and it reads as a win, not a loss:',
  await board.$eval('#reveal', e => e.className.includes('correct')));
await board.screenshot({ path: '/tmp/shots/7-board-saved.png' });

console.log('\n--- undo ---');
await page.keyboard.press('u');
await page.waitForTimeout(200);
console.log('undo returns to:', await stage(), '| word kept:', (await page.textContent('#the-word')).trim() === word);

console.log('\n--- play through to the final round ---');
let guard = 0;
while (await stage() !== 'wager' && await page.isHidden('#view-done') && guard++ < 900) {
  const s = await stage();
  if (s === 'choose') await page.keyboard.press(['1','2','3'][Math.floor(Math.random()*3)]);
  else if (s === 'spell') await page.keyboard.press(Math.random() < 0.7 ? 'c' : 'x');
  else if (s === 'second') await page.keyboard.press(String(1 + Math.floor(Math.random()*3)));
  else if (s === 'judged') await page.keyboard.press(' ');
  else break;
}
await page.waitForTimeout(300);
console.log('the wager step appears:', await stage() === 'wager');
console.log('round shown:', await page.textContent('#round-no'));
const caps = await page.$$eval('#wager-rows .wager-row', rows => rows.map(r => ({
  who: r.querySelector('.who').textContent,
  banked: r.querySelector('.banked').textContent,
  cap: r.querySelector('.cap').textContent
})));
console.log('wager limits offered:', caps.map(c => `${c.who} ${c.banked} (${c.cap})`).join(', '));
console.log('scoreboard is taking wagers:', (await board.textContent('#now-label')).trim());
console.log('SECURITY - no amounts on the scoreboard yet:',
  !(await board.textContent('#wager-rows')).match(/locked in/));
await page.screenshot({ path: '/tmp/shots/10-wager.png', fullPage: true });

// Stake everything for the leader, nothing for the last-placed player.
const inputs = await page.$$('#wager-rows input:not([disabled])');
if (inputs.length) { await inputs[0].fill(''); await page.click('#wager-rows .wager-row .btn-max'); }
await page.waitForTimeout(200);
console.log('one player locked in, rest waiting:',
  (await board.textContent('#wager-rows')).includes('locked in'));
await board.screenshot({ path: '/tmp/shots/11-board-wagering.png' });

const remaining = await page.$$('#wager-rows input:not([disabled])');
for (let i = 1; i < remaining.length; i++) await remaining[i].fill(String(i));
await page.click('#btn-lock-wagers');
await page.waitForTimeout(300);
console.log('after locking, stage is:', await stage());
console.log('no difficulty choice on the final word:', await stage() !== 'choose');
const revealed = await board.$$eval('#wager-rows li', ls => ls.map(l => l.textContent.replace(/\s+/g,' ').trim()));
console.log('scoreboard now reveals every stake:', revealed.join(' | '));
console.log('the speller\'s stake is badged:', (await board.textContent('#badge-row')).includes('at stake'));
await page.screenshot({ path: '/tmp/shots/12-final-word.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/13-board-final-word.png' });

const stakeBefore = await page.$eval('#score-list li.up .sc', e => Number(e.textContent));
const chipText = (await page.textContent('#chip-row')).trim();
await page.keyboard.press('x');
await page.waitForTimeout(250);
console.log('a miss on the wagered word goes straight to:', await stage(), '(no second chance)');
console.log('verdict:', (await page.textContent('#verdict-note')).trim());
const stakeAfter = await page.$eval('#score-list li.up .sc', e => Number(e.textContent));
console.log(`score moved ${stakeBefore} -> ${stakeAfter} with ${chipText}`);
console.log('score never went below zero:', stakeAfter >= 0);

while (await page.isHidden('#view-done') && guard++ < 900) {
  const s = await stage();
  if (s === 'spell') await page.keyboard.press(Math.random() < 0.6 ? 'c' : 'x');
  else if (s === 'judged') await page.keyboard.press(' ');
  else if (s === 'choose') await page.keyboard.press('1');
  else if (s === 'second') await page.keyboard.press('1');
  else break;
}
await page.waitForTimeout(300);
console.log('finished:', (await page.textContent('#winner-line')).trim(), '|', (await page.textContent('#winner-sub')).trim());
await page.screenshot({ path: '/tmp/shots/8-results.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/9-board-final.png' });

const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('spellingbee.history')));
console.log('history: games', stored.games.length, '| words burned', Object.keys(stored.usedWords).length);

console.log('\n--- classic mode still works ---');
await page.click('#btn-newplayers');
await page.waitForTimeout(200);
await page.uncheck('#opt-choice');
await page.uncheck('#opt-second');
await page.fill('#opt-lifelines', '0');
await page.fill('#lives-1', '');
await page.click('#btn-start');
await page.waitForTimeout(300);
console.log('classic turn opens straight on:', await stage());
console.log('no lifeline row:', await page.isHidden('#lifeline-row'));
await page.keyboard.press('x');
await page.waitForTimeout(200);
console.log('a miss goes straight to:', await stage());

console.log('\n--- refresh mid-game ---');
await page.keyboard.press(' ');
await page.reload();
await page.waitForTimeout(300);
console.log('resume offered:', !(await page.isHidden('#resume-panel')));
await page.click('#btn-resume');
await page.waitForTimeout(250);
console.log('resumed at:', await page.textContent('#round-no'), (await page.textContent('#speller-count')).trim());

console.log(errors.length ? '\nERRORS:\n' + errors.join('\n') : '\nNo console or page errors.');
await browser.close();
server.close();
