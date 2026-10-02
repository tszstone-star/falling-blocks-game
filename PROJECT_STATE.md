# Project State

- **Phase:** Phases 0–5 complete. Phase 6 is implemented locally and undergoing final verification before publication.
- **Current state:** Dependency-free ES-module game with pure rules in `src/game/`, Canvas rendering/storage in `src/ui/`, and keyboard/pointer controls in `src/main.js`.
- **Implemented:** Seven tetrominoes and 7-bag, automatic/soft/hard drop, SRS rotation, Ghost projection, 500 ms Lock Delay with up to eight resets, once-per-piece Hold, line-based levels and fixed clear scores, Next, game over, pause/resume, restart, versioned local high score, page-session top three, synthesized music and effects, line/level feedback, per-round Play Time/Tetris count, and responsive phone controls.
- **Git:** `main` tracks `origin/main`. Latest release commit: `26dbeba3fea0c1e338863d792b4f5440915ef062` (`Implement Phase 5 difficulty, scores, and music`), pushed and independently verified through the GitHub plugin on 2026-10-03.
- **Deployment:** Public GitHub Pages site at <https://tszstone-star.github.io/falling-blocks-game/>. Source is `main` at `/`; HTTPS enforcement is enabled. The Phase 5 page was loaded and checked after the release push on 2026-10-03.
- **Automated validation:** Phase 6 `npm test` passed 48/48 locally. Local desktop and phone viewport checks passed; public release verification is in progress.
- **Phase 1 acceptance:** The user completed an independent real-browser play check on 2026-10-02 and reported that Phase 1 works without problems.
- **Phase 2 acceptance:** The user completed the browser review on 2026-10-02. UX and accessibility changes are recorded in `docs/TEST_PLAN.md`.
- **Phase 3 public acceptance:** On 2026-10-02, the published page loaded its styling, ES module and Canvas; movement, soft drop, rotation, hard drop, pause/resume, restart and Next were exercised. A line clear produced score 100 and line count 1; High score 100 remained after refresh. At a 375px viewport, document width stayed 375px and the board remained 1:2. No Console errors were observed.
- **Phase 4 acceptance:** The phone layout is published. Latest responsive checks at 390×844 and 375×667 show a larger board, framed stats and controls near the bottom. The user reviewed the game on two phones and confirmed Phase 4 is settled on 2026-10-02; Phase 4 is complete.
- **Phase 5 implementation:** Its score-based level and 5% speed rules are historical and were intentionally replaced in Phase 6. The page-session top three, synthesized background music, and `Baozi Blocks` brand remain.
- **Next step:** Finish Phase 6 viewport and public checks, publish the verified release, then ask the user to review phone controls, sound and game feel on-device.
