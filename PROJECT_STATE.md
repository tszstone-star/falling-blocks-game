# Project State

- **Phase:** Phase 1 and Phase 2 complete.
- **Current state:** Dependency-free ES-module game with pure rules in src/game/, Canvas rendering/storage in src/ui/, and keyboard/button wiring in src/main.js.
- **Implemented:** Seven tetrominoes and 7-bag, automatic/soft/hard drop, movement/rotation/kicks, collision and immediate locking, clears/score/levels/speed, Next, game over, pause/resume, restart, guarded local high score, desktop layout and controls.
- **Validation:** `npm test`: 19/19 pass, including logic, entry/UI integration and accessible responsive-shell checks. JavaScript syntax and local static asset/module checks pass. Automated UI stubs complement, but do not replace, browser review.
- **Phase 1 browser acceptance:** The user completed an independent real-browser play check on 2026-10-02 and reported that Phase 1 works without problems. Phase 1 is accepted and closed.
- **Phase 2 scope:** Clarity, spacing/alignment, responsive layout, control feedback, and accessibility within the existing MVP. No new gameplay systems.
- **Phase 2 changes:** Improved responsive desktop/narrow-screen layout while keeping the board at 1:2; clearer headings/status/stat cards/keyboard map; visible focus, hover, active and disabled button states; distinct pause/game-over board overlays and status colors; semantic statistics, keyboard shortcut labels, current-piece/preview descriptions and polite status announcements. Phase 1 game rules are unchanged.
- **Phase 2 acceptance:** The user completed and passed the Phase 2 browser review on 2026-10-02. Phase 2 is closed; see docs/TEST_PLAN.md.
- **Next step:** GitHub Pages deployment remains planned for Phase 3 and has not been configured.
- **Git publishing:** The first baseline commit is on `main`; GitHub Pages setup remains separate.
- **Deployment:** GitHub Pages planned; not configured or published.
