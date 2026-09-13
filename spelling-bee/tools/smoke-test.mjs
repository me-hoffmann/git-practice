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
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('requestfailed', r => errors.push('404?: ' + r.url()));
page.on('response', r => { if (r.status() === 404) errors.push('404: ' + r.url()); });

await page.goto('http://localhost:8099/');
await page.waitForTimeout(300);
console.log('bank note:', await page.textContent('#bank-note'));
await page.screenshot({ path: '/tmp/shots/1-setup.png', fullPage: true });

// validation should reject a single player
await page.fill('#name-0', 'Mike');
await page.click('#btn-start');
console.log('one-player error:', await page.textContent('#setup-error'));

const NAMES = ['Mike','Dana','Ruth','Sam','Ellie','Jo'];
for (let i = 0; i < NAMES.length; i++) await page.fill('#name-' + i, NAMES[i]);

// scoreboard opens as a real second window
const [board] = await Promise.all([ ctx.waitForEvent('page'), page.click('#btn-scoreboard') ]);
await board.setViewportSize({ width: 1280, height: 800 });
board.on('pageerror', e => errors.push('BOARD PAGEERROR: ' + e.message));

await page.click('#btn-start');
await page.waitForTimeout(300);
console.log('round:', await page.textContent('#round-no'), '|', await page.textContent('#round-pts'));
console.log('speller:', await page.textContent('#speller-name'), '| word:', await page.textContent('#the-word'));
await page.screenshot({ path: '/tmp/shots/2-game.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/3-board-live.png' });

// the scoreboard must not contain the word currently being spelled
const word = (await page.textContent('#the-word')).trim();
const boardText = await board.textContent('body');
console.log('SECURITY - upcoming word leaked to scoreboard:', boardText.includes(word));

// judge a miss and confirm the reveal reaches the scoreboard
await page.keyboard.press('x');
await page.waitForTimeout(200);
console.log('verdict:', await page.textContent('#verdict-mark'));
const revealed = await board.textContent('#reveal-word');
console.log('scoreboard reveals missed word:', revealed.trim() === word);
await page.screenshot({ path: '/tmp/shots/4-verdict.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/5-board-reveal.png' });

// undo
await page.keyboard.press('u');
await page.waitForTimeout(150);
console.log('after undo, judge buttons back:', !(await page.isHidden('#judge-row')));

// swap word keeps the tier
await page.keyboard.press('s');
await page.waitForTimeout(150);
const swapped = (await page.textContent('#the-word')).trim();
console.log('swap changed the word:', swapped !== word);

// play the game out via keyboard only
let guard = 0;
while (await page.isHidden('#view-done') && guard++ < 200) {
  await page.keyboard.press(Math.random() < 0.62 ? 'c' : 'x');
  await page.keyboard.press(' ');
}
await page.waitForTimeout(300);
console.log('finished in', guard, 'turns |', await page.textContent('#winner-line'));
await page.screenshot({ path: '/tmp/shots/6-results.png', fullPage: true });
await board.screenshot({ path: '/tmp/shots/7-board-final.png' });

// history recorded, current game cleared
const stored = await page.evaluate(() => ({
  history: JSON.parse(localStorage.getItem('spellingbee.history')),
  current: localStorage.getItem('spellingbee.currentGame')
}));
console.log('games recorded:', stored.history.games.length,
  '| used words:', Object.keys(stored.history.usedWords).length,
  '| in-progress cleared:', stored.current === null);

// refresh mid-game must offer a resume
await page.click('#btn-again');
await page.waitForTimeout(200);
for (let i = 0; i < 5; i++) { await page.keyboard.press('c'); await page.keyboard.press(' '); }
await page.reload();
await page.waitForTimeout(300);
console.log('resume offered after refresh:', !(await page.isHidden('#resume-panel')));
console.log('resume detail:', (await page.textContent('#resume-detail')).trim());
await page.click('#btn-resume');
await page.waitForTimeout(200);
console.log('resumed into round:', await page.textContent('#round-no'), '| progress kept:',
  (await page.textContent('#speller-count')));
await page.screenshot({ path: '/tmp/shots/8-resumed.png', fullPage: true });

// The pronouncer warning path: variant spellings and homophone traps have to
// surface before the speller starts. Forced rather than left to chance.
const fresh = await ctx.newPage();
fresh.on('pageerror', e => errors.push('ALERT PAGE ERROR: ' + e.message));
await fresh.goto('http://localhost:8099/');
await fresh.evaluate(() => localStorage.clear());
await fresh.reload();
await fresh.fill('#name-0', 'Mike');
await fresh.fill('#name-1', 'Dana');
await fresh.click('#btn-start');
await fresh.waitForTimeout(200);
await fresh.evaluate(() => {
  const g = JSON.parse(localStorage.getItem('spellingbee.currentGame'));
  g.rounds[0].entries[0].word = window.WORD_BANK[8].find(w => w.word === 'eudaemonic');
  localStorage.setItem('spellingbee.currentGame', JSON.stringify(g));
});
await fresh.reload();
await fresh.click('#btn-resume');
await fresh.waitForTimeout(200);
console.log('\nvariant warning shown:', !(await fresh.isHidden('#alert-box')));
console.log('warning text:', (await fresh.textContent('#alert-box')).replace(/\s+/g, ' ').trim());
await fresh.screenshot({ path: '/tmp/shots/9-alert.png', fullPage: true });

console.log(errors.length ? '\nERRORS:\n' + errors.join('\n') : '\nNo console or page errors.');
await browser.close();
server.close();
