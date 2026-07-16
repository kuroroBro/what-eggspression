# 🐣 Guess the Eggspression

A free, ad-free Filipino party game that runs entirely in your browser and
deploys to GitHub Pages. Cards give a word or phrase describing an emotion
or reaction — one player from the acting team acts it out using **only
their face** (no hands, no body, no props, no sounds) while their team
shouts out guesses. The Host judges. No typing, no accounts, no in-game
currency.

## How to play

1. **Host a Game** — pick a language (Tagalog or English), your categories,
   name your two teams, choose whether Letter Hints are available, and
   optionally set a Time per Round limit. Tap **Start Room** to get a
   4-letter room code.
2. **Join as Display** — on the TV/laptop everyone can see, open this same
   page and enter the Host's room code.
3. **Start Game** — the Host taps Start once the Display is connected. Each
   round, the Host privately shows the word to whoever is acting — pass the
   phone to them, or turn the screen away from the group.
4. **Face only** — the actor conveys the word using facial expression
   alone. Their team shouts out guesses. The Display never shows the word
   or any picture — just blank letter tiles, the category, the timer, and
   both scores.
5. The Host taps **Team A got it** / **Team B got it** to award the point
   and deal the next round, or **Skip** if nobody can get it. If Letter
   Hints are on, the Host can **Reveal a Letter** at any time. If a timer is
   set, the Host taps **Start Timer** when the next actor is ready — time
   running out auto-skips the round (no point awarded) and the next one
   waits, paused, until Start Timer is tapped again.
6. The game ends when the deck runs out — highest score wins (a tie is a
   draw).

A working room is required to play: the Host screen shows the answer, so it
can't double as the shared Display. There's also no single-device solo
mode — the acting mechanic needs a Host who knows the answer *and* a
separate actor performing it, so there's no way to be your own actor and
your own guesser.

## Categories

Two independent language tracks — a game session picks one, they're never
mixed. The English set is its own independently-authored set of
expressions, not a translation of the Tagalog one.

- **🇵🇭 Tagalog**: Damdamin (Emotions) · Ginagawa (Actions)
- **🇺🇸 English**: Emotions · Reactions

~17-18 entries per category, easy → hard.

## Deploying to GitHub Pages

The site is fully static — no build step.

1. In the repository, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
2. Push to `main`. The [deploy workflow](.github/workflows/deploy.yml) runs
   the engine tests and publishes the site to
   `https://<user>.github.io/<repo>/`.

## Local development

```bash
python3 -m http.server 8000   # any static server works
# open http://localhost:8000
node --test tests/game.test.mjs   # rules-engine unit tests
```

## Design docs (SDD)

This project was built spec-first. See
[`specs/001-guess-the-eggspression/`](specs/001-guess-the-eggspression/):
[spec.md](specs/001-guess-the-eggspression/spec.md) (what & why) →
[plan.md](specs/001-guess-the-eggspression/plan.md) (architecture &
decisions) → [tasks.md](specs/001-guess-the-eggspression/tasks.md) (work
breakdown).

The engine and networking model are directly adapted from the sibling
project
[`icon-guess-the-word`](https://github.com/kuroroBro/icon-guess-the-word)
("Emoji Says"), with the icon clue removed since the live facial
performance is the only clue here.
