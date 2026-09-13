# Family Spelling Bee

A web app for running a family spelling bee over Zoom. One person runs the game
as the pronouncer; everyone else plays over the call.

Status: **word bank, batch 1 (calibration).** The app itself is not built yet.

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

### Why storage is a day-one concern

The "no repeated words for at least 20 games" rule already requires persistent
history. Once that exists, adding per-player stats later is cheap - as long as
the schema anticipates it. So storage gets built properly up front even though
the stats UI ships later.

## Word bank

The word bank is the real work here, so it gets built and reviewed before the app.

A 10-player game consumes **10 words per tier, 80 words per game**. Twenty
repeat-free games therefore needs **200 words per tier, 1,600 total**, and we
target more than that for headroom.

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
spelling - *eudaemonic* / *eudaimonic* / *eudemonic* being the case in point.
The app will warn the pronouncer before a dispute starts rather than after.

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
| 8 | 4 | Genuinely hard | eudaemonic |

## Tools

```bash
node tools/validate.mjs          # correctness + coverage against the 20-game target
node tools/review-sheet.mjs      # word list by round, for a fast difficulty scan
node tools/review-sheet.mjs --full   # every field, as the pronouncer will see it
```

`validate.mjs` fails the build on anything that would embarrass you mid-game:

- missing or unknown fields, wrong tier for the file, bad part of speech
- a **definition that contains the word itself**, which hands over the spelling
- a sentence that never actually uses the word
- a respelling with no stressed syllable marked in caps
- any word duplicated across tiers, alternate spellings included

It also reports how many repeat-free games the current bank supports.
