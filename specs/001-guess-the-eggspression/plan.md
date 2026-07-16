# Implementation Plan: Guess the Eggspression — Party Board Game

**Spec**: [spec.md](./spec.md)

## Technical Context

| Aspect | Choice | Why |
| --- | --- | --- |
| Language | Vanilla ES2020 modules (HTML/CSS/JS) | GitHub Pages serves static files; no build step means the repo *is* the deployable artifact — same call every sibling game makes. |
| Framework | None | The app is one state machine + one render function per screen role; a framework adds weight for no benefit at this size. |
| Realtime | [PeerJS](https://peerjs.com/) over WebRTC data channels, vendored in `vendor/` | GitHub Pages cannot host a WebSocket server. PeerJS's free public broker only handles signalling; game traffic is peer-to-peer. Directly reuses the pattern proven in `icon-guess-the-word`/`timed-wordy`. |
| Persistence | `localStorage` | Last-used settings only; no server. |
| Tests | `node --test` on the pure logic module | Zero-dependency; runs in CI and locally. |
| Deploy | GitHub Actions → `actions/deploy-pages` | Official Pages flow; deploys repo root on every push to `main`. |

## Architecture

```
index.html            shell + screens (home / setup / host-lobby / host-panel / display / gameover)
css/styles.css         warm egg/chick-themed visual style; separate Host (mobile-first) and Display (landscape/TV-first) layout contexts
js/game.js             PURE rules engine (no DOM)
js/categories.js       built-in categories & entries (answer, difficulty, language) — no icon/image field
js/room.js             PeerJS wrapper: host(code) / join(code), broadcast — adapted from icon-guess-the-word's room.js, distinct ID prefix
js/storage.js          last-used settings in localStorage
js/main.js             UI wiring, render loop, host action routing
tests/game.test.mjs    unit tests for game.js
.github/workflows/deploy.yml   Pages deployment
```

### Decision #1: Reuse icon-guess-the-word's engine shape verbatim, minus icons

`js/game.js` is a direct structural copy of `icon-guess-the-word`'s rules
engine (`createGame`, `startGame`, `revealLetter`, `awardPoint`,
`skipPuzzle`, `startTimer`, `checkTimerExpired`, `timerRemainingMs`,
`maskedAnswer`) — every function signature, guard-rail convention, and the
`now`-parameterized timer functions are unchanged. The only structural
difference: deck entries never carry an `icons` field, and nothing in the
engine ever reads one. This was a deliberate choice over inventing a new
shape: the two games share every mechanic (deck, difficulty tiers, hints,
timer, target score) except the clue itself, so there was nothing to
redesign at the rules layer.

### Decision #2: No visual clue on the Display, at all — not even blurred

`icon-guess-the-word` shows icons to everyone and only blurs them until the
timer starts. Here, the Display never receives anything about the answer
beyond `masked` letter tiles (see `redactState` in `js/main.js`) — there is
no icon/image field in the redacted snapshot to blur in the first place.
The `.icon-row`/`.icons-blurred` CSS and rendering machinery from the
sibling is dropped entirely rather than kept unused.

### Decision #3: No solo mode

Several sibling games (`word-scramble`, `icon-guess-the-word`, `image-rebus`,
`guess-antok-phrases`) have a single-device "Play Solo" mode where the lone
player types a guess that's auto-validated. That doesn't translate here —
the core loop requires a Host who knows the answer *and* a separate actor
performing it for teammates who don't. There's no way to be your own actor
and your own guesser. Solo mode is explicitly out of scope (see spec.md
Non-goals), not deferred.

### Deck construction

Combine entries from every selected category into one array, then sort by
difficulty tier (`easy` → `medium` → `hard`) *across all selected
categories*, with a shuffle within each tier — identical to
`icon-guess-the-word`'s `buildDeck`.

### Networking model

Identical to `icon-guess-the-word`: host-authoritative, `room.js` vendored
from that project with `ID_PREFIX = 'eggspress-room-'` (distinct from every
other sibling game's prefix so rooms never collide on the shared public
PeerJS broker). `redactState` in `main.js` strips `answer` before every
broadcast; the Display only ever receives `masked` (already-revealed
letters only) plus category id, phase, teams, timer fields, and winner.

### Custom art

One generated asset: a newly hatched chick still partly in its eggshell,
wacky/exaggerated facial expression, used as the home screen hero
background (`images/home-bg.jpg`, matching the sibling games' hero-image
convention) — both because it fits the "eggspression" pun literally and
because it visually cues the facial-expression-acting mechanic before a
player reads a word of copy.

## Changelog

- **v1** (2026-07-16): Initial build — bilingual (Tagalog/English) categories
  of emotions and actions to act out via facial expression only, Host +
  Display over PeerJS, optional timer/hints/target score, no solo mode
  (Decision #3), custom chick-in-eggshell hero art, GitHub Pages deploy,
  SDD docs.
