/* Generates plausible wrong spellings for the second-chance multiple choice.
   Rules are ordered: a classic misspelling beats a generic letter swap, so the
   three options all look like something a person would actually write. */
(function (root) {
  'use strict';

  var VOWELS = 'aeiou';

  function swapEnding(word, from, to) {
    return word.slice(-from.length) === from ? word.slice(0, -from.length) + to : null;
  }

  function replaceFirst(word, find, repl) {
    var at = word.indexOf(find);
    return at === -1 ? null : word.slice(0, at) + repl + word.slice(at + find.length);
  }

  // Ordered best-first: each returns a variant or null.
  var RULES = [
    // -ance / -ence and -ant / -ent, the classic coin flip.
    function (w) { return swapEnding(w, 'ance', 'ence'); },
    function (w) { return swapEnding(w, 'ence', 'ance'); },
    function (w) { return swapEnding(w, 'ant', 'ent'); },
    function (w) { return swapEnding(w, 'ent', 'ant'); },
    // -able / -ible.
    function (w) { return swapEnding(w, 'able', 'ible'); },
    function (w) { return swapEnding(w, 'ible', 'able'); },
    // i before e.
    function (w) { return replaceFirst(w, 'ie', 'ei'); },
    function (w) { return replaceFirst(w, 'ei', 'ie'); },
    // Collapse a doubled consonant - embarrass loses an r.
    function (w) {
      var m = w.match(/([bcdfglmnprstz])\1/);
      return m ? w.replace(m[0], m[1]) : null;
    },
    // Double a lone consonant between vowels - occasion gains an s.
    function (w) {
      var m = w.match(/[aeiou]([bcdflmnprstz])[aeiou]/);
      if (!m) return null;
      var at = w.indexOf(m[0]) + 1;
      return w.slice(0, at) + m[1] + w.slice(at);
    },
    // The schwa that nobody can hear: separate becomes seperate.
    function (w) {
      var m = w.slice(1, -1).match(/a/);
      return m ? w.slice(0, m.index + 1) + 'e' + w.slice(m.index + 2) : null;
    },
    function (w) {
      var m = w.slice(1, -1).match(/e/);
      return m ? w.slice(0, m.index + 1) + 'a' + w.slice(m.index + 2) : null;
    },
    // British endings, which are wrong at this table by house rule.
    function (w) { return swapEnding(w, 'ize', 'ise'); },
    function (w) { return swapEnding(w, 'yze', 'yse'); },
    function (w) { return swapEnding(w, 'or', 'our'); },
    function (w) { return swapEnding(w, 'er', 're'); },
    // judgment / judgement.
    function (w) { return swapEnding(w, 'gment', 'gement'); },
    // -ar / -er / -or confusion (grammar, calendar).
    function (w) { return swapEnding(w, 'ar', 'er'); },
    function (w) { return swapEnding(w, 'ery', 'ary'); },
    function (w) { return swapEnding(w, 'ary', 'ery'); },
    // Greek spellings written the way they sound.
    function (w) { return replaceFirst(w, 'ph', 'f'); },
    function (w) { return replaceFirst(w, 'ch', 'k'); },
    function (w) { return replaceFirst(w, 'rh', 'r'); },
    function (w) { return replaceFirst(w, 'ps', 's'); },
    // y for i in the middle.
    function (w) {
      var i = w.slice(1, -1).indexOf('y');
      return i === -1 ? null : w.slice(0, i + 1) + 'i' + w.slice(i + 2);
    },
    function (w) {
      var i = w.slice(1, -1).indexOf('i');
      return i === -1 ? null : w.slice(0, i + 1) + 'y' + w.slice(i + 2);
    },
    // Vowel pairs that sound alike.
    function (w) { return replaceFirst(w, 'ea', 'ee'); },
    function (w) { return replaceFirst(w, 'ee', 'ea'); },
    function (w) { return replaceFirst(w, 'ou', 'oo'); },
    function (w) { return replaceFirst(w, 'au', 'aw'); },
    // Drop a silent letter.
    function (w) { return replaceFirst(w, 'gh', 'g'); },
    function (w) { return w.length > 5 && w[0] === 'p' && w[1] === 'n' ? w.slice(1) : null; }
  ];

  /* Transposing two middle letters always produces something, so it is the
     guarantee that every word can offer a full set of options. */
  function transpositions(word) {
    var out = [];
    for (var i = 1; i < word.length - 2; i++) {
      if (word[i] === word[i + 1]) continue;
      out.push(word.slice(0, i) + word[i + 1] + word[i] + word.slice(i + 2));
    }
    return out;
  }

  function matchCase(sample, candidate) {
    return sample[0] === sample[0].toUpperCase()
      ? candidate[0].toUpperCase() + candidate.slice(1)
      : candidate;
  }

  /* Returns `count` wrong spellings of `word`. `forbidden` is a Set of
     lowercased real words, so an option is never accidentally correct. */
  function alternatives(word, forbidden, count) {
    count = count || 2;
    var lower = word.toLowerCase();
    var seen = {};
    seen[lower] = true;
    var picked = [];

    function consider(candidate) {
      if (picked.length >= count) return;
      if (!candidate || candidate.length < 3) return;
      var key = candidate.toLowerCase();
      if (seen[key]) return;
      if (forbidden && forbidden.has(key)) return;
      seen[key] = true;
      picked.push(matchCase(word, candidate));
    }

    for (var r = 0; r < RULES.length && picked.length < count; r++) {
      consider(RULES[r](lower));
    }
    var swaps = transpositions(lower);
    for (var s = 0; s < swaps.length && picked.length < count; s++) consider(swaps[s]);
    return picked;
  }

  /* The correct word plus its decoys, shuffled, with the answer's index. */
  function buildChoices(word, forbidden) {
    var wrong = alternatives(word, forbidden, 2);
    var options = [word].concat(wrong);
    for (var i = options.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = options[i]; options[i] = options[j]; options[j] = t;
    }
    return { options: options, answer: options.indexOf(word) };
  }

  root.Misspell = { alternatives: alternatives, buildChoices: buildChoices };
})(typeof window !== 'undefined' ? window : globalThis);
