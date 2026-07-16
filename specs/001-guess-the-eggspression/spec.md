# Feature Specification: Guess the Eggspression — Party Board Game

**Feature branch**: `001-guess-the-eggspression`
**Status**: Draft
**Created**: 2026-07-16

## Overview

A free, ad-free party game that runs entirely in the browser and is hosted on
GitHub Pages — no backend, no build step to serve. Two teams play together
looking at one shared **Display** screen (a TV or laptop everyone can see);
a **Host** (emcee) holds a private second screen showing the answer and a
controller for the round. Each round deals one word or short phrase
describing an emotion or action (e.g. "Nagagalit" / "angry", "Kumakain ng
icecream" / "eating ice cream"). The Host privately shows that word to
whichever player is acting for the round — that player must convey it using
**facial expression only** (no hands, no body, no props, no sound) while
their team shouts out guesses. The Host taps which team got it right. No
typing, no per-player devices, no visual clue on the shared Display beyond
letter-hint tiles — the performance itself is the only clue.

This is a close sibling of `icon-guess-the-word` (Emoji Says), with the icon
clue removed entirely: where that game shows 2-4 icons to everyone as the
clue, here there is deliberately **no visual clue shown to the guessing
team** — the acting is the clue, and only the Host/actor ever sees the
answer text.

## User Stories

### US-1: Set up a game (host)
As a host, I want to pick which categories to play and whether letter hints
are available, so the game fits my group and how much challenge they want.

**Acceptance criteria**
- Can pick a **language** — Tagalog or English — before picking categories.
  A game session commits to one language track; the two are never mixed
  into the same deck. Switching languages resets the category selection to
  "all categories in the newly chosen language" rather than carrying over a
  selection that no longer applies.
- Can select one or more built-in categories *within the chosen language*;
  at least one must be selected to start. Entries from every selected
  category are combined into one deck and grouped by difficulty tier
  (easy → medium → hard) *across* all chosen categories, shuffled within
  each tier.
- The English track is an independently authored, equivalent-sized set (not
  a translation of the Tagalog one) — direct translation would flatten
  culturally specific phrases like "Nagtatampo" (sulking in a
  relationship-specific way that has no single-word English equivalent).
- Can rename the two teams (default "Team A" / "Team B").
- Can toggle **Letter Hints** on or off for the whole game at setup time.
  When off, no hint control appears anywhere in the game.
- Can set a **Time per Round** limit (Off, 15/30/45/60/90/120 seconds) at
  setup time. When Off, no timer UI appears anywhere.
- Can set a **Target Score** (Off/"play through the deck", or First to
  3/5/7/10/15) at setup time. When set, the first team to reach that score
  wins immediately. When off (the default), the deck runs out and the
  higher score wins (a tie is a draw).
- Setup choices are made once, before the room opens; no mid-game category
  switching (see Non-goals).

### US-2: Play a round (acted, host-judged, no visual clue)
As a host running the game, I want to privately show the word to the
current actor, optionally give letter hints to the guessing team, and award
the point to whichever team answers first, so the group can just play
without anyone typing or seeing the answer early.

**Acceptance criteria**
- The Display always shows: blank letter-slot tiles (word/phrase length
  indicator, grouped per word with a gap for multi-word answers), the
  category name, both team scores fixed in the top-left (Team A) and
  top-right (Team B) corners, and the round timer if one is configured.
  It never shows the word itself, nor any picture/icon clue — there isn't
  one. This is a stricter redaction than `icon-guess-the-word`, which does
  show an icon clue to everyone.
- The Host screen shows everything the Display shows, **plus** the full
  answer spelled out (this is what the Host privately shows to the current
  actor — handing them the phone, or turning the screen away from the rest
  of the room), and the round controls.
- The current actor conveys the word using **facial expression only** —
  this is a physical-room rule the app doesn't enforce in software (there's
  no camera, no gesture detection), the same way `icon-guess-the-word`
  doesn't enforce "no typing enforced" — it's communicated via the How to
  Play instructions and trusted to the group.
- If Letter Hints is on, the Host has a **Reveal a Letter** control that
  fills in one random remaining blank slot on both screens (not left to
  right, so the first word of a multi-word answer isn't predictably given
  away first). Spaces in multi-word answers are always shown and never
  count as a blank slot.
- The Host has two big buttons, **Team A got it** / **Team B got it** —
  tapping one scores a point for that team and deals the next round.
- The Host has a **Skip** control — deals the next round with no point
  awarded (for an expression nobody can get, or the actor can't convey).
- Rounds are never repeated within a game. When the deck is exhausted, the
  game ends and shows the final score and winner (a tie is a draw).

### US-2a: Timed rounds (optional)
Same shape as `icon-guess-the-word`'s US-2a: a per-round countdown that
starts paused at the full duration, the Host taps **Start Timer** once the
next actor is ready, and time running out auto-skips the round (no point
awarded) with the next round's timer paused again. The countdown is
visually urgent in the last 10 seconds. Unlike `icon-guess-the-word`, there
is no "blurred until timer starts" behavior on the Display, since there was
never a visual clue there to blur in the first place — the Display's tiles
are just always blank-until-hinted regardless of timer state.

### US-2b: Race to a target score (optional)
Same shape as `icon-guess-the-word`'s US-2b: if a Target Score is set, the
moment a team's score reaches it, the game ends immediately with that team
as the winner. Both screens show a small "First to N" indicator whenever a
target is set. Off by default.

### US-3: One Host, one Display, one room
As a host, I want my controller screen and the shared TV/laptop screen to
show the same live game, so I don't need anyone else's phone.

**Acceptance criteria**
- Setup is completed first; only then does the Host tap **Start Room**,
  which opens the room and shows a short, human-friendly code.
- The Display device joins by typing in the code — peer-to-peer WebRTC via
  the public PeerJS broker, the same approach already proven in
  `icon-guess-the-word`/`timed-wordy`.
- Only the Host device can act (reveal a letter, award a point, skip). The
  Display is a pure render target and never sends actions.
- The Display never receives the answer over the network, not just hides it
  in the UI: the Host sends a redacted snapshot (answer field stripped) to
  the room, and renders the full answer only in its own local view. Since
  there's no icon field at all here, the redacted snapshot is even smaller
  than `icon-guess-the-word`'s.
- If the room service is unreachable, the app says so in plain language.
  This game has **no meaningful single-device mode** — the Host screen
  shows the answer to the current actor, so it can't double as the shared
  Display, and unlike a guess-the-word game there's no sensible solo
  variant either (you can't act a facial expression out for yourself to
  guess). A working room is a real requirement of play.

## Functional Requirements

- **FR-1** Static site only: must run from GitHub Pages (no backend, no
  build step required to serve).
- **FR-2** Game logic must be a pure, testable module (no DOM reads/writes
  inside the rules).
- **FR-3** Host-authoritative networking: only the Host mutates state; the
  Display renders whatever snapshot it last received.
- **FR-4** No in-game currency or lives — score is the only
  persistent-within-a-game number. The optional per-round timer is a pacing
  tool the Host controls, not an automated judge.
- **FR-5** Mobile-first UI with large tap targets on the Host screen; the
  Display screen is optimized for being read from across a room (big letter
  tiles, big score plaques).
- **FR-6** No ads, no analytics, no tracking.

## Non-goals

- No per-player devices or digital keyboard/typing input — answers are
  spoken aloud and judged by the Host.
- No visual clue of any kind on the Display (no icons, no images) — the
  live performance is the only clue. This is the one deliberate deviation
  from `icon-guess-the-word`'s shape.
- No hint "coins" or spendable in-game currency — Letter Hints is a single
  on/off setting for the whole game, chosen at setup.
- No mid-game category switching.
- No accounts, matchmaking, or cross-room/cross-game history.
- No lives/elimination mechanic.
- No solo/single-device mode (see US-3) — this game structurally requires a
  Host and at least one actor who isn't the Host, so a lone-player mode
  doesn't make sense the way it does for a straight guess-the-word game.

## Key Entities

- **Settings**: language, selected category ids (within that language),
  hints-enabled flag, timer seconds (0/null = off), target score (0/null =
  off), team names.
- **Team**: id, name, score.
- **Entry**: answer (the word/phrase to act out), category id, difficulty,
  revealed-letter indexes. No icon/image field — see Non-goals.
- **Game**: phase (`lobby → playing → gameover`), teams, deck (shuffled
  entries from selected categories, easy → hard across categories), entry
  index, hints-enabled flag, timer seconds, timer status (`paused` |
  `running`), timer deadline (absolute epoch ms, set only while running),
  target score (0/null = play through the whole deck instead).
- **Category**: id, name, **language** (`tagalog` | `english`), list of
  entries; built-in only (no custom categories in this version).
- **Room**: 4-letter code, host peer connection, display connection(s).
