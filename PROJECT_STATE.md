# Project State

- **Phase:** Phases 0–3 complete. Phase 4 phone-play improvements are in progress.
- **Current state:** Dependency-free ES-module game with pure rules in `src/game/`, Canvas rendering/storage in `src/ui/`, and keyboard/pointer controls in `src/main.js`.
- **Implemented:** Seven tetrominoes and 7-bag, automatic/soft/hard drop, movement/rotation/kicks, collision and immediate locking, clears/score/levels/speed, Next, game over, pause/resume, restart, guarded local high score, responsive desktop layout and controls, and phone touch controls.
- **Git:** `main` tracks `origin/main`. The local and remote `main` point to baseline commit `2e3551f0cdcc2379b711b2e5d8e13c94dea45352` (`Complete playable falling blocks MVP and UX polish`).
- **Deployment:** Public GitHub Pages site at <https://tszstone-star.github.io/falling-blocks-game/>. Source is `main` at `/`; HTTPS enforcement is enabled. The Pages build for the baseline commit completed successfully on 2026-10-02.
- **Automated validation:** `npm test` passed 19/19 on 2026-10-02. JavaScript syntax, module references and static asset paths were also checked before deployment.
- **Phase 1 acceptance:** The user completed an independent real-browser play check on 2026-10-02 and reported that Phase 1 works without problems.
- **Phase 2 acceptance:** The user completed the browser review on 2026-10-02. UX and accessibility changes are recorded in `docs/TEST_PLAN.md`.
- **Phase 3 public acceptance:** On 2026-10-02, the published page loaded its styling, ES module and Canvas; movement, soft drop, rotation, hard drop, pause/resume, restart and Next were exercised. A line clear produced score 100 and line count 1; High score 100 remained after refresh. At a 375px viewport, document width stayed 375px and the board remained 1:2. No Console errors were observed.
- **Phase 4 progress:** Phone-first controls and portrait layout are implemented locally. Browser viewport checks at 375×812 and 320×568 fit without page overflow; `npm test` passes 19/19. Physical-phone play and public update remain pending.
- **Next step:** Complete a real-phone play check, adjust any issues found, then publish the Phase 4 changes to the existing GitHub Pages site.
