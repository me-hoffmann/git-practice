/* localStorage wrapper. Every read and write is guarded, because private
   windows and blocked site data make these calls throw. */
(function (root) {
  'use strict';

  var GAME_KEY = 'spellingbee.currentGame';
  var HISTORY_KEY = 'spellingbee.history';
  var MAX_GAME_RECORDS = 200;

  function read(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (err) { /* nothing to do */ }
  }

  function available() {
    try {
      var probe = '__sbee_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (err) {
      return false;
    }
  }

  function emptyHistory() {
    return { version: 1, gameCounter: 0, usedWords: {}, games: [] };
  }

  function loadHistory() {
    var history = read(HISTORY_KEY);
    if (!history || typeof history !== 'object') return emptyHistory();
    history.usedWords = history.usedWords || {};
    history.games = history.games || [];
    history.gameCounter = history.gameCounter || 0;
    return history;
  }

  /* Records a finished game: marks its words as used and stores a per-player
     summary. The summary is what a future stats screen will read - it is kept
     now so that feature needs no migration later. */
  function recordGame(game, standings) {
    var history = loadHistory();

    // Upsert by start time. Undoing from the results screen and finishing
    // again must correct the record rather than add a second one.
    var existing = -1;
    for (var g = 0; g < history.games.length; g++) {
      if (history.games[g].startedAt === game.startedAt) { existing = g; break; }
    }
    var number;
    if (existing >= 0) {
      number = history.games[existing].gameNumber;
    } else {
      history.gameCounter += 1;
      number = history.gameCounter;
    }

    game.rounds.forEach(function (round) {
      round.entries.forEach(function (entry) {
        if (entry.word && entry.word.word) history.usedWords[entry.word.word] = number;
      });
    });

    var record = {
      gameNumber: number,
      startedAt: game.startedAt,
      finishedAt: game.finishedAt || new Date().toISOString(),
      players: standings.map(function (row) {
        return { name: row.name, score: row.score, correct: row.correct, attempted: row.attempted, rank: row.rank };
      }),
      wordsByRound: game.rounds.map(function (round) {
        return {
          round: round.round,
          points: round.points,
          entries: round.entries.map(function (entry) {
            return { player: Game.playerName(game, entry.playerId), word: entry.word.word, result: entry.result };
          })
        };
      })
    };
    if (existing >= 0) history.games[existing] = record;
    else history.games.push(record);

    if (history.games.length > MAX_GAME_RECORDS) {
      history.games = history.games.slice(-MAX_GAME_RECORDS);
    }
    write(HISTORY_KEY, history);
    return history;
  }

  /* How many words are still held back by the no-repeat rule, per tier. */
  function freshnessReport(wordBank, history) {
    var report = [];
    for (var tier = 1; tier <= 8; tier++) {
      var words = wordBank[tier] || [];
      var fresh = 0;
      for (var i = 0; i < words.length; i++) {
        var lastUsed = history.usedWords[words[i].word];
        if (lastUsed === undefined || history.gameCounter + 1 - lastUsed >= Game.NO_REPEAT_GAMES) fresh += 1;
      }
      report.push({ tier: tier, fresh: fresh, total: words.length });
    }
    return report;
  }

  root.Storage = {
    available: available,
    loadGame: function () { return read(GAME_KEY); },
    saveGame: function (game) { return write(GAME_KEY, game); },
    clearGame: function () { remove(GAME_KEY); },
    loadHistory: loadHistory,
    recordGame: recordGame,
    freshnessReport: freshnessReport,
    resetHistory: function () { write(HISTORY_KEY, emptyHistory()); }
  };
})(window);
