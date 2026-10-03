# Development Plan

| Phase | Scope | Completion criteria |
| --- | --- | --- |
| 0 — Initialize | Documentation, static placeholder, configuration, local Git, smoke tests | Requested scaffold exists; tests pass; no gameplay implemented |
| 1 — Playable core | Implement the MVP in PRODUCT_SPEC, separating pure game logic from UI; add planned Canvas rendering | All MVP features work; board, collision, and scoring tests pass; browser play check succeeds |
| 2 — UX polish | Improve clarity, layout, controls feedback, and accessibility within MVP scope | Controls and game state are understandable; layout and restart verified in browsers |
| 3 — GitHub Pages deploy | Publish static assets after authorization | Complete: public page loads and passes the browser smoke checks in `TEST_PLAN.md` |
| 4 — Phone-first play | Add touch controls, compact portrait layout, safe start/restart and background pause | Controls work on touch; board and controls fit common portrait screens; physical-phone review passes; project records updated |
| 5 — Difficulty, arcade scores and music | Score-based levels, page-session top three names, calm electronic music, Baozi Blocks title | Implemented, tested and published; real-phone name-entry and audio acceptance pending |
| 6 — Core feel and difficulty model | Lines-based levels, fixed clear scoring, exponential gravity, Ghost, Lock Delay, Hold, SRS, effects and round statistics | Published and reviewed by the user on two phones; Phase 7 addresses the resulting comfort and audio feedback |
| 7 — Phone comfort and onboarding | Optional Ghost switch, gentler starting speed, lighter palette, clearer synthesized audio and a quick-start guide | Automated tests pass; check the final phone layout and audio on physical devices before public acceptance |

Phase 0 is complete. Phase 1 was accepted after the user's independent real-browser play check on 2026-10-02. Phase 2 is complete: its clarity, layout, control feedback and accessibility changes passed the user's browser review on 2026-10-02. Phase 3 is complete: GitHub Pages publishes the root of `main` at https://tszstone-star.github.io/falling-blocks-game/; public acceptance results are recorded in `TEST_PLAN.md`.

Phase 4 is complete. Touch controls, coarse-pointer tap-to-start, restart confirmation, visibility-loss pause, and the revised portrait layout are published in program commit `014ed694`. The user reviewed the game on two phones and confirmed Phase 4 is settled on 2026-10-02.

Phase 5 was approved on 2026-10-03 and published in commit `26dbeba3fea0c1e338863d792b4f5440915ef062`. Levels rise every 20,000 points and gravity accelerates by 5% per level down to 100 ms per cell. The game-over panel accepts a name and keeps the current page's top three scores; the board clears on refresh. A quiet Web Audio loop starts after player input and stops while paused, hidden or game over. Automated tests pass 28/28; published-page layout was checked at 390×844 and 375×400. Physical-phone sound and play review remains.

Phase 6 keeps the page-session top three, music and Baozi Blocks branding. It replaces the Phase 5 score-level rules and adds the gameplay and feedback listed above. Approved parameters and verification are recorded in `docs/DECISIONS.md` and `docs/TEST_PLAN.md`.

Phase 7 applies the user's phone-play feedback: Ghost is an off-by-default switch, initial gravity is 900 ms per cell, the visual theme is lighter, audio cues and the synthesized loop are clearer, and a concise guide is available from the board header. The top-three name board and game-over flow stay as accepted. Automated results and remaining device checks are recorded in `docs/TEST_PLAN.md`.
