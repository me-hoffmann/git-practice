# Family Spelling Bee

A web app for running a family spelling bee over Zoom. One person runs the game
as the pronouncer; everyone else plays over the call.

Status: **playable.** 1,600 words and a working pronouncer app with a
screen-shareable scoreboard.

## Running it

Open `app/index.html` in a browser. There is no build step, no install and no
server - it is plain HTML, CSS and JavaScript, and the word bank is bundled as
a script so it loads straight from disk.

To put it online instead, serve the `app/` folder from anywhere static
(GitHub Pages works) - there is no backend to host.

## The game

- **8 rounds.** Every player spells one word per round.
- **Nobody is eliminated.** Everyone plays to the end. You earn points for the
  words you get right instead of surviving the ones you get wrong.
- **Points escalate.** Rounds 1-2 are worth 1 point, rounds 3-4 are worth 2,
  rounds 5-6 are worth 3, rounds 7-8 are worth 4. A perfect game is 20 points.
- **Most points wins. Ties stand** - no tiebreaker rounds.
- Up to 10 players. Speller order is randomized fresh each round.
- No late joiners once a game has started.

## Decisions locked in

| Question | Answer |
| --- | --- |
| Players | All adults |
| Where it runs | One person (the pronouncer) on one machine |
| Storage | Browser `localStorage`, no backend, no accounts |
| Zoom display | A separate scoreboard view to screen-share, which never shows the upcoming word |
| Pronunciation style | Plain-English respelling (`kuh-TAS-truh-fee`), not IPA |
| Difficulty anchors | Round 1 = *rhythm*, Round 8 = *eudaemonic* |
| Player stats over time | Deferred, but the data model is designed for it now |
| Variant spellings | American only. British forms are rejected by the validator |
| Round 1 floor | Confirmed at *rhythm* level - round 1 is not a freebie |

### Why storage is a day-one concern

The "no repeated words for at least 20 games" rule already requires persistent
history. Once that exists, adding per-player stats later is cheap - as long as
the schema anticipates it. So storage gets built properly up front even though
the stats UI ships later.

## Word bank

The word bank is the real work here, so it gets built and reviewed before the app.

A 10-player game consumes **10 words per tier, 80 words per game**. Twenty
repeat-free games therefore needs **200 words per tier, 1,600 total**. The bank
now holds exactly that: 200 words in each of the eight rounds.

Run `node tools/validate.mjs` at any time to see coverage against this target.

```
data/words/tier-1.json  ...  tier-8.json     one file per round
data/schema.json                             the entry format
```

Every entry carries what the pronouncer needs to run a real bee:

```json
{
  "word": "catastrophe",
  "tier": 3,
  "respelling": "kuh-TAS-truh-fee",
  "partOfSpeech": "noun",
  "origin": "Greek",
  "definition": "A sudden and widespread disaster.",
  "sentence": "The flood was a catastrophe for the valley.",
  "alsoAccepted": [],
  "notes": ""
}
```

`alsoAccepted` exists because some legitimate words have more than one correct
American spelling - *eudaemonic* / *eudaimonic* / *eudemonic* being the case in
point. The app will warn the pronouncer before a dispute starts rather than
after.

**House rule: American spellings only.** British forms are rejected outright, so
*jewellery*, *haemorrhage* and *proselytise* are all wrong at this table.
`data/british-spellings.txt` lists the forms the validator catches. Accented
forms are rejected too - nobody spells a diacritic aloud.

`notes` carries the warnings that keep a live game moving: homophone traps
(*gorilla* / *guerrilla*, *bazaar* / *bizarre*, *crevasse* / *crevice*),
alternate pronunciations, and the occasional "the c is silent" for words like
*indict*.

### Difficulty ladder

| Round | Points | What belongs here | Example |
| --- | --- | --- | --- |
| 1 | 1 | Everyday words with one counterintuitive trap | rhythm |
| 2 | 1 | Common words, slipperier spelling | liaison |
| 3 | 2 | Educated vocabulary, familiar to readers | connoisseur |
| 4 | 2 | Known but rarely written out | sacrilegious |
| 5 | 3 | Literate and professional vocabulary | pusillanimous |
| 6 | 3 | Rare, but a well-read player has met it | eleemosynary |
| 7 | 4 | Obscure, still crackable from its roots | psephology |
| 8 | 4 | Obscure *and* orthographically treacherous | eudaemonic |

Rounds 7 and 8 divide on a principle rather than a vibe: a round 7 word is one
a good guesser can assemble from Greek and Latin parts (*vexillology*,
*kakistocracy*), while a round 8 word hides silent letters, unexpected digraphs
or foreign consonant clusters that no amount of etymology will hand you
(*syzygy*, *gneiss*, *fuchsia*, *bouillabaisse*).

Round 8 also contains **floccinaucinihilipilification**, 29 letters, kept
deliberately for the laugh. Its `notes` field says so; delete the entry if a
game ever needs a straight face.

## Running a game

**The pronouncer window** (`app/index.html`) shows the word large, with the
plain-English respelling under it. Origin, definition and sentence sit below at
a glance rather than as a script to recite, because in a real bee the *speller*
asks for those. Variant spellings and homophone traps appear in a highlighted
band before the speller starts.

Judge with **Correct** or **Missed it**, then **Next speller**. Two steps, not
one, so a misclick is caught before it counts.

| Key | Does |
| --- | --- |
| <kbd>C</kbd> | correct |
| <kbd>X</kbd> | missed |
| <kbd>Space</kbd> | next speller |
| <kbd>U</kbd> | undo the last ruling |
| <kbd>S</kbd> | swap this word for another at the same difficulty |

**The scoreboard** (`app/scoreboard.html`) opens in a second window from the
**Open scoreboard** button. Share that one on the call. It shows the round, its
point value, who is spelling, who is next and the live standings - and after a
ruling it reveals the spelling, so a miss becomes a teaching moment. It never
receives the upcoming word: the pronouncer window pushes it a view model that
only ever contains words already ruled on.

Built in because a live game needs them:

- **Undo** steps back across the round boundary, so a misclick on the last
  speller of a round is still recoverable.
- **Swap** pulls a replacement from the same round's unused pool, so difficulty
  stays honest when a word turns out to be unpronounceable or already known.
- **A refresh does not lose the game.** State is saved after every action; the
  setup screen offers to resume.
- **The correct spelling is revealed on a miss**, on the shared scoreboard.
- **Ties are shown as ties**, sharing rank 1, with no tiebreaker.

## Tools

```bash
node tools/validate.mjs              # correctness + coverage against the 20-game target
node tools/review-sheet.mjs          # word list by round, for a fast difficulty scan
node tools/review-sheet.mjs --full   # every field, as the pronouncer will see it
node tools/test-game.mjs             # headless checks of the scoring and game rules
node tools/build-wordbank.mjs        # regenerate app/wordbank.js after a word change
node tools/smoke-test.mjs            # drives the real app in a browser (needs playwright)
```

**Change a word and the app will not see it until you rebuild.** `app/wordbank.js`
is generated; `data/words/*.json` stays the source of truth:

```bash
node tools/validate.mjs && node tools/build-wordbank.mjs
```

`validate.mjs` fails the build on anything that would embarrass you mid-game:

- missing or unknown fields, wrong tier for the file, bad part of speech
- a **definition that contains the word itself**, which hands over the spelling
- a sentence that never actually uses the word
- a respelling with no stressed syllable marked in caps
- any word duplicated across tiers, alternate spellings included

It also reports how many repeat-free games the current bank supports.

`test-game.mjs` covers the rules rather than the pixels: the points ladder, a
perfect game of 20, tie handling, undo across round boundaries, word swapping,
and - the one that actually matters - that twenty consecutive ten-player games
never repeat a single word. That last check exhausts all 1,600.

## Where the data lives

Everything is in the pronouncer's browser, under two `localStorage` keys.

| Key | Holds |
| --- | --- |
| `spellingbee.currentGame` | the game in progress, so a refresh recovers |
| `spellingbee.history` | which words have been used and in which game, plus a per-player summary of every finished game |

The per-player summary is not displayed anywhere yet. It is written now so that
the stats-over-time feature is a reporting job later, not a migration.

Because this is browser storage, the no-repeat history belongs to **one browser
on one machine** - the pronouncer's. Running the game from a different computer
starts that history over.
