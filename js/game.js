// Pure rules engine for Guess the Eggspression. No DOM, no network — same
// convention as every sibling game. Structurally a direct copy of
// icon-guess-the-word's engine (see plan.md Decision #1) with one
// difference: puzzle entries never carry an icon/image field, and nothing
// here ever reads one — the clue is a live facial-expression performance,
// not anything the engine renders. `startTimer`/`checkTimerExpired` take
// `now` (epoch ms) so the engine stays unit-testable with fake time.

export const PHASE = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
};

export const TIMER_STATUS = {
  PAUSED: 'paused',   // not counting down — waiting for the Host to start it
  RUNNING: 'running',
};

const DIFFICULTY_TIERS = ['easy', 'medium', 'hard'];

function shuffle(arr, rng = Math.random) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Combine puzzles from every selected category into one deck, grouped by
// difficulty tier *across* all selected categories (not grouped by
// category), shuffled within each tier.
function buildDeck(categoryIds, categoryPool, rng) {
  const selected = categoryPool.filter((c) => categoryIds.includes(c.id));
  const byTier = { easy: [], medium: [], hard: [] };
  for (const category of selected) {
    for (const puzzle of category.puzzles) {
      const tier = byTier[puzzle.difficulty] ? puzzle.difficulty : 'easy';
      byTier[tier].push({ ...puzzle, categoryId: category.id });
    }
  }
  return DIFFICULTY_TIERS.flatMap((tier) => shuffle(byTier[tier], rng));
}

export function createGame(settings, categoryPool, rng = Math.random) {
  return {
    phase: PHASE.LOBBY,
    hintsEnabled: settings.hintsEnabled ?? false,
    // null/0 = timer disabled entirely (no timer UI, no auto-skip).
    timerSeconds: settings.timerSeconds || null,
    timerStatus: TIMER_STATUS.PAUSED,
    timerDeadline: null,
    // null/0 = no target — play through the whole deck. Otherwise the
    // first team to reach this score wins instantly.
    targetScore: settings.targetScore || null,
    teams: {
      a: { id: 'a', name: settings.teamNames?.a || 'Team A', score: 0 },
      b: { id: 'b', name: settings.teamNames?.b || 'Team B', score: 0 },
    },
    deck: buildDeck(settings.categoryIds ?? [], categoryPool, rng),
    puzzleIndex: -1,
    puzzle: null,
    winner: null,
  };
}

// Copies deck[puzzleIndex] into state.puzzle with a fresh revealedIndexes
// list, or ends the game if the deck is exhausted. Returns false if the
// game ended (deck exhausted), true if a puzzle was dealt. Every puzzle
// transition — award, skip, or timer expiry — goes through here, so every
// new puzzle always starts with its timer paused, never running: the Host
// decides when the clock actually starts for the next round.
function dealPuzzle(state) {
  state.puzzleIndex += 1;
  const next = state.deck[state.puzzleIndex];
  state.timerStatus = TIMER_STATUS.PAUSED;
  state.timerDeadline = null;
  if (!next) {
    endGame(state);
    return false;
  }
  state.puzzle = { ...next, revealedIndexes: [] };
  return true;
}

// `explicitWinner` is used for a target-score win, where the team that just
// scored is unambiguously the winner — no need to compare totals. Without
// it (deck exhaustion), the winner is decided by comparing scores, with a
// tie counting as a draw (`null`).
function endGame(state, explicitWinner) {
  if (explicitWinner !== undefined) {
    state.winner = explicitWinner;
  } else {
    const { a, b } = state.teams;
    state.winner = a.score === b.score ? null : a.score > b.score ? 'a' : 'b';
  }
  state.puzzle = null;
  state.phase = PHASE.GAMEOVER;
}

export function startGame(state) {
  if (state.phase !== PHASE.LOBBY) return false;
  if (state.deck.length === 0) return false;
  state.phase = PHASE.PLAYING;
  dealPuzzle(state);
  return true;
}

// Reveals one random blank letter (not left-to-right — a fixed order made
// short/early letters too predictable, e.g. always giving away word 1 of a
// multi-word answer first). Spaces are never blank slots to begin with, so
// they're excluded from the candidate list. A no-op (returns false) when
// hints are off, outside PLAYING, or the word is already fully revealed —
// deliberately not an error, so the UI never needs to special-case a
// disabled control.
export function revealLetter(state, rng = Math.random) {
  if (state.phase !== PHASE.PLAYING || !state.hintsEnabled) return false;
  const { answer, revealedIndexes } = state.puzzle;
  const blanks = [];
  for (let i = 0; i < answer.length; i++) {
    if (answer[i] === ' ') continue;
    if (!revealedIndexes.includes(i)) blanks.push(i);
  }
  if (blanks.length === 0) return false; // fully revealed already
  const pick = blanks[Math.floor(rng() * blanks.length)];
  revealedIndexes.push(pick);
  return true;
}

export function awardPoint(state, teamId) {
  if (state.phase !== PHASE.PLAYING) return false;
  if (!state.teams[teamId]) return false;
  state.teams[teamId].score += 1;
  if (state.targetScore && state.teams[teamId].score >= state.targetScore) {
    endGame(state, teamId); // reaching the target wins outright, no draw possible
    return true;
  }
  dealPuzzle(state);
  return true;
}

export function skipPuzzle(state) {
  if (state.phase !== PHASE.PLAYING) return false;
  dealPuzzle(state);
  return true;
}

// Starts (or restarts) the countdown for the current puzzle. A no-op if
// there's no timer configured for this game, outside PLAYING, or already
// running — deliberately not an error, same convention as revealLetter.
export function startTimer(state, now) {
  if (state.phase !== PHASE.PLAYING) return false;
  if (!state.timerSeconds) return false;
  if (state.timerStatus === TIMER_STATUS.RUNNING) return false;
  state.timerDeadline = now + state.timerSeconds * 1000;
  state.timerStatus = TIMER_STATUS.RUNNING;
  return true;
}

// Call this periodically (e.g. every 200ms) from the Host's own clock only.
// If the deadline has passed, auto-skips to the next puzzle (no score
// change) and leaves its timer paused, waiting for the Host to start it
// again. Returns true if a skip just happened (the caller should re-render
// and re-broadcast).
export function checkTimerExpired(state, now) {
  if (state.phase !== PHASE.PLAYING) return false;
  if (state.timerStatus !== TIMER_STATUS.RUNNING) return false;
  if (now < state.timerDeadline) return false;
  dealPuzzle(state);
  return true;
}

// Milliseconds left to show on screen. Full duration while paused (so the
// Host/Display see the configured length before it starts), 0 if no timer.
export function timerRemainingMs(state, now) {
  if (!state.timerSeconds) return 0;
  if (state.timerStatus !== TIMER_STATUS.RUNNING) return state.timerSeconds * 1000;
  return Math.max(0, state.timerDeadline - now);
}

// Letter-slot view of the current puzzle's answer: one entry per character,
// spaces always shown, letters shown only once revealed. Used by both the
// Host's own render and (via room.js) the redacted snapshot sent to the
// Display — this is the one place that decides what a blank tile looks
// like.
export function maskedAnswer(puzzle) {
  if (!puzzle) return [];
  return puzzle.answer.split('').map((char, i) => ({
    char: char === ' ' ? ' ' : puzzle.revealedIndexes.includes(i) ? char : null,
    isSpace: char === ' ',
  }));
}
