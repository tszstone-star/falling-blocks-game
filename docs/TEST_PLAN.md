# Test Plan

## Automated Phase 1 checks

Run `npm test` (`node --test`). Tests cover configuration; independent board rows and non-mutating placement/clearing; wall/floor/ceiling/occupied collisions; ordered rotation kicks and rejection; blocked spawn; all clear scores; level thresholds and speed floor; gravity timing and pause; immediate lock; restart; bag refill and preview; high-score storage errors and malformed values.

The entry integration test uses lightweight DOM/Canvas stubs to verify Canvas dimensions/drawing calls, display wiring, keyboard controls, pause/restart buttons, game-over status and inaccessible localStorage. It does not verify actual browser layout, pixels, or browser event behavior.

## Phase 1 independent browser acceptance — passed 2026-10-02

The user reports completing the real-browser play check and confirms Phase 1 works without problems. This closes the Phase 1 browser acceptance requirement.

## Phase 2 browser review — passed 2026-10-02

The user completed the Phase 2 browser review and reported acceptance. Phase 2 is complete.

Use Node's built-in runner for pure logic tests. Keep DOM/Canvas concerns separate from game rules. No test dependencies are planned.
