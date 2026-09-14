/* Pronouncer UI. */
(function () {
  'use strict';

  var el = function (id) { return document.getElementById(id); };
  var game = null;
  var board = null;         // the scoreboard window, when open
  var lastRoster = [];
  var revealedLetters = null;

  // Every real spelling, so a decoy is never accidentally correct.
  var REAL_WORDS = new Set();
  Object.keys(window.WORD_BANK).forEach(function (tier) {
    window.WORD_BANK[tier].forEach(function (entry) {
      REAL_WORDS.add(entry.word.toLowerCase());
      (entry.alsoAccepted || []).forEach(function (v) { REAL_WORDS.add(v.toLowerCase()); });
    });
  });
  function buildChoices(word) { return Misspell.buildChoices(word, REAL_WORDS); }

  var LIFELINE_LABELS = {
    letter: { name: 'First letter', key: 'L' },
    table: { name: 'Ask the table', key: 'T' },
    pass: { name: 'Pass this word', key: 'P' }
  };
  var CHOICE_LABELS = {
    safe: { name: 'Safe', sub: 'an easier word' },
    standard: { name: 'Standard', sub: 'this round’s level' },
    risky: { name: 'Risky', sub: 'a harder word' }
  };

  /* ---------------- setup ---------------- */

  function buildNameInputs() {
    var grid = el('name-grid');
    grid.innerHTML = '';
    for (var i = 0; i < Game.MAX_PLAYERS; i++) {
      var row = document.createElement('div');
      row.className = 'name-row';

      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = (i + 1);

      var input = document.createElement('input');
      input.type = 'text';
      input.id = 'name-' + i;
      input.placeholder = i < 2 ? 'Player ' + (i + 1) : 'optional';
      input.autocomplete = 'off';
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') startGame();
      });

      // A player's own allowance, so the nervous can carry more help than the sharks.
      var lives = document.createElement('input');
      lives.type = 'number';
      lives.className = 'lifelines';
      lives.id = 'lives-' + i;
      lives.min = '0';
      lives.max = '9';
      lives.title = 'Lifelines for this player';
      lives.placeholder = '—';

      row.appendChild(num);
      row.appendChild(input);
      row.appendChild(lives);
      grid.appendChild(row);
    }
    syncLifelineFields();
  }

  function readSettings() {
    return {
      chooseDifficulty: el('opt-choice').checked,
      secondChance: el('opt-second').checked,
      lifelines: Math.max(0, parseInt(el('opt-lifelines').value, 10) || 0)
    };
  }

  function syncLifelineFields() {
    var on = readSettings().lifelines > 0;
    for (var i = 0; i < Game.MAX_PLAYERS; i++) {
      var field = el('lives-' + i);
      field.classList.toggle('hidden', !on);
      field.placeholder = String(readSettings().lifelines);
    }
    el('perfect-note').textContent =
      Game.maxPossible({ chooseDifficulty: false }) + ' points, or ' +
      Game.maxPossible(readSettings()) + ' if you gamble on every word. Ties stand';
  }

  function readRoster() {
    var roster = [];
    for (var i = 0; i < Game.MAX_PLAYERS; i++) {
      var raw = el('lives-' + i).value;
      roster.push({
        name: el('name-' + i).value,
        lifelines: raw === '' ? null : Math.max(0, parseInt(raw, 10) || 0)
      });
    }
    return roster;
  }

  function fillRoster(roster) {
    for (var i = 0; i < Game.MAX_PLAYERS; i++) {
      var entry = roster[i] || {};
      el('name-' + i).value = entry.name || '';
      el('lives-' + i).value = entry.lifelines === undefined || entry.lifelines === null ? '' : entry.lifelines;
    }
  }

  function showBankNote() {
    var history = Storage.loadHistory();
    var report = Storage.freshnessReport(window.WORD_BANK, history);
    var leanest = report.reduce(function (a, b) { return a.fresh < b.fresh ? a : b; });
    var note = window.WORD_BANK_SIZE.toLocaleString() + ' words in the bank. ';
    if (history.gameCounter === 0) {
      note += 'No games played yet.';
    } else {
      note += history.gameCounter + (history.gameCounter === 1 ? ' game' : ' games') + ' played; ' +
        'round ' + leanest.tier + ' is thinnest with ' + leanest.fresh + ' unused words.';
      if (leanest.fresh < 40) {
        note += ' Words will start repeating there soon — that round will reach for a neighbouring one first.';
      }
    }
    el('bank-note').textContent = note;
  }

  function showResumeOption() {
    var saved = Storage.loadGame();
    if (!saved || saved.phase !== 'playing' || saved.version !== Game.VERSION) {
      if (saved && saved.version !== Game.VERSION) Storage.clearGame();
      el('resume-panel').classList.add('hidden');
      return;
    }
    var p = Game.progress(saved);
    el('resume-detail').textContent =
      saved.players.map(function (x) { return x.name; }).join(', ') +
      ' — round ' + (saved.cursor.round + 1) + ' of ' + Game.ROUNDS +
      ', ' + p.done + ' of ' + p.total + ' words judged.';
    el('resume-panel').classList.remove('hidden');
  }

  function startGame() {
    var roster = readRoster();
    var built = Game.createGame(roster, window.WORD_BANK, Storage.loadHistory(), readSettings());
    if (!built.ok) {
      el('setup-error').textContent = built.error;
      return;
    }
    el('setup-error').textContent = '';
    game = built.game;
    lastRoster = game.players.map(function (p) { return { name: p.name, lifelines: p.lifelinesStart }; });
    revealedLetters = null;
    render();
  }

  /* ---------------- rendering ---------------- */

  function view(name) {
    ['setup', 'game', 'done'].forEach(function (v) {
      el('view-' + v).classList.toggle('hidden', v !== name);
    });
    el('btn-quit').classList.toggle('hidden', name !== 'game');
  }

  function show(id, on) {
    el(id).classList.toggle('hidden', !on);
  }

  /* The most recent ruling, so the scoreboard can reveal a missed spelling
     without ever showing the word that is coming next. */
  function lastRuling() {
    if (!game) return null;
    var here = Game.currentEntry(game);
    if (here && Game.entryResolved(here)) return { entry: here, round: Game.currentRound(game) };
    var r = game.cursor.round;
    var i = game.cursor.index - 1;
    if (game.phase === 'done') {
      r = game.rounds.length - 1;
      i = game.rounds[r].entries.length - 1;
    } else if (i < 0) {
      r -= 1;
      if (r < 0) return null;
      i = game.rounds[r].entries.length - 1;
    }
    var entry = game.rounds[r] && game.rounds[r].entries[i];
    return entry && Game.entryResolved(entry) ? { entry: entry, round: game.rounds[r] } : null;
  }

  function render() {
    if (!game) {
      view('setup');
      showResumeOption();
      showBankNote();
      syncLifelineFields();
      pushToBoard();
      return;
    }
    if (game.phase === 'done') {
      renderResults();
      pushToBoard();
      return;
    }

    view('game');
    var stage = Game.turnStage(game);
    var round = Game.currentRound(game);
    var entry = Game.currentEntry(game);

    el('round-no').textContent = 'Round ' + round.round;
    el('round-pts').textContent = round.points + (round.points === 1 ? ' point' : ' points') + ' a word';
    el('speller-count').textContent = 'Speller ' + (game.cursor.index + 1) + ' of ' + round.entries.length;
    var p = Game.progress(game);
    el('progress-bar').style.width = Math.round((p.done / p.total) * 100) + '%';
    el('speller-name').textContent = Game.playerName(game, entry.playerId);
    el('speller-label').textContent = stage === 'choose' ? 'Choosing'
      : stage === 'second' ? 'Second chance' : 'Now spelling';

    show('stage-choose', stage === 'choose');
    show('word-block', stage !== 'choose');
    show('lifeline-row', stage === 'spell' && game.settings.lifelines > 0);
    show('judge-row', stage === 'spell');
    show('stage-second', stage === 'second');
    show('verdict', stage === 'judged');

    if (stage === 'choose') renderChoices(round);
    else renderWord(round, entry);
    if (stage === 'spell') renderLifelines(entry);
    if (stage === 'second') renderSecondChance(round, entry);
    if (stage === 'judged') renderVerdict(round, entry);

    el('btn-undo').disabled = !entry.result && game.cursor.round === 0 && game.cursor.index === 0;
    renderKeysHint(stage);
    renderStandings();
    Storage.saveGame(game);
    pushToBoard();
  }

  function renderChoices(round) {
    var grid = el('choice-grid');
    grid.innerHTML = '';
    Game.choicesForRound(round.round).forEach(function (choice, i) {
      var label = CHOICE_LABELS[choice.key];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-card ' + choice.key;
      btn.innerHTML =
        '<span class="nm">' + label.name + '</span>' +
        '<span class="pts">' + choice.points + (choice.points === 1 ? ' pt' : ' pts') + '</span>' +
        '<span class="sub">' + label.sub + '</span>' +
        '<span class="key">PRESS ' + (i + 1) + '</span>';
      btn.addEventListener('click', function () { doChoose(choice.key); });
      grid.appendChild(btn);
    });
  }

  function renderWord(round, entry) {
    var word = entry.word;
    var chips = el('chip-row');
    chips.innerHTML = '';
    var picked = Game.activeChoice(game, entry);
    if (game.settings.chooseDifficulty) {
      var chip = document.createElement('span');
      chip.className = 'chip ' + picked;
      chip.textContent = CHOICE_LABELS[picked].name + ' · ' +
        Game.choiceFor(round.round, picked).points + ' pts';
      chips.appendChild(chip);
    }
    entry.lifelinesUsed.forEach(function (kind) {
      var used = document.createElement('span');
      used.className = 'chip';
      used.textContent = LIFELINE_LABELS[kind].name + ' used';
      chips.appendChild(used);
    });

    el('the-word').textContent = word.word;
    el('respell').textContent = word.respelling;
    el('grammar').textContent = word.partOfSpeech;
    el('d-origin').textContent = word.origin;
    el('d-definition').textContent = word.definition;
    el('d-sentence').textContent = '“' + word.sentence + '”';

    var letterBox = el('letter-box');
    if (revealedLetters && revealedLetters.word === word.word) {
      letterBox.innerHTML = '<b>First letter:</b> ' + word.word[0].toUpperCase();
      letterBox.classList.remove('hidden');
    } else {
      letterBox.classList.add('hidden');
    }

    // Variant spellings and homophone traps have to reach the pronouncer
    // before the speller starts, not after the argument starts.
    var alerts = [];
    if (word.alsoAccepted && word.alsoAccepted.length) {
      alerts.push('<b>Also correct:</b> ' + word.alsoAccepted.join(', '));
    }
    if (word.notes) alerts.push('<b>Note:</b> ' + word.notes);
    var box = el('alert-box');
    if (alerts.length) {
      box.innerHTML = alerts.join('<br>');
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
    }
  }

  function renderLifelines(entry) {
    var row = el('lifeline-row');
    row.innerHTML = '';
    var left = Game.lifelinesLeft(game, entry.playerId);
    var count = document.createElement('span');
    count.className = 'count';
    count.textContent = left + (left === 1 ? ' lifeline left:' : ' lifelines left:');
    row.appendChild(count);
    Game.LIFELINE_KINDS.forEach(function (kind) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-life';
      btn.disabled = !Game.canUseLifeline(game, kind);
      btn.innerHTML = LIFELINE_LABELS[kind].name + '<span class="key">' + LIFELINE_LABELS[kind].key + '</span>';
      btn.addEventListener('click', function () { doLifeline(kind); });
      row.appendChild(btn);
    });
  }

  function renderSecondChance(round, entry) {
    var half = Math.ceil(Game.choiceFor(round.round, Game.activeChoice(game, entry)).points / 2);
    el('second-prompt').textContent =
      'Missed. The scoreboard is showing three spellings — tap whichever one they call out. ' +
      'Getting it is worth ' + half + (half === 1 ? ' point' : ' points') + '.';
    var grid = el('option-grid');
    grid.innerHTML = '';
    entry.secondOptions.options.forEach(function (option, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-option';
      btn.innerHTML = '<span class="tag">' + 'ABC'[i] + '</span><span>' + escapeHtml(option) + '</span>';
      btn.addEventListener('click', function () { doSecondChance(i); });
      grid.appendChild(btn);
    });
  }

  function renderVerdict(round, entry) {
    var points = Game.entryPoints(game, round, entry);
    var who = Game.playerName(game, entry.playerId);
    var recovered = entry.second && entry.second.correct;
    var ok = entry.result === 'correct' || recovered;
    el('verdict').className = 'verdict ' + (ok ? 'correct' : 'miss');
    el('verdict-mark').textContent = entry.result === 'correct' ? 'CORRECT'
      : recovered ? 'SAVED IT' : 'MISSED';
    el('verdict-note').textContent = ok
      ? who + ' takes ' + points + (points === 1 ? ' point' : ' points') + '.'
      : 'No points. The scoreboard is showing the spelling.';
  }

  function renderKeysHint(stage) {
    var hint = '';
    if (stage === 'choose') {
      hint = Game.choicesForRound(Game.currentRound(game).round).map(function (c, i) {
        return '<kbd>' + (i + 1) + '</kbd> ' + CHOICE_LABELS[c.key].name.toLowerCase();
      }).join('<br>');
    } else if (stage === 'spell') {
      hint = '<kbd>C</kbd> correct &nbsp; <kbd>X</kbd> missed';
      if (game.settings.lifelines > 0) {
        hint += '<br><kbd>L</kbd> letter &nbsp; <kbd>T</kbd> table &nbsp; <kbd>P</kbd> pass';
      }
    } else if (stage === 'second') {
      hint = '<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> their answer<br><kbd>0</kbd> skip it';
    } else {
      hint = '<kbd>Space</kbd> next speller';
    }
    el('keys-hint').innerHTML = hint + '<br><kbd>U</kbd> undo';
  }

  function renderStandings() {
    var rows = Game.standings(game);
    var upId = game.phase === 'playing' ? Game.currentEntry(game).playerId : null;
    var list = el('score-list');
    list.innerHTML = '';
    rows.forEach(function (row) {
      var li = document.createElement('li');
      if (row.id === upId) li.className = 'up';
      li.innerHTML =
        '<span class="rk">' + row.rank + '</span>' +
        '<span class="nm">' + escapeHtml(row.name) + '</span>' +
        '<span class="sc">' + row.score + '</span>';
      list.appendChild(li);
    });
  }

  function renderResults() {
    view('done');
    var rows = Game.standings(game);
    var champs = Game.winners(game);
    var names = champs.map(function (c) { return c.name; });
    var ceiling = Game.maxPossible(game.settings);

    if (champs.length === 1) {
      el('winner-line').innerHTML = '<span class="gold">' + escapeHtml(names[0]) + '</span> wins.';
      el('winner-sub').textContent = champs[0].score + ' of a possible ' + ceiling + ' points.';
    } else {
      var joined = names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
      el('winner-line').innerHTML = 'A tie — <span class="gold">' + escapeHtml(joined) + '</span>.';
      el('winner-sub').textContent = champs[0].score + ' points each. Ties stand, so that is the result.';
    }

    var body = el('final-body');
    body.innerHTML = '';
    rows.forEach(function (row) {
      var tr = document.createElement('tr');
      if (row.rank === 1) tr.className = 'first';
      tr.innerHTML =
        '<td class="num">' + row.rank + '</td>' +
        '<td>' + escapeHtml(row.name) + '</td>' +
        '<td class="num">' + row.correct + ' / ' + row.attempted + '</td>' +
        '<td class="num">' + (row.recovered || '–') + '</td>' +
        '<td class="num">' + row.score + '</td>';
      body.appendChild(tr);
    });

    var recap = el('recap');
    recap.innerHTML = '';
    game.rounds.forEach(function (round) {
      var missed = round.entries.filter(function (e) { return Game.entryPoints(game, round, e) === 0; }).length;
      var d = document.createElement('details');
      var sum = document.createElement('summary');
      sum.textContent = 'Round ' + round.round + ' · ' + round.points +
        (round.points === 1 ? ' point' : ' points') + ' · ' + missed +
        (missed === 1 ? ' miss' : ' misses');
      var ul = document.createElement('ul');
      ul.className = 'rlist';
      round.entries.forEach(function (e) {
        var saved = e.second && e.second.correct;
        var cls = e.result === 'correct' ? 'ok' : saved ? 'saved' : 'no';
        var choice = Game.activeChoice(game, e);
        var li = document.createElement('li');
        li.innerHTML = '<span class="who">' + escapeHtml(Game.playerName(game, e.playerId)) + '</span>' +
          '<span class="' + cls + '">' + escapeHtml(e.word.word) + '</span>' +
          '<span class="tagline">' +
          (game.settings.chooseDifficulty && choice !== 'standard' ? CHOICE_LABELS[choice].name.toLowerCase() + ' · ' : '') +
          (saved ? 'saved on the second chance' : '') + '</span>';
        ul.appendChild(li);
      });
      d.appendChild(sum);
      d.appendChild(ul);
      recap.appendChild(d);
    });

    Storage.recordGame(game, rows);
    Storage.clearGame();
    renderStandings();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------------- scoreboard window ---------------- */

  function boardState() {
    if (!game) return { type: 'sbee:state', phase: 'setup' };
    var rows = Game.standings(game).map(function (r) {
      return { name: r.name, score: r.score, rank: r.rank, lifelines: r.lifelines };
    });
    if (game.phase === 'done') {
      return {
        type: 'sbee:state', phase: 'done', standings: rows,
        winners: Game.winners(game).map(function (w) { return w.name; }),
        perfect: Game.maxPossible(game.settings)
      };
    }
    var stage = Game.turnStage(game);
    var round = Game.currentRound(game);
    var entry = Game.currentEntry(game);
    var nxt = Game.nextEntry(game);
    var ruling = lastRuling();
    var state = {
      type: 'sbee:state',
      phase: 'playing',
      stage: stage,
      round: round.round,
      roundsTotal: Game.ROUNDS,
      points: round.points,
      spellerIndex: game.cursor.index + 1,
      spellerCount: round.entries.length,
      current: Game.playerName(game, entry.playerId),
      lifelinesLeft: game.settings.lifelines > 0 ? Game.lifelinesLeft(game, entry.playerId) : null,
      next: nxt ? Game.playerName(game, nxt.playerId) : null,
      standings: rows,
      showLifelines: game.settings.lifelines > 0
    };
    if (stage === 'choose') {
      state.choices = Game.choicesForRound(round.round).map(function (c) {
        return { key: c.key, name: CHOICE_LABELS[c.key].name, sub: CHOICE_LABELS[c.key].sub, points: c.points };
      });
    } else {
      var picked = Game.activeChoice(game, entry);
      state.choiceMade = game.settings.chooseDifficulty
        ? { key: picked, name: CHOICE_LABELS[picked].name, points: Game.choiceFor(round.round, picked).points }
        : null;
      state.lifelinesUsed = entry.lifelinesUsed.map(function (k) { return LIFELINE_LABELS[k].name; });
      state.firstLetter = revealedLetters && revealedLetters.word === entry.word.word
        ? entry.word.word[0].toUpperCase() : null;
    }
    // The three spellings must reach the speller, who is watching this screen.
    if (stage === 'second') state.secondOptions = entry.secondOptions.options;
    // Only ever a word that has already been ruled on - never the next one.
    if (ruling) {
      var saved = ruling.entry.second && ruling.entry.second.correct;
      state.reveal = {
        name: Game.playerName(game, ruling.entry.playerId),
        word: ruling.entry.word.word,
        correct: ruling.entry.result === 'correct',
        saved: !!saved
      };
    }
    return state;
  }

  function pushToBoard() {
    if (board && !board.closed) {
      try { board.postMessage(boardState(), '*'); } catch (err) { /* window went away */ }
    }
  }

  function openScoreboard() {
    if (board && !board.closed) { board.focus(); return; }
    board = window.open('scoreboard.html', 'sbee_scoreboard', 'width=1100,height=780');
    if (!board) {
      window.alert('Your browser blocked the scoreboard window. Allow pop-ups for this page and try again.');
    }
  }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'sbee:ready') pushToBoard();
  });

  /* ---------------- actions ---------------- */

  function doChoose(key) {
    if (Game.turnStage(game) !== 'choose') return;
    if (Game.chooseDifficulty(game, key)) render();
  }

  function doLifeline(kind) {
    var used = Game.useLifeline(game, kind);
    if (!used) return;
    if (kind === 'letter') revealedLetters = { word: used.word.word };
    render();
  }

  function doJudge(correct) {
    if (Game.turnStage(game) !== 'spell') return;
    Game.judge(game, correct, buildChoices);
    render();
  }

  function doSecondChance(index) {
    if (Game.answerSecondChance(game, index)) render();
  }

  function doSkipSecond() {
    if (Game.skipSecondChance(game)) render();
  }

  function doAdvance() {
    if (Game.turnStage(game) !== 'judged') return;
    Game.advance(game);
    revealedLetters = null;
    render();
  }

  function doUndo() {
    if (game && Game.undo(game)) render();
  }

  function quitGame() {
    if (!window.confirm('End this game and throw away the scores?')) return;
    Storage.clearGame();
    game = null;
    render();
  }

  /* ---------------- wiring ---------------- */

  buildNameInputs();

  ['opt-choice', 'opt-second', 'opt-lifelines'].forEach(function (id) {
    el(id).addEventListener('change', syncLifelineFields);
  });
  el('btn-start').addEventListener('click', startGame);
  el('btn-clear-names').addEventListener('click', function () {
    fillRoster([]);
    el('setup-error').textContent = '';
    el('name-0').focus();
  });
  el('btn-resume').addEventListener('click', function () {
    game = Storage.loadGame();
    revealedLetters = null;
    render();
  });
  el('btn-discard').addEventListener('click', function () {
    Storage.clearGame();
    showResumeOption();
  });
  el('btn-correct').addEventListener('click', function () { doJudge(true); });
  el('btn-miss').addEventListener('click', function () { doJudge(false); });
  el('btn-skip-second').addEventListener('click', doSkipSecond);
  el('btn-next').addEventListener('click', doAdvance);
  el('btn-undo').addEventListener('click', doUndo);
  el('btn-quit').addEventListener('click', quitGame);
  el('btn-scoreboard').addEventListener('click', openScoreboard);
  el('btn-again').addEventListener('click', function () {
    var built = Game.createGame(lastRoster, window.WORD_BANK, Storage.loadHistory(), game ? game.settings : readSettings());
    if (!built.ok) { window.alert(built.error); return; }
    game = built.game;
    revealedLetters = null;
    render();
  });
  el('btn-newplayers').addEventListener('click', function () {
    game = null;
    fillRoster(lastRoster);
    render();
  });

  document.addEventListener('keydown', function (e) {
    if (!game || game.phase !== 'playing') return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.toLowerCase();
    var stage = Game.turnStage(game);

    if (k === 'u') { e.preventDefault(); doUndo(); return; }

    if (stage === 'choose') {
      var open = Game.choicesForRound(Game.currentRound(game).round);
      var index = parseInt(k, 10) - 1;
      if (open[index]) { e.preventDefault(); doChoose(open[index].key); }
    } else if (stage === 'spell') {
      if (k === 'c') { e.preventDefault(); doJudge(true); }
      else if (k === 'x') { e.preventDefault(); doJudge(false); }
      else if (k === 'l') { e.preventDefault(); doLifeline('letter'); }
      else if (k === 't') { e.preventDefault(); doLifeline('table'); }
      else if (k === 'p') { e.preventDefault(); doLifeline('pass'); }
    } else if (stage === 'second') {
      if (k === '0') { e.preventDefault(); doSkipSecond(); }
      else if (k >= '1' && k <= '3') { e.preventDefault(); doSecondChance(parseInt(k, 10) - 1); }
    } else if (stage === 'judged') {
      if (k === ' ' || k === 'enter') { e.preventDefault(); doAdvance(); }
    }
  });

  if (!Storage.available()) {
    var warn = document.createElement('div');
    warn.className = 'warn-strip';
    warn.textContent = 'This browser is blocking local storage, so a refresh will lose the game ' +
      'and used words will not be remembered between games. Try a normal (non-private) window.';
    el('view-setup').prepend(warn);
  }

  render();
  el('name-0').focus();
})();
