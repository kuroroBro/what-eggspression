# Tasks: Guess the Eggspression — Party Board Game

**Plan**: [plan.md](./plan.md)

## Phase 1 — Rules engine

- [x] `js/game.js` — state factory + pure functions (`createGame`,
  `startGame`, `revealLetter`, `awardPoint`, `skipPuzzle`, `startTimer`,
  `checkTimerExpired`, `timerRemainingMs`, `maskedAnswer`), no icon field
  anywhere.
- [x] `tests/game.test.mjs` — full coverage of the above, `node --test`.

## Phase 2 — Content

- [x] `js/categories.js` — 2 Tagalog categories + 2 English categories of
  emotion/action phrases, difficulty-tiered, no icons/images.

## Phase 3 — Single-device UI (no networking yet)

- [x] `index.html` — home, how-to-play dialog, setup, host lobby, host
  control panel, display, game over screens.
- [x] `css/styles.css` — warm egg/chick theme, adapted from
  `icon-guess-the-word`'s structure minus icon-row/blur rules.
- [x] `js/storage.js` — settings + used-entry tracking in localStorage.
- [x] `js/main.js` — host-only wiring first (playable hot-seat with one
  device before adding the Display/network layer).

## Phase 4 — Networking

- [x] `js/room.js` — vendored/adapted from `icon-guess-the-word`, `eggspress-room-` PeerJS ID prefix.
- [x] `js/main.js` — Display join flow, `redactState`, clock-offset timer
  sync, host action broadcasting.

## Phase 5 — Deploy

- [x] `.github/workflows/deploy.yml` + `.nojekyll`.
- [ ] Verify the live Pages URL actually serves the current build (blocked
  on first push to `main` — do after initial commit/push).

## Phase 6 — Custom art

- [x] Generate chick-in-eggshell hero image (`image-gen` skill), optimize,
  wire into `#screen-home` background.

## Open backlog (intentionally deferred)

- A portfolio card on `gondoit.work` — separate follow-up task in that repo,
  not part of this build (see plan.md's Custom art note and the skill's own
  guidance not to assume this is wanted).
- Solo mode — explicitly out of scope, not deferred (see plan.md Decision
  #3 and spec.md Non-goals) — do not add later without re-confirming the
  mechanic makes sense.
