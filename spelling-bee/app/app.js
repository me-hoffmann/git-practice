/* Pronouncer UI. */
(function () {
  'use strict';

  var el = function (id) { return document.getElementById(id); };
  var game = null;
  var board = null;         // the scoreboard window, when open
  var lastNames = [];

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
      row.appendChild(num);
      row.appendChild(input);
      grid.appendChild(row);
    }
  }

  function readNames() {
    var names = [];
    for (var i = 0; i < Game.MAX_PLAYERS; i++) names.push(el('name-' + i).value);
    return names;
  }

  function fillNames(names) {
    for (var i = 0; i < Game.MAX_PLAYERS; i++) el('name-' + i).value = names[i] || '';
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
        'the thinnest round still has ' + leanest.fresh + ' unused words ' +
        '(' + Math.floor(leanest.fresh / 10) + ' more games at ten players).';
    }
    el('bank-note').textContent = note;
  }

  function showResumeOption() {
    var saved = Storage.loadGame();
    if (!saved || saved.phase !== 'playing') {
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
    var names = readNames();
    var built = Game.createGame(names, window.WORD_BANK, Storage.loadHistory());
    if (!built.ok) {
      el('setup-error').textContent = built.error;
      return;
    }
    el('setup-error').textContent = '';
    game = built.game;
    lastNames = game.players.map(function (p) { return p.name; });
    persist();
    render();
  }

  /* ---------------- rendering ---------------- */

  function view(name) {
    ['setup', 'game', 'done'].forEach(function (v) {
      el('view-' + v).classList.toggle('hidden', v !== name);
    });
    el('btn-quit').classList.toggle('hidden', name !== 'game');
  }

  function persist() {
    if (game) Storage.saveGame(game);
  }

  /* The most recent ruling, so the scoreboard can reveal a missed spelling
     without ever showing the word that is coming next. */
  function lastRuling() {
    if (!game) return null;
    if (game.judged) return { entry: Game.currentEntry(game), round: Game.currentRound(game) };
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
    return entry && entry.result ? { entry: entry, round: game.rounds[r] } : null;
  }

  function render() {
    if (!game) {
      view('setup');
      showResumeOption();
      showBankNote();
      pushToBoard();
      return;
    }
    if (game.phase === 'done') {
      renderResults();
      pushToBoard();
      return;
    }

    view('game');
    var round = Game.currentRound(game);
    var entry = Game.currentEntry(game);
    var word = entry.word;

    el('round-no').textContent = 'Round ' + round.round;
    el('round-pts').textContent = round.points + (round.points === 1 ? ' point' : ' points') + ' a word';
    el('speller-count').textContent = 'Speller ' + (game.cursor.index + 1) + ' of ' + round.entries.length;

    var p = Game.progress(game);
    el('progress-bar').style.width = Math.round((p.done / p.total) * 100) + '%';

    el('speller-name').textContent = Game.playerName(game, entry.playerId);
    el('the-word').textContent = word.word;
    el('respell').textContent = word.respelling;
    el('grammar').textContent = word.partOfSpeech;
    el('d-origin').textContent = word.origin;
    el('d-definition').textContent = word.definition;
    el('d-sentence').textContent = '“' + word.sentence + '”';

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

    var judged = game.judged;
    el('judge-row').classList.toggle('hidden', judged);
    el('verdict').classList.toggle('hidden', !judged);
    if (judged) {
      var ok = entry.result === 'correct';
      el('verdict').className = 'verdict ' + (ok ? 'correct' : 'miss');
      el('verdict-mark').textContent = ok ? 'CORRECT' : 'MISSED';
      el('verdict-note').textContent = ok
        ? Game.playerName(game, entry.playerId) + ' takes ' + round.points +
          (round.points === 1 ? ' point' : ' points') + '.'
        : 'No points. The scoreboard is showing the spelling.';
    }

    el('btn-swap').disabled = judged || !(game.spares[round.round] || []).length;
    el('btn-undo').disabled = !judged && game.cursor.round === 0 && game.cursor.index === 0;

    renderStandings();
    persist();
    pushToBoard();
  }

  function renderStandings() {
    var rows = Game.standings(game);
    var upId = game.phase === 'playing' ? Game.currentEntry(game).playerId : null;
    var list = el('score-list');
    list.innerHTML = '';
    rows.forEach(function (row) {
      var li = document.createElement('li');
      if (row.id === upId) li.className = 'up';
      var rk = document.createElement('span');
      rk.className = 'rk';
      rk.textContent = row.rank;
      var nm = document.createElement('span');
      nm.className = 'nm';
      nm.textContent = row.name;
      var sc = document.createElement('span');
      sc.className = 'sc';
      sc.textContent = row.score;
      li.appendChild(rk);
      li.appendChild(nm);
      li.appendChild(sc);
      list.appendChild(li);
    });
  }

  function renderResults() {
    view('done');
    var rows = Game.standings(game);
    var champs = Game.winners(game);
    var names = champs.map(function (c) { return c.name; });

    if (champs.length === 1) {
      el('winner-line').innerHTML = '<span class="gold">' + escapeHtml(names[0]) + '</span> wins.';
      el('winner-sub').textContent = champs[0].score + ' of a possible ' + Game.perfectScore() + ' points.';
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
        '<td class="num">' + row.score + '</td>';
      body.appendChild(tr);
    });

    var recap = el('recap');
    recap.innerHTML = '';
    game.rounds.forEach(function (round) {
      var missed = round.entries.filter(function (e) { return e.result === 'miss'; }).length;
      var d = document.createElement('details');
      var sum = document.createElement('summary');
      sum.textContent = 'Round ' + round.round + ' · ' + round.points +
        (round.points === 1 ? ' point' : ' points') + ' · ' + missed +
        (missed === 1 ? ' miss' : ' misses');
      var ul = document.createElement('ul');
      ul.className = 'rlist';
      round.entries.forEach(function (e) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="who">' + escapeHtml(Game.playerName(game, e.playerId)) + '</span>' +
          '<span class="' + (e.result === 'correct' ? 'ok' : 'no') + '">' + escapeHtml(e.word.word) + '</span>';
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
      return { name: r.name, score: r.score, rank: r.rank };
    });
    if (game.phase === 'done') {
      return {
        type: 'sbee:state', phase: 'done', standings: rows,
        winners: Game.winners(game).map(function (w) { return w.name; }),
        perfect: Game.perfectScore()
      };
    }
    var round = Game.currentRound(game);
    var entry = Game.currentEntry(game);
    var nxt = Game.nextEntry(game);
    var ruling = lastRuling();
    return {
      type: 'sbee:state',
      phase: 'playing',
      round: round.round,
      roundsTotal: Game.ROUNDS,
      points: round.points,
      spellerIndex: game.cursor.index + 1,
      spellerCount: round.entries.length,
      current: Game.playerName(game, entry.playerId),
      judged: game.judged,
      next: nxt ? Game.playerName(game, nxt.playerId) : null,
      standings: rows,
      // Only ever a word that has already been ruled on - never the next one.
      reveal: ruling ? {
        name: Game.playerName(game, ruling.entry.playerId),
        word: ruling.entry.word.word,
        correct: ruling.entry.result === 'correct'
      } : null
    };
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
      return;
    }
    // The child announces itself once loaded; that is when the first push lands.
  }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'sbee:ready') pushToBoard();
  });

  /* ---------------- actions ---------------- */

  function doJudge(correct) {
    if (!game || game.phase !== 'playing' || game.judged) return;
    Game.judge(game, correct);
    render();
  }

  function doAdvance() {
    if (!game || !game.judged) return;
    Game.advance(game);
    render();
  }

  function doUndo() {
    if (!game) return;
    if (Game.undo(game)) render();
  }

  function doSwap() {
    if (!game || game.phase !== 'playing') return;
    if (Game.swapWord(game)) render();
  }

  function quitGame() {
    if (!window.confirm('End this game and throw away the scores?')) return;
    Storage.clearGame();
    game = null;
    render();
  }

  /* ---------------- wiring ---------------- */

  buildNameInputs();

  el('btn-start').addEventListener('click', startGame);
  el('btn-clear-names').addEventListener('click', function () {
    fillNames([]);
    el('setup-error').textContent = '';
    el('name-0').focus();
  });
  el('btn-resume').addEventListener('click', function () {
    game = Storage.loadGame();
    render();
  });
  el('btn-discard').addEventListener('click', function () {
    Storage.clearGame();
    showResumeOption();
  });
  el('btn-correct').addEventListener('click', function () { doJudge(true); });
  el('btn-miss').addEventListener('click', function () { doJudge(false); });
  el('btn-next').addEventListener('click', doAdvance);
  el('btn-undo').addEventListener('click', doUndo);
  el('btn-swap').addEventListener('click', doSwap);
  el('btn-quit').addEventListener('click', quitGame);
  el('btn-scoreboard').addEventListener('click', openScoreboard);
  el('btn-again').addEventListener('click', function () {
    var built = Game.createGame(lastNames, window.WORD_BANK, Storage.loadHistory());
    if (!built.ok) { window.alert(built.error); return; }
    game = built.game;
    render();
  });
  el('btn-newplayers').addEventListener('click', function () {
    game = null;
    fillNames(lastNames);
    render();
  });

  document.addEventListener('keydown', function (e) {
    if (!game || game.phase !== 'playing') return;
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key.toLowerCase();
    if (k === 'c') { e.preventDefault(); doJudge(true); }
    else if (k === 'x') { e.preventDefault(); doJudge(false); }
    else if (k === ' ' || k === 'enter') { e.preventDefault(); doAdvance(); }
    else if (k === 'u') { e.preventDefault(); doUndo(); }
    else if (k === 's') { e.preventDefault(); doSwap(); }
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
