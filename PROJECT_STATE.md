# Project State

- **Phase:** Phases 0–7 are implemented and published. Phase 7 is awaiting the user's physical-phone review of sound and overall comfort.
- **Current game:** Dependency-free HTML/CSS/vanilla JavaScript. Pure rules are in `src/game/`; Canvas, audio and storage are in `src/ui/`; mobile and keyboard input are wired in `src/main.js`.
- **Phase 7 updates:** Ghost is an off-by-default switch; initial gravity is 900 ms with the existing 6% level curve; the palette is lighter; synthesized music and effects are stronger; and a quick-start guide can be reopened above the board. The saved high score and page-session top three remain unchanged.
- **Git:** Phase 7 code release commit `473ee1c3eff36d4290b91e74434b10eb8a760450` (`Improve Phase 7 phone comfort and audio`) is on `main`, which tracks `origin/main`. The user-provided `PROJECT_HANDOFF_PHASE3.md` remains untracked and unchanged.
- **Deployment:** GitHub Pages serves the root of `main` at <https://tszstone-star.github.io/falling-blocks-game/>. A no-cache fetch of the canonical page returned the Phase 7 markup and `phase7` CSS/module references. A versioned phone-review link is <https://tszstone-star.github.io/falling-blocks-game/?phase7=473ee1c>.
- **Automated validation:** `npm test` passed 48/48; `node --check` passed for all source JavaScript; `git diff --check` is clean.
- **Responsive review:** Local previews and the published page were checked at 390×844 and 375×667. The board, Ghost/help controls and five touch buttons fit the mobile viewport. The public Ghost switch and guide are present; local interaction checks verified toggle state and guide pause/resume.
- **Device review:** The user tested Phase 6 on two phones and requested these changes. The Phase 7 speaker mix, Ghost preference, opening speed and full-round comfort should now be checked on the phones.
- **Next step:** The user can open the versioned review link on both phones, refresh any already-open game tab, and try the new audio and comfort changes.
