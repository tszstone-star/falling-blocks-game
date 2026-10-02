# MVP Product Specification

## Purpose

A single-player falling-block game that runs in a browser on a 10-column, 20-visible-row board.

## MVP scope (Phase 1)

- Falling pieces appear and descend automatically.
- Player controls move left, move right, move down, and rotate.
- Pieces lock when they can no longer descend.
- Complete horizontal lines clear.
- Score increases through line clears.
- Level and falling speed increase as the player progresses.
- A blocked spawn triggers game over.
- Restart begins a fresh game.
- Pause freezes gravity and gameplay input until resumed.
- A preview shows the next piece.
- A local high score persists through `localStorage`.

## V0.1 rules

- Board: 10 columns × 20 visible rows, no hidden rows. I/O/T/S/Z/J/L spawn at the top, horizontally centered by their square rotation box (I: 4, O: 2, others: 3).
- Randomizer: Fisher–Yates shuffled 7-bag; every bag contains each type once. One Next piece is shown.
- Controls: ArrowLeft/ArrowRight move, ArrowDown soft drop, ArrowUp clockwise rotation, Space hard drop, P pause/resume, R restart. Pause and restart also have buttons.
- Rotation: clockwise within the square box; O is unchanged. Try offsets in order: `[0,0], [-1,0], [1,0], [-2,0], [2,0], [0,-1]`. Reject rotation if all candidates collide. This is basic rotation, not full SRS.
- Gravity and soft drop lock immediately on a failed downward attempt. Hard drop moves to the lowest valid position and locks immediately. Drops award no extra points.
- Clear 1/2/3/4 lines for 100/300/500/800 × the **pre-clear** level. Start at level 1; level is `1 + floor(cumulative lines / 10)`.
- Gravity interval: `max(100ms, 800ms - (level - 1) * 60ms)`. Each new piece starts a fresh interval.
- A blocked spawn after locking and line clearing is game over. Gameplay input then has no effect; R starts a fresh game.
- Pause retains accumulated gravity time, blocks gameplay input, and resumes with the remaining interval. Window focus loss also pauses; resume is explicit.
- Restart resets board, current/Next/bag, score, lines, level, elapsed time, paused and game-over state; it preserves high score.
- High score updates after scoring and uses localStorage key `falling-blocks-high-score`. Invalid saved values are treated as zero. Unavailable storage falls back to an in-memory high score that survives restart but not page reload.
- Canvas draws the board and Next; the adjacent panel displays status, score, level, lines and high score. Desktop keyboard play is the Phase 1 target.

## Explicit exclusions

No login, backend, database, multiplayer, ads, payments, server leaderboard, or complex framework.

## Current implementation

Phase 1 gameplay, automated validation and the user's independent browser play acceptance are complete. Phase 2 improves clarity, layout, control feedback and accessibility without changing V0.1 gameplay rules or adding systems. The user passed the Phase 2 browser review on 2026-10-02; Phase 2 is complete.

## Phase 4 phone controls

- Narrow-screen portrait layout keeps statistics and Next above the board, with touch controls and pause/restart below it.
- Touch controls move left/right, rotate clockwise, soft drop, and hard drop. Holding left/right/down repeats; rotate and hard drop act once per press.
- Coarse-pointer devices start paused until the player taps the board. Leaving the page pauses play; restarting from a touch device asks for confirmation.
- Keyboard controls remain available. No game rules, dependencies, accounts, or server features are added.
- Physical-phone acceptance is still required before Phase 4 is complete.
