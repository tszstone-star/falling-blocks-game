# Test Plan

## Automated Phase 1 checks

Run `npm test` (`node --test`). Tests cover configuration; independent board rows and non-mutating placement/clearing; wall/floor/ceiling/occupied collisions; ordered rotation kicks and rejection; blocked spawn; all clear scores; level thresholds and speed floor; gravity timing and pause; immediate lock; restart; bag refill and preview; high-score storage errors and malformed values.

The entry integration test uses lightweight DOM/Canvas stubs to verify Canvas dimensions/drawing calls, display wiring, keyboard controls, pause/restart buttons, game-over status and inaccessible localStorage. It does not verify actual browser layout, pixels, or browser event behavior.

## Phase 1 independent browser acceptance — passed 2026-10-02

The user reports completing the real-browser play check and confirms Phase 1 works without problems. This closes the Phase 1 browser acceptance requirement.

## Phase 2 browser review — passed 2026-10-02

The user completed the Phase 2 browser review and reported acceptance. Phase 2 is complete.

## Phase 3 public GitHub Pages acceptance — passed 2026-10-02

Published URL: <https://tszstone-star.github.io/falling-blocks-game/>. GitHub Pages uses the root of `main`, enforces HTTPS, and reported a successful build for commit `2e3551f0cdcc2379b711b2e5d8e13c94dea45352`.

Public browser checks completed:

- The styled page, ES module, Canvas board, current piece, Next preview and status/stat panels loaded.
- Left/right movement, soft drop, clockwise rotation, hard drop, P pause/resume and R restart responded in the published page.
- Next changed as pieces locked. A real line clear updated Score to 100 and Lines to 1; Level remained 1.
- After refresh, Score and Lines reset while High score remained 100.
- At a 375px viewport, the layout stacked vertically, the document width matched the 375px viewport, and the board ratio remained 1:2.
- No browser Console errors were observed during the check.

These checks establish a public smoke acceptance for Phase 3. They do not replace the user's independent Phase 1 and Phase 2 acceptance recorded above.

Use Node's built-in runner for pure logic tests. Keep DOM/Canvas concerns separate from game rules. No test dependencies are planned.

## Phase 4 phone-play checks — accepted 2026-10-02

- `npm test`: 19/19 passed after the revised phone layout and touch-control order were added.
- The user reviewed the first published phone layout on a physical phone. That review led to moving rotate to the right edge, putting hard drop in the former soft-drop position, removing the soft-drop touch button, and moving pause/restart to the top.
- Latest program commit `014ed694` is published. The live page returns HTTP 200 and serves the title without stars, cache version `phone-layout-4`, touch-control order, framed stats and responsive stylesheet.
- The latest published-page checks at 390×844 show a 319×638 board and touch controls ending at y=836; at 375×667 the board is approximately 231×461 and controls end at y=659. Both leave 8px below the controls. No Console errors were observed. These are browser viewport checks rather than device audio or safe-area emulation.
- The automated UI fixture verifies the four touch actions and pause/resume labels; it does not verify browser pixels or responsive dimensions. The user reviewed the game on two phones and confirmed Phase 4 is settled on 2026-10-02, closing Phase 4 acceptance.

## Phase 5 — published, physical-phone review pending

- `npm test`: 28/28 passed on 2026-10-03. Coverage includes score thresholds and gravity scaling, scoring across a threshold, leaderboard ordering/name rules, music scheduling and stop behavior, keyboard input protection, and game-over entry.
- At 375×667, the game-over name field, leaderboard and restart action fit inside the board panel, with the four touch controls visible below. Submitting a name keeps it through restart; reloading and reaching game over shows the empty-board message.
- The viewport check does not emulate a real phone's on-screen keyboard or speakers. User review on the two phones should confirm name entry with the keyboard open, music loudness/tone, toggle, pause/resume, and backgrounding behavior.
