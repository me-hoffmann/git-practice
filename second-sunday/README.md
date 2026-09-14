# Second Sunday

The ritual layer. Not an app — a named, dated occasion with a kit behind it.

`playbook.html` is the organizer-facing kit. This file is the reasoning behind it.

## Why a ritual and not another activity

The funnel for a family actually connecting looks like this:

1. Family is distributed and drifting — huge population
2. Someone decides to do something about it — **catastrophic drop-off**
3. They find or build an activity — moderate friction
4. They run it — moderate friction
5. It goes well — variable
6. **They do it again** — the actual win

Building activities attacks step 3. That is the right place to attack
commercially, because anyone who reaches step 3 has declared intent. It is the
wrong place to attack for reach, because step 2 is where the families are lost.

Step 2 is not an effort problem. It is a social-risk problem: proposing a family
game night makes you the weird earnest one, and if it flops it is your fault.
What defeats that is a named ritual — Secret Santa, Friendsgiving, Advent
calendars, the Great Thanksgiving Listen. Nobody *proposed* those. You just do
the thing that already exists.

So the product is the ritual. The software is the kit.

## The design decisions

**The name encodes the schedule.** "Second Sunday" is simultaneously the name
and the date, so the date never needs deciding. This removes the single most
reliable killer of recurring family events: the monthly rescheduling
negotiation, which requires one person to campaign every month until they quit.

**One hour, hard stop.** End while people still want more.

**The winner picks and runs the next one.** The load-bearing mechanic. It
manufactures a new organizer every month, which is a direct attack on step 2 —
the binding constraint. It also means the ritual survives its founder losing
interest, which is the main way a thing like this dies.

**The Cup scoring favors attendance over skill.** Show up 3, play 2, win 4, run
it 5. Twelve months of attendance is 60 points; winning six nights and missing
six is 54. Running the night is worth more than winning it. The incentive says
what the ritual is for.

**No make-ups, no rescheduling, run it with three people.** Cancelling once
teaches everyone it is cancellable.

## Why reliability beats personalization here

A bad first run is not neutral — it is damage. A family that tries this once and
finds it awkward says "we tried that" for the next decade. That argues for a
small number of hand-tuned engines over a generator with variable output, at
least until first-run quality is proven. Generation belongs in slots where it
cannot produce garbage (family trivia where the family supplies the answers),
not in slots where it can (model-invented facts).

## The experiment

- **Month 1** — Mike runs it. Spelling bee, since it exists. Proves nothing.
- **Month 2** — the winner runs it. **This is the whole test.** If Mike runs
  month 2, the handoff mechanic failed, which is the most useful available
  finding.
- **Month 3** — it happens without Mike scheduling it. Then it is a ritual.

Then the only number that counts: how many families Mike is not related to run a
**second** one. Target: 25 families run one by March, 10 run a second.

## What would falsify this

- Organizers won't adopt a name/date they didn't invent — the ritual framing
  fails and it's back to being a tool.
- The handoff doesn't hold; every month needs the same person.
- Families run one and never a second. No cadence at any price.
- Families feel unique but behave identically — everyone wants the same five
  activities. Bad commercial news, excellent mission news: one small superb
  catalog would serve everyone.

## Next

Layer 2 (engines) — pull the host runtime out of `spelling-bee/` so turn order,
scoring, the screen-share board and lifelines are shared, and a second engine
costs days instead of weeks.

Layer 3 (the record) — what accumulates across years, and the reason month
thirty beats month one.
