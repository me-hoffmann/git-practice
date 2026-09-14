/* Read-only display driven entirely by postMessage from the pronouncer window.
   It holds no game state and never receives the upcoming word. */
(function () {
  'use strict';

  var el = function (id) { return document.getElementById(id); };

  function show(which) {
    el('view-waiting').classList.toggle('hidden', which !== 'waiting');
    el('view-live').classList.toggle('hidden', which !== 'live');
    el('view-final').classList.toggle('hidden', which !== 'final');
  }

  function badge(text, kind) {
    var span = document.createElement('span');
    span.className = 'badge' + (kind ? ' ' + kind : '');
    span.textContent = text;
    return span;
  }

  function scoreRows(target, standings, currentName) {
    target.innerHTML = '';
    standings.forEach(function (row) {
      var li = document.createElement('li');
      var classes = [];
      if (row.name === currentName) classes.push('up');
      if (row.rank === 1 && row.score > 0) classes.push('lead');
      li.className = classes.join(' ');

      var rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = row.rank;
      var who = document.createElement('span');
      who.className = 'who';
      who.textContent = row.name;
      var pts = document.createElement('span');
      pts.className = 'pts';
      pts.textContent = row.score;

      li.appendChild(rank);
      li.appendChild(who);
      if (row.lifelines !== undefined && row.lifelines !== null) {
        var lives = document.createElement('span');
        lives.className = 'lives';
        lives.textContent = row.lifelines > 0 ? '\u2726'.repeat(row.lifelines) : '';
        li.appendChild(lives);
      }
      li.appendChild(pts);
      target.appendChild(li);
    });
  }

  function paint(state) {
    if (!state || state.phase === 'setup') {
      el('round-label').textContent = '';
      el('worth-label').textContent = '';
      el('worth-label').classList.add('hidden');
      show('waiting');
      return;
    }

    if (state.phase === 'done') {
      el('round-label').textContent = 'Final';
      el('worth-label').textContent = '';
      el('worth-label').classList.add('hidden');
      var names = state.winners || [];
      el('final-crown').textContent = names.length > 1 ? 'It is a tie' : 'Winner';
      el('final-names').textContent = names.length > 1
        ? names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
        : (names[0] || '');
      var top = (state.standings && state.standings[0]) ? state.standings[0].score : 0;
      el('final-sub').textContent = top + ' of a possible ' + state.perfect + ' points' +
        (names.length > 1 ? ' each. Ties stand.' : '.');
      scoreRows(el('final-scores'), state.standings || [], null);
      show('final');
      return;
    }

    el('round-label').innerHTML = 'Round <b>' + state.round + '</b> of ' + state.roundsTotal +
      ' &nbsp;·&nbsp; speller ' + state.spellerIndex + ' of ' + state.spellerCount;
    el('worth-label').textContent = state.points + (state.points === 1 ? ' point' : ' points');
    el('worth-label').classList.remove('hidden');

    var choosing = state.stage === 'choose';
    el('now-label').textContent = choosing ? 'Choosing a word'
      : state.stage === 'second' ? 'Second chance'
      : state.stage === 'judged' ? 'Just spelled' : 'Now spelling';
    el('now-name').textContent = state.current || '';
    el('on-deck').innerHTML = state.next ? 'Up next &mdash; <b>' + escapeHtml(state.next) + '</b>' : 'Last word of the game';

    // Badges: what they chose, what help they spent, and the letter if given.
    var badges = el('badge-row');
    badges.innerHTML = '';
    if (state.choiceMade) {
      badges.appendChild(badge(state.choiceMade.name + ' \u00B7 ' + state.choiceMade.points + ' pts', state.choiceMade.key));
    }
    if (state.firstLetter) badges.appendChild(badge('Starts with ' + state.firstLetter, 'letter'));
    (state.lifelinesUsed || []).forEach(function (name) { badges.appendChild(badge(name)); });
    if (!choosing && state.showLifelines && state.lifelinesLeft !== null) {
      badges.appendChild(badge(state.lifelinesLeft + ' left', ''));
    }

    // The difficulty menu, so the table sees the stakes before the call.
    var deck = el('on-deck');
    if (choosing && state.choices) {
      var grid = document.createElement('div');
      grid.className = 'choosing';
      state.choices.forEach(function (c) {
        var box = document.createElement('div');
        box.className = 'opt ' + c.key;
        box.innerHTML = '<div class="nm">' + escapeHtml(c.name) + '</div>' +
          '<div class="pt">' + c.points + '</div>' +
          '<div class="sb">' + escapeHtml(c.sub) + '</div>';
        grid.appendChild(box);
      });
      deck.innerHTML = '';
      deck.appendChild(grid);
    }

    // Second chance: these have to be legible from the speller's sofa.
    var picks = el('pick-list');
    if (state.secondOptions) {
      el('pick-head').textContent = 'Which spelling is right?';
      var list = el('pick-options');
      list.innerHTML = '';
      state.secondOptions.forEach(function (option, i) {
        var li = document.createElement('li');
        li.innerHTML = '<span class="tag">' + 'ABC'[i] + '</span><span>' + escapeHtml(option) + '</span>';
        list.appendChild(li);
      });
      picks.classList.remove('hidden');
    } else {
      picks.classList.add('hidden');
    }

    var reveal = el('reveal');
    if (state.reveal) {
      reveal.className = 'reveal ' + (state.reveal.correct ? 'correct' : 'miss');
      el('reveal-verdict').textContent = state.reveal.correct ? 'CORRECT' : 'MISSED';
      el('reveal-word').textContent = state.reveal.word;
      el('reveal-caption').textContent = state.reveal.correct
        ? state.reveal.name + ' got it.'
        : state.reveal.name + ' missed it — that is the spelling.';
    } else {
      reveal.className = 'reveal hidden';
    }

    scoreRows(el('live-scores'), state.standings || [], state.current);
    show('live');
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'sbee:state') paint(e.data);
  });

  // Tell the pronouncer window we are listening, and again if it opens later.
  function announce() {
    if (window.opener && !window.opener.closed) {
      try { window.opener.postMessage({ type: 'sbee:ready' }, '*'); } catch (err) { /* ignore */ }
    }
  }
  announce();
  window.addEventListener('load', announce);

  if (!window.opener) {
    el('waiting-sub').textContent =
      'Open this from the pronouncer window with the "Open scoreboard" button, ' +
      'otherwise it has nothing to show.';
  }
})();
