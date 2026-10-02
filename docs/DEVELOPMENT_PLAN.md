# Development Plan

| Phase | Scope | Completion criteria |
| --- | --- | --- |
| 0 — Initialize | Documentation, static placeholder, configuration, local Git, smoke tests | Requested scaffold exists; tests pass; no gameplay implemented |
| 1 — Playable core | Implement the MVP in PRODUCT_SPEC, separating pure game logic from UI; add planned Canvas rendering | All MVP features work; board, collision, and scoring tests pass; browser play check succeeds |
| 2 — UX polish | Improve clarity, layout, controls feedback, and accessibility within MVP scope | Controls and game state are understandable; layout and restart verified in browsers |
| 3 — GitHub Pages deploy | Publish static assets after authorization | Complete: public page loads and passes the browser smoke checks in `TEST_PLAN.md` |
| 4 — Phone-first play | Add touch controls, compact portrait layout, safe start/restart and background pause | Controls work on touch; board and controls fit common portrait screens; physical-phone review passes; project records updated |
| 5 — Difficulty, arcade scores and music | Score-based levels, page-session top three names, calm electronic music, Baozi Blocks title | Implemented, tested and published; real-phone name-entry and audio acceptance pending |

Phase 0 is complete. Phase 1 was accepted after the user's independent real-browser play check on 2026-10-02. Phase 2 is complete: its clarity, layout, control feedback and accessibility changes passed the user's browser review on 2026-10-02. Phase 3 is complete: GitHub Pages publishes the root of `main` at https://tszstone-star.github.io/falling-blocks-game/; public acceptance results are recorded in `TEST_PLAN.md`.

Phase 4 is complete. Touch controls, coarse-pointer tap-to-start, restart confirmation, visibility-loss pause, and the revised portrait layout are published in program commit `014ed694`. The user reviewed the game on two phones and confirmed Phase 4 is settled on 2026-10-02.

Phase 5 was approved on 2026-10-03 and is implemented in the current release. Levels rise every 20,000 points and gravity accelerates by 5% per level down to 100 ms per cell. The game-over panel accepts a name and keeps the current page's top three scores; the board clears on refresh. A quiet Web Audio loop starts after player input and stops while paused, hidden or game over. Automated tests pass 28/28 and the 375×667 browser check fits the score-entry and control layout. Physical-phone sound and play review remains.
