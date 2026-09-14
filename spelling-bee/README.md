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

## Levelling a mixed table

A group where half the room spells confidently and half does not has a problem
the final score does not describe: for the nervous half, every turn is a public
failure with no upside, and the escalating points make it worse by paying most
for the rounds they cannot win. Three options address the turn rather than the
scoreboard. All are on by default and each can be switched off.

**The speller picks the difficulty.** Before each word they choose a safer one
for a point less, the round's own word, or a harder one for two more. This is
the important one: it turns handicapping from something done *to* a player into
something they choose, so nobody is handed the easy words, and a nervous speller
can play safe all night without anyone remarking on it. It also gives the game
real strategy - someone four points down in round 8 can gamble.

| Round | Safe | Standard | Risky |
| --- | --- | --- | --- |
| 6 (3 points) | a round 4 word, 2 points | a round 6 word, 3 points | a round 8 word, 5 points |

Round 1 offers no safer word and round 8 no harder one, so those choices are
hidden rather than shown as dead options.

**Lifelines.** Three per player by default, spent on a first letter, a shout
from the table, or a pass to a different word at the same difficulty. Each kind
can be used once per word. Setting different allowances per player - four for
the least confident, two for the sharks - is a far softer handicap than
changing anyone's words, because it adjusts the support rather than the
challenge.

**Second chance.** A missed word becomes three spellings on the scoreboard, one
of them right, worth half the points rounded up. Almost nobody leaves a round
with nothing. The decoys are generated from the trap the word is built around,
so *separate* offers **seperate**, *occurrence* offers **occurrance**, and
*grammar* offers **gramar**.

Two further ideas need no code at all: play in **pairs**, entering the team as
one name, which removes the solo spotlight and halves the runtime; and hand out
**more than one award** at the end - biggest upset, best miss, most improved.

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
| Mixed-ability play | Speller-chosen difficulty, lifelines and a second chance, all optional |
| Variant spellings | American only. British forms are rejected by the validator |
| Round 1 floor | Confirmed at *rhythm* level - round 1 is not a freebie |

### Why storage is a day-one concern

The "no repeated words for at least 20 games" rule already requires persistent
history. Once that exists, adding per-player stats later is cheap - as long as
the schema anticipates it. So storage gets built properly up front even though
the stats UI ships later.

## Word bank

The word bank is the real work here, so it gets built and reviewed before the app.

A 10-player game consumes 80 words. In a classic game those come 10 from each
round's own tier, so twenty repeat-free games needs 200 per tier. Letting
spellers choose their difficulty keeps the total the same but moves the demand
around: a cautious table drains the easy rounds, a bold one drains the hard
ones. Two things absorb that.

- **Rounds cover for each other.** When a round's words run out the app draws
  from one or two rounds either side before it repeats anything. A slightly
  easier word is a far better substitute than a word somebody has already seen.
- **The low rounds are deepened.** Rounds 1 and 2 hold 260 and 240 words, since
  round 1 has nothing below it to borrow from and a nervous table leans on it
  hardest.

Measured over full simulated seasons at ten players:

| How the table plays | First repeated word |
| --- | --- |
| classic, no difficulty choice | none in 20 games |
| mixed - five cautious, five bold | game 18 |
| evenly split across all three | game 15 |
| everybody always plays safe | game 10 |
| everybody always gambles | game 8 |

The setup screen names the thinnest round and warns before it runs dry. Run
`node tools/validate.mjs` to see raw coverage per round.

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

A turn runs in up to three steps - choose a difficulty, spell, and if it is
missed, pick from three spellings. The keyboard follows whichever step is open:

| Key | Does |
| --- | --- |
| <kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> | choosing: pick the difficulty &nbsp;/&nbsp; second chance: the answer they called |
| <kbd>C</kbd> / <kbd>X</kbd> | correct / missed |
| <kbd>L</kbd> <kbd>T</kbd> <kbd>P</kbd> | spend a lifeline: letter, table, pass |
| <kbd>0</kbd> | skip the second chance |
| <kbd>Space</kbd> | next speller |
| <kbd>U</kbd> | undo the whole ruling on this word |

**The scoreboard** (`app/scoreboard.html`) opens in a second window from the
**Open scoreboard** button. Share that one on the call. It shows the round, its
point value, who is spelling, who is next and the live standings - and after a
ruling it reveals the spelling, so a miss becomes a teaching moment. It never
receives the upcoming word: the pronouncer window pushes it a view model that
only ever contains words already ruled on.

Built in because a live game needs them:

- **Undo** steps back across the round boundary, so a misclick on the last
  speller of a round is still recoverable.
- **Pass** pulls a replacement from the same difficulty, so a word that turns
  out to be unpronounceable or already known costs a lifeline rather than a turn.
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
