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

    el('now-label').textContent = state.judged ? 'Just spelled' : 'Now spelling';
    el('now-name').textContent = state.current || '';
    el('on-deck').innerHTML = state.next ? 'Up next &mdash; <b>' + escapeHtml(state.next) + '</b>' : 'Last word of the game';

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
