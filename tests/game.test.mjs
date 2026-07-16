import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PHASE, TIMER_STATUS, createGame, startGame, revealLetter, awardPoint, skipPuzzle,
  maskedAnswer, startTimer, checkTimerExpired, timerRemainingMs,
} from '../js/game.js';

const rng = () => 0.5; // deterministic shuffles

const POOL = [
  {
    id: 'emotions',
    name: 'Emotions',
    puzzles: [
      { answer: 'ANGRY', difficulty: 'easy' },
      { answer: 'SLEEPY', difficulty: 'easy' },
      { answer: 'IN LOVE', difficulty: 'medium' },
    ],
  },
  {
    id: 'reactions',
    name: 'Reactions',
    puzzles: [
      { answer: 'BRAIN FREEZE', difficulty: 'hard' },
    ],
  },
];

function freshGame(overrides = {}) {
  return createGame(
    { categoryIds: ['emotions', 'reactions'], hintsEnabled: true, ...overrides },
    POOL,
    rng,
  );
}

test('createGame builds a deck ordered easy -> medium -> hard across categories', () => {
  const state = freshGame();
  assert.equal(state.phase, PHASE.LOBBY);
  assert.equal(state.deck.length, 4);
  assert.equal(state.deck[0].difficulty, 'easy');
  assert.equal(state.deck[1].difficulty, 'easy');
  assert.equal(state.deck[2].difficulty, 'medium');
  assert.equal(state.deck[3].difficulty, 'hard');
});

test('createGame only includes puzzles from selected categories', () => {
  const state = freshGame({ categoryIds: ['reactions'] });
  assert.equal(state.deck.length, 1);
  assert.equal(state.deck[0].answer, 'BRAIN FREEZE');
});

test('startGame requires the lobby phase and a non-empty deck', () => {
  const empty = freshGame({ categoryIds: [] });
  assert.equal(startGame(empty), false);

  const state = freshGame();
  assert.equal(startGame(state), true);
  assert.equal(state.phase, PHASE.PLAYING);
  assert.ok(state.puzzle);
  assert.equal(startGame(state), false); // no longer in lobby
});

test('revealLetter is a no-op when hints are disabled', () => {
  const state = freshGame({ hintsEnabled: false });
  startGame(state);
  assert.equal(revealLetter(state), false);
  assert.equal(state.puzzle.revealedIndexes.length, 0);
});

test('revealLetter picks a random blank via the provided rng, never a space', () => {
  const state = freshGame();
  startGame(state);
  awardPoint(state, 'a'); // ANGRY
  awardPoint(state, 'a'); // SLEEPY
  assert.equal(state.puzzle.answer, 'IN LOVE');
  // indices: 0 I,1 N,2 ' ',3 L,4 O,5 V,6 E
  // blank candidates (spaces excluded): [0,1,3,4,5,6]
  const rng = () => 0.999; // always picks the last candidate in the list
  assert.equal(revealLetter(state, rng), true);
  assert.deepEqual(state.puzzle.revealedIndexes, [6]); // last letter, 'E'
  assert.equal(revealLetter(state, rng), true);
  assert.deepEqual(state.puzzle.revealedIndexes, [6, 5]); // next remaining candidate, 'V'
});

test('revealLetter (default rng) never reveals a space and eventually reveals every letter once', () => {
  const state = freshGame();
  startGame(state);
  awardPoint(state, 'a');
  awardPoint(state, 'a'); // now on IN LOVE
  const letterIndexes = [0, 1, 3, 4, 5, 6];
  for (let i = 0; i < letterIndexes.length; i++) {
    assert.equal(revealLetter(state), true);
  }
  const sorted = [...state.puzzle.revealedIndexes].sort((a, b) => a - b);
  assert.deepEqual(sorted, letterIndexes);
  assert.equal(revealLetter(state), false); // fully revealed
});

test('revealLetter stops (returns false) once the word is fully revealed', () => {
  const state = freshGame({ categoryIds: ['reactions'] });
  startGame(state);
  const letters = 'BRAIN FREEZE'.replace(' ', '').length;
  for (let i = 0; i < letters; i++) {
    assert.equal(revealLetter(state), true);
  }
  assert.equal(revealLetter(state), false);
});

test('maskedAnswer hides unrevealed letters, always shows spaces', () => {
  const state = freshGame();
  startGame(state);
  awardPoint(state, 'a');
  awardPoint(state, 'a');
  assert.equal(state.puzzle.answer, 'IN LOVE');
  revealLetter(state, () => 0); // deterministic: picks the first blank candidate, index 0 ('I')
  const masked = maskedAnswer(state.puzzle);
  assert.equal(masked[0].char, 'I');
  assert.equal(masked[1].char, null);
  assert.equal(masked[2].isSpace, true);
  assert.equal(masked[2].char, ' ');
});

test('awardPoint scores a team and deals the next puzzle', () => {
  const state = freshGame();
  startGame(state);
  const first = state.puzzle.answer;
  assert.equal(awardPoint(state, 'a'), true);
  assert.equal(state.teams.a.score, 1);
  assert.notEqual(state.puzzle.answer, first);
});

test('awardPoint rejects an unknown team id', () => {
  const state = freshGame();
  startGame(state);
  assert.equal(awardPoint(state, 'c'), false);
  assert.equal(state.teams.a.score, 0);
  assert.equal(state.teams.b.score, 0);
});

test('skipPuzzle deals the next puzzle with no score change', () => {
  const state = freshGame();
  startGame(state);
  assert.equal(skipPuzzle(state), true);
  assert.equal(state.teams.a.score, 0);
  assert.equal(state.teams.b.score, 0);
  assert.equal(state.puzzleIndex, 1);
});

test('deck exhaustion ends the game and picks a winner by score', () => {
  const state = freshGame({ categoryIds: ['reactions'] }); // 1-puzzle deck
  startGame(state);
  assert.equal(awardPoint(state, 'a'), true);
  assert.equal(state.phase, PHASE.GAMEOVER);
  assert.equal(state.winner, 'a');
  assert.equal(state.puzzle, null);
  // further actions are rejected once the game is over
  assert.equal(awardPoint(state, 'a'), false);
  assert.equal(revealLetter(state), false);
  assert.equal(skipPuzzle(state), false);
});

test('deck exhaustion is a draw when scores are tied', () => {
  const state = freshGame({ categoryIds: ['reactions'] });
  startGame(state);
  skipPuzzle(state); // no score change, deck now exhausted
  assert.equal(state.phase, PHASE.GAMEOVER);
  assert.equal(state.winner, null);
});

test('puzzles are never repeated within a game', () => {
  const state = freshGame();
  startGame(state);
  const seen = new Set();
  while (state.phase === PHASE.PLAYING) {
    const answer = state.puzzle.answer;
    assert.equal(seen.has(answer), false);
    seen.add(answer);
    skipPuzzle(state);
  }
  assert.equal(seen.size, 4);
});

test('timer is disabled by default (no timerSeconds) and stays paused', () => {
  const state = freshGame();
  startGame(state);
  assert.equal(state.timerSeconds, null);
  assert.equal(startTimer(state, 0), false);
  assert.equal(state.timerStatus, TIMER_STATUS.PAUSED);
  assert.equal(timerRemainingMs(state, 0), 0);
});

test('startTimer sets an absolute deadline and can only be started once', () => {
  const state = freshGame({ timerSeconds: 30 });
  startGame(state);
  assert.equal(startTimer(state, 1000), true);
  assert.equal(state.timerStatus, TIMER_STATUS.RUNNING);
  assert.equal(state.timerDeadline, 31_000);
  assert.equal(startTimer(state, 2000), false); // already running
  assert.equal(timerRemainingMs(state, 11_000), 20_000);
});

test('timerRemainingMs shows the full duration while paused', () => {
  const state = freshGame({ timerSeconds: 45 });
  startGame(state);
  assert.equal(state.timerStatus, TIMER_STATUS.PAUSED);
  assert.equal(timerRemainingMs(state, 999_999), 45_000);
});

test('checkTimerExpired auto-skips (no score change) and leaves the next puzzle paused', () => {
  const state = freshGame({ timerSeconds: 30 });
  startGame(state);
  const firstAnswer = state.puzzle.answer;
  startTimer(state, 0);
  assert.equal(checkTimerExpired(state, 29_000), false); // not yet
  assert.equal(checkTimerExpired(state, 30_000), true); // due
  assert.notEqual(state.puzzle.answer, firstAnswer);
  assert.equal(state.teams.a.score, 0);
  assert.equal(state.teams.b.score, 0);
  assert.equal(state.timerStatus, TIMER_STATUS.PAUSED); // waiting for the Host again
  assert.equal(state.timerDeadline, null);
});

test('awardPoint and skipPuzzle also reset the next puzzle to a paused timer', () => {
  const state = freshGame({ timerSeconds: 30 });
  startGame(state);
  startTimer(state, 0);
  awardPoint(state, 'a');
  assert.equal(state.timerStatus, TIMER_STATUS.PAUSED);
  startTimer(state, 5000);
  skipPuzzle(state);
  assert.equal(state.timerStatus, TIMER_STATUS.PAUSED);
});

test('timer expiring right at deck exhaustion still ends the game', () => {
  const state = freshGame({ categoryIds: ['reactions'], timerSeconds: 10 });
  startGame(state);
  startTimer(state, 0);
  assert.equal(checkTimerExpired(state, 10_000), true);
  assert.equal(state.phase, PHASE.GAMEOVER);
});

test('no targetScore by default — plays through the whole deck', () => {
  const state = freshGame();
  assert.equal(state.targetScore, null);
});

test('reaching targetScore ends the game instantly with that team as winner', () => {
  const state = freshGame({ targetScore: 2 });
  startGame(state);
  assert.equal(awardPoint(state, 'a'), true);
  assert.equal(state.phase, PHASE.PLAYING); // 1 point, not there yet
  assert.equal(awardPoint(state, 'a'), true);
  assert.equal(state.phase, PHASE.GAMEOVER); // hit the target
  assert.equal(state.winner, 'a');
  assert.equal(state.teams.a.score, 2);
});

test('targetScore win never leaves it a draw, even if reached exactly', () => {
  const state = freshGame({ targetScore: 1 });
  startGame(state);
  awardPoint(state, 'b');
  assert.equal(state.phase, PHASE.GAMEOVER);
  assert.equal(state.winner, 'b'); // not null/draw, despite a.score === 0 !== b.score being the only difference
});

test('targetScore does not fire early and deck exhaustion still works when nobody reaches it', () => {
  const state = freshGame({ categoryIds: ['reactions'], targetScore: 99 });
  startGame(state);
  assert.equal(awardPoint(state, 'a'), true); // only 1 puzzle in this deck
  assert.equal(state.phase, PHASE.GAMEOVER); // deck exhausted, not target reached
  assert.equal(state.teams.a.score, 1);
  assert.equal(state.winner, 'a'); // decided by score comparison, not the target
});
