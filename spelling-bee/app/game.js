/* Pure game logic. No DOM, no storage - so it can be tested headlessly. */
(function (root) {
  'use strict';

  var ROUNDS = 8;
  var MAX_PLAYERS = 10;
  var NO_REPEAT_GAMES = 20;

  // Rounds 1-2 are worth 1 point, 3-4 are worth 2, and so on up to 4.
  function pointsForRound(round) {
    return Math.ceil(round / 2);
  }

  function perfectScore() {
    var total = 0;
    for (var r = 1; r <= ROUNDS; r++) total += pointsForRound(r);
    return total;
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = copy[i];
      copy[i] = copy[j];
      copy[j] = swap;
    }
    return copy;
  }

  /* Words used within the last NO_REPEAT_GAMES games are held back. If a tier
     cannot fill a game under that rule, the least recently used words are
     released first so a game can always start. */
  function pickWords(tierWords, count, usedWords, gameNumber) {
    var fresh = [];
    var stale = [];
    for (var i = 0; i < tierWords.length; i++) {
      var entry = tierWords[i];
      var lastUsed = usedWords[entry.word];
      if (lastUsed === undefined || gameNumber - lastUsed >= NO_REPEAT_GAMES) fresh.push(entry);
      else stale.push(entry);
    }
    var chosen = shuffle(fresh).slice(0, count);
    if (chosen.length < count) {
      stale.sort(function (a, b) { return usedWords[a.word] - usedWords[b.word]; });
      chosen = chosen.concat(stale.slice(0, count - chosen.length));
    }
    var pickedNames = {};
    for (var c = 0; c < chosen.length; c++) pickedNames[chosen[c].word] = true;
    var spares = shuffle(fresh.filter(function (e) { return !pickedNames[e.word]; }));
    return { chosen: chosen, spares: spares };
  }

  function validateNames(rawNames) {
    var names = [];
    var seen = {};
    for (var i = 0; i < rawNames.length; i++) {
      var name = String(rawNames[i] || '').trim();
      if (!name) continue;
      var key = name.toLowerCase();
      if (seen[key]) return { ok: false, error: 'Two players are both called "' + name + '". Give them different names.' };
      seen[key] = true;
      names.push(name);
    }
    if (names.length < 2) return { ok: false, error: 'Enter at least two players.' };
    if (names.length > MAX_PLAYERS) return { ok: false, error: 'Maximum ' + MAX_PLAYERS + ' players.' };
    return { ok: true, names: names };
  }

  function createGame(rawNames, wordBank, history) {
    var check = validateNames(rawNames);
    if (!check.ok) return check;

    var players = check.names.map(function (name, i) {
      return { id: 'p' + i, name: name };
    });

    var usedWords = (history && history.usedWords) || {};
    var gameNumber = ((history && history.gameCounter) || 0) + 1;

    var rounds = [];
    var spares = {};
    for (var r = 1; r <= ROUNDS; r++) {
      var picked = pickWords(wordBank[r] || [], players.length, usedWords, gameNumber);
      spares[r] = picked.spares;
      // Speller order is reshuffled every round so nobody is always last.
      var order = shuffle(players);
      rounds.push({
        round: r,
        points: pointsForRound(r),
        entries: order.map(function (player, i) {
          return { playerId: player.id, word: picked.chosen[i], result: null };
        })
      });
    }

    return {
      ok: true,
      game: {
        version: 1,
        gameNumber: gameNumber,
        startedAt: new Date().toISOString(),
        players: players,
        rounds: rounds,
        spares: spares,
        cursor: { round: 0, index: 0 },
        judged: false,
        phase: 'playing'
      }
    };
  }

  function currentRound(game) {
    return game.rounds[game.cursor.round] || null;
  }

  function currentEntry(game) {
    var round = currentRound(game);
    return round ? round.entries[game.cursor.index] || null : null;
  }

  function playerName(game, playerId) {
    for (var i = 0; i < game.players.length; i++) {
      if (game.players[i].id === playerId) return game.players[i].name;
    }
    return '?';
  }

  /* The entry after the cursor, so the scoreboard can show who is on deck. */
  function nextEntry(game) {
    var round = game.cursor.round;
    var index = game.cursor.index + 1;
    if (round >= game.rounds.length) return null;
    if (index >= game.rounds[round].entries.length) {
      round += 1;
      index = 0;
    }
    if (round >= game.rounds.length) return null;
    return game.rounds[round].entries[index] || null;
  }

  function judge(game, correct) {
    var entry = currentEntry(game);
    if (!entry || game.judged) return false;
    entry.result = correct ? 'correct' : 'miss';
    game.judged = true;
    return true;
  }

  function advance(game) {
    if (!game.judged) return false;
    var round = currentRound(game);
    if (game.cursor.index + 1 < round.entries.length) {
      game.cursor.index += 1;
    } else if (game.cursor.round + 1 < game.rounds.length) {
      game.cursor.round += 1;
      game.cursor.index = 0;
    } else {
      game.phase = 'done';
      game.finishedAt = new Date().toISOString();
    }
    game.judged = false;
    return true;
  }

  /* Undo steps back over the boundary between rounds, so a misclick on the
     last speller of a round is still recoverable. */
  function undo(game) {
    if (game.judged) {
      currentEntry(game).result = null;
      game.judged = false;
      return true;
    }
    if (game.phase === 'done') {
      game.phase = 'playing';
      delete game.finishedAt;
      var last = game.rounds[game.rounds.length - 1];
      game.cursor = { round: game.rounds.length - 1, index: last.entries.length - 1 };
      currentEntry(game).result = null;
      return true;
    }
    if (game.cursor.index > 0) {
      game.cursor.index -= 1;
    } else if (game.cursor.round > 0) {
      game.cursor.round -= 1;
      game.cursor.index = game.rounds[game.cursor.round].entries.length - 1;
    } else {
      return false;
    }
    currentEntry(game).result = null;
    return true;
  }

  /* Swap pulls a replacement from the same tier's unused pool, so difficulty
     stays honest when a word turns out to be unpronounceable or already known. */
  function swapWord(game) {
    var entry = currentEntry(game);
    if (!entry || game.judged) return false;
    var round = currentRound(game);
    var pool = game.spares[round.round] || [];
    if (!pool.length) return false;
    var replacement = pool.shift();
    pool.push(entry.word);
    entry.word = replacement;
    return true;
  }

  function standings(game) {
    var byId = {};
    game.players.forEach(function (p) {
      byId[p.id] = { id: p.id, name: p.name, score: 0, correct: 0, attempted: 0 };
    });
    game.rounds.forEach(function (round) {
      round.entries.forEach(function (entry) {
        var row = byId[entry.playerId];
        if (!entry.result) return;
        row.attempted += 1;
        if (entry.result === 'correct') {
          row.score += round.points;
          row.correct += 1;
        }
      });
    });
    var rows = game.players.map(function (p) { return byId[p.id]; });
    rows.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });
    // Equal scores share a rank, because ties stand in this game.
    var rank = 0;
    var lastScore = null;
    rows.forEach(function (row, i) {
      if (row.score !== lastScore) {
        rank = i + 1;
        lastScore = row.score;
      }
      row.rank = rank;
    });
    return rows;
  }

  function winners(game) {
    var rows = standings(game);
    return rows.filter(function (row) { return row.rank === 1; });
  }

  function progress(game) {
    var done = 0;
    var total = 0;
    game.rounds.forEach(function (round) {
      round.entries.forEach(function (entry) {
        total += 1;
        if (entry.result) done += 1;
      });
    });
    return { done: done, total: total };
  }

  root.Game = {
    ROUNDS: ROUNDS,
    MAX_PLAYERS: MAX_PLAYERS,
    NO_REPEAT_GAMES: NO_REPEAT_GAMES,
    pointsForRound: pointsForRound,
    perfectScore: perfectScore,
    validateNames: validateNames,
    createGame: createGame,
    currentRound: currentRound,
    currentEntry: currentEntry,
    nextEntry: nextEntry,
    playerName: playerName,
    judge: judge,
    advance: advance,
    undo: undo,
    swapWord: swapWord,
    standings: standings,
    winners: winners,
    progress: progress
  };
})(typeof window !== 'undefined' ? window : globalThis);
