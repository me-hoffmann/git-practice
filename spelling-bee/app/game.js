/* Pure game logic. No DOM, no storage - so it can be tested headlessly. */
(function (root) {
  'use strict';

  var ROUNDS = 8;
  var MAX_PLAYERS = 10;
  var NO_REPEAT_GAMES = 20;
  var TIERS = 8;
  var CHOICE_TIER_STEP = 2;
  var LIFELINE_KINDS = ['letter', 'table', 'pass'];

  var DEFAULT_SETTINGS = { chooseDifficulty: true, lifelines: 3, secondChance: true };

  // Rounds 1-2 are worth 1 point, 3-4 are worth 2, and so on up to 4.
  function pointsForRound(round) {
    return Math.ceil(round / 2);
  }

  function clampTier(tier) {
    return Math.min(TIERS, Math.max(1, tier));
  }

  /* A choice is only offered when it actually changes the word: round 1 has no
     safer tier to drop to, and round 8 has no harder one to climb to. */
  function choiceFor(round, key) {
    var base = pointsForRound(round);
    if (key === 'safe') {
      var down = clampTier(round - CHOICE_TIER_STEP);
      return { key: key, tier: down, points: Math.max(1, base - 1), available: down !== round };
    }
    if (key === 'risky') {
      var up = clampTier(round + CHOICE_TIER_STEP);
      return { key: key, tier: up, points: base + 2, available: up !== round };
    }
    return { key: 'standard', tier: round, points: base, available: true };
  }

  function choicesForRound(round) {
    return ['safe', 'standard', 'risky']
      .map(function (key) { return choiceFor(round, key); })
      .filter(function (choice) { return choice.available; });
  }

  /* The most points reachable in a whole game, used to frame a final score.
     With gambling switched on that is more than the classic 20. */
  function maxPossible(settings) {
    var total = 0;
    for (var r = 1; r <= ROUNDS; r++) {
      var risky = choiceFor(r, 'risky');
      total += (settings && settings.chooseDifficulty && risky.available) ? risky.points : pointsForRound(r);
    }
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
     runs thin the least recently used are released first, so a game always
     starts. */
  function tierPool(tierWords, usedWords, gameNumber) {
    var fresh = [];
    var stale = [];
    for (var i = 0; i < tierWords.length; i++) {
      var entry = tierWords[i];
      var lastUsed = usedWords[entry.word];
      if (lastUsed === undefined || gameNumber - lastUsed >= NO_REPEAT_GAMES) fresh.push(entry);
      else stale.push(entry);
    }
    stale.sort(function (a, b) { return usedWords[a.word] - usedWords[b.word]; });
    return { fresh: shuffle(fresh), stale: stale };
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

  /* `roster` is either plain names or {name, lifelines} objects, which is how
     one player can start with more help than another. */
  function createGame(roster, wordBank, history, settings) {
    var entries = roster.map(function (r) { return typeof r === 'string' ? { name: r } : (r || {}); });
    var check = validateNames(entries.map(function (r) { return r.name; }));
    if (!check.ok) return check;

    var opts = {
      chooseDifficulty: settings ? !!settings.chooseDifficulty : DEFAULT_SETTINGS.chooseDifficulty,
      secondChance: settings ? !!settings.secondChance : DEFAULT_SETTINGS.secondChance,
      lifelines: settings && settings.lifelines !== undefined ? Math.max(0, settings.lifelines | 0) : DEFAULT_SETTINGS.lifelines
    };

    var named = entries.filter(function (r) { return String(r.name || '').trim(); });
    var players = named.map(function (r, i) {
      var allowance = r.lifelines === undefined || r.lifelines === null ? opts.lifelines : Math.max(0, r.lifelines | 0);
      return {
        id: 'p' + i,
        name: String(r.name).trim(),
        lifelines: allowance,
        lifelinesStart: allowance
      };
    });

    var usedWords = (history && history.usedWords) || {};
    var gameNumber = ((history && history.gameCounter) || 0) + 1;

    // One shared pool per tier. Choosing a difficulty or spending a pass draws
    // from whichever tier the player lands on, so all eight stay stocked.
    var pool = { fresh: {}, stale: {} };
    for (var t = 1; t <= TIERS; t++) {
      var split = tierPool(wordBank[t] || [], usedWords, gameNumber);
      pool.fresh[t] = split.fresh;
      pool.stale[t] = split.stale;
    }

    var rounds = [];
    for (var r = 1; r <= ROUNDS; r++) {
      // Speller order is reshuffled every round so nobody is always last.
      var order = shuffle(players);
      rounds.push({
        round: r,
        points: pointsForRound(r),
        entries: order.map(function (player) {
          return {
            playerId: player.id,
            word: pool.fresh[r].shift() || pool.stale[r].shift(),
            choice: null,
            result: null,
            secondOptions: null,
            second: null,
            lifelinesUsed: []
          };
        })
      });
    }

    return {
      ok: true,
      game: {
        version: 2,
        gameNumber: gameNumber,
        startedAt: new Date().toISOString(),
        settings: opts,
        players: players,
        rounds: rounds,
        pool: pool,
        cursor: { round: 0, index: 0 },
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

  function findPlayer(game, playerId) {
    for (var i = 0; i < game.players.length; i++) {
      if (game.players[i].id === playerId) return game.players[i];
    }
    return null;
  }

  function playerName(game, playerId) {
    var player = findPlayer(game, playerId);
    return player ? player.name : '?';
  }

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

  /* The whole turn is derived from the entry, so undo only has to clear
     fields and every screen stays consistent with the saved state. */
  function turnStage(game) {
    if (game.phase !== 'playing') return 'over';
    var entry = currentEntry(game);
    if (!entry) return 'over';
    if (game.settings.chooseDifficulty && !entry.choice) return 'choose';
    if (!entry.result) return 'spell';
    if (entry.secondOptions && !entry.second) return 'second';
    return 'judged';
  }

  /* Tiers cover for each other. When a tier has no unused words left, a
     neighbour one step away is a far better substitute than repeating a word
     somebody has already seen - the difficulty barely moves, and the
     no-repeat rule survives a table that leans heavily on safe or risky. */
  function drawWord(game, tier) {
    var order = [tier];
    for (var step = 1; step <= 2; step++) {
      if (tier - step >= 1) order.push(tier - step);
      if (tier + step <= TIERS) order.push(tier + step);
    }
    for (var i = 0; i < order.length; i++) {
      var fresh = game.pool.fresh[order[i]];
      if (fresh && fresh.length) return fresh.shift();
    }
    for (var j = 0; j < order.length; j++) {
      var stale = game.pool.stale[order[j]];
      if (stale && stale.length) return stale.shift();
    }
    return null;
  }

  function returnWord(game, tier, word) {
    if (word && game.pool.fresh[tier]) game.pool.fresh[tier].push(word);
  }

  function chooseDifficulty(game, key) {
    if (turnStage(game) !== 'choose') return false;
    var round = currentRound(game);
    var choice = choiceFor(round.round, key);
    if (!choice.available) return false;
    var entry = currentEntry(game);
    if (choice.tier !== round.round) {
      var replacement = drawWord(game, choice.tier);
      if (!replacement) return false;
      returnWord(game, entry.word.tier, entry.word);
      entry.word = replacement;
    }
    entry.choice = choice.key;
    return true;
  }

  function activeChoice(game, entry) {
    return game.settings.chooseDifficulty ? (entry.choice || 'standard') : 'standard';
  }

  function lifelinesLeft(game, playerId) {
    var player = findPlayer(game, playerId);
    return player ? player.lifelines : 0;
  }

  /* Each kind can be spent once per word: a first letter and a shout from the
     table on the same word is fair, spending the same help twice is not. */
  function canUseLifeline(game, kind) {
    if (LIFELINE_KINDS.indexOf(kind) === -1) return false;
    if (turnStage(game) !== 'spell') return false;
    var entry = currentEntry(game);
    if (entry.lifelinesUsed.indexOf(kind) !== -1) return false;
    return lifelinesLeft(game, entry.playerId) > 0;
  }

  function useLifeline(game, kind) {
    if (!canUseLifeline(game, kind)) return null;
    var entry = currentEntry(game);
    var player = findPlayer(game, entry.playerId);
    if (kind === 'pass') {
      var replacement = drawWord(game, entry.word.tier);
      if (!replacement) return null;
      returnWord(game, entry.word.tier, entry.word);
      entry.word = replacement;
    }
    player.lifelines -= 1;
    entry.lifelinesUsed.push(kind);
    return { kind: kind, word: entry.word, remaining: player.lifelines };
  }

  function judge(game, correct, buildChoices) {
    var stage = turnStage(game);
    if (stage !== 'spell') return false;
    var entry = currentEntry(game);
    entry.result = correct ? 'correct' : 'miss';
    if (!correct && game.settings.secondChance && typeof buildChoices === 'function') {
      entry.secondOptions = buildChoices(entry.word.word);
    }
    return true;
  }

  function answerSecondChance(game, pickedIndex) {
    if (turnStage(game) !== 'second') return false;
    var entry = currentEntry(game);
    entry.second = {
      picked: pickedIndex,
      correct: pickedIndex === entry.secondOptions.answer
    };
    return true;
  }

  function skipSecondChance(game) {
    if (turnStage(game) !== 'second') return false;
    currentEntry(game).second = { picked: null, correct: false };
    return true;
  }

  function advance(game) {
    if (turnStage(game) !== 'judged') return false;
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
    return true;
  }

  function clearRuling(entry) {
    entry.result = null;
    entry.secondOptions = null;
    entry.second = null;
  }

  /* Undo throws away the whole ruling on this word in one press, and steps
     back over the round boundary when this word has not been ruled on yet.
     Spent lifelines stay spent - they really were used. */
  function undo(game) {
    if (game.phase === 'done') {
      game.phase = 'playing';
      delete game.finishedAt;
      var last = game.rounds[game.rounds.length - 1];
      game.cursor = { round: game.rounds.length - 1, index: last.entries.length - 1 };
      clearRuling(currentEntry(game));
      return true;
    }
    var entry = currentEntry(game);
    if (entry && entry.result) {
      clearRuling(entry);
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
    clearRuling(currentEntry(game));
    return true;
  }

  /* A word landed outright pays its choice in full; one recovered on the
     second chance pays half, rounded up, so it always beats nothing. */
  function entryPoints(game, round, entry) {
    var base = choiceFor(round.round, activeChoice(game, entry)).points;
    if (entry.result === 'correct') return base;
    if (entry.second && entry.second.correct) return Math.ceil(base / 2);
    return 0;
  }

  function entryResolved(entry) {
    if (!entry.result) return false;
    if (entry.secondOptions && !entry.second) return false;
    return true;
  }

  function standings(game) {
    var byId = {};
    game.players.forEach(function (p) {
      byId[p.id] = {
        id: p.id, name: p.name, score: 0, correct: 0, attempted: 0,
        recovered: 0, gambles: 0, lifelines: p.lifelines
      };
    });
    game.rounds.forEach(function (round) {
      round.entries.forEach(function (entry) {
        if (!entryResolved(entry)) return;
        var row = byId[entry.playerId];
        row.attempted += 1;
        if (activeChoice(game, entry) === 'risky') row.gambles += 1;
        if (entry.result === 'correct') row.correct += 1;
        else if (entry.second && entry.second.correct) row.recovered += 1;
        row.score += entryPoints(game, round, entry);
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
    return standings(game).filter(function (row) { return row.rank === 1; });
  }

  function progress(game) {
    var done = 0;
    var total = 0;
    game.rounds.forEach(function (round) {
      round.entries.forEach(function (entry) {
        total += 1;
        if (entryResolved(entry)) done += 1;
      });
    });
    return { done: done, total: total };
  }

  root.Game = {
    ROUNDS: ROUNDS,
    MAX_PLAYERS: MAX_PLAYERS,
    NO_REPEAT_GAMES: NO_REPEAT_GAMES,
    LIFELINE_KINDS: LIFELINE_KINDS,
    DEFAULT_SETTINGS: DEFAULT_SETTINGS,
    VERSION: 2,
    pointsForRound: pointsForRound,
    choiceFor: choiceFor,
    choicesForRound: choicesForRound,
    maxPossible: maxPossible,
    validateNames: validateNames,
    createGame: createGame,
    currentRound: currentRound,
    currentEntry: currentEntry,
    nextEntry: nextEntry,
    playerName: playerName,
    turnStage: turnStage,
    chooseDifficulty: chooseDifficulty,
    activeChoice: activeChoice,
    lifelinesLeft: lifelinesLeft,
    canUseLifeline: canUseLifeline,
    useLifeline: useLifeline,
    judge: judge,
    answerSecondChance: answerSecondChance,
    skipSecondChance: skipSecondChance,
    advance: advance,
    undo: undo,
    entryPoints: entryPoints,
    entryResolved: entryResolved,
    standings: standings,
    winners: winners,
    progress: progress
  };
})(typeof window !== 'undefined' ? window : globalThis);
