# Project State

- **Phase:** Phases 0–6 are complete and published. Phase 7 is implemented in the local working tree; physical-phone audio and comfort review remains.
- **Current game:** Dependency-free HTML/CSS/vanilla JavaScript falling-block game. Pure rules are in `src/game/`; Canvas, audio and storage are in `src/ui/`; mobile and keyboard input are wired in `src/main.js`.
- **Phase 7 updates:** Optional Ghost switch (off by default), 900 ms initial gravity with the existing 6% level curve, lighter blue-gray theme, stronger synthesized music and effects, and a reopenable quick-start guide. Existing high-score and page-session top-three behavior is unchanged.
- **Latest published release:** Phase 6 commit `a2a8147` on `main`, tracking `origin/main`.
- **Deployment:** GitHub Pages publishes the root of `main` at <https://tszstone-star.github.io/falling-blocks-game/>. The public site has not yet received the local Phase 7 changes.
- **Automated validation:** Phase 7 `npm test` passed 48/48; `node --check` passed for the source JavaScript files; `git diff --check` is clean.
- **Responsive review:** Local browser previews at 390×844 and 375×667 show the lighter dashboard, board tools, larger playfield and all five touch controls within the viewport. The Ghost switch toggles, and the quick-start dialog opens and resumes play correctly.
- **Device review:** The user tested the previous release on two phones and requested the Phase 7 changes. The updated sound level and full-round comfort still need review on actual phone speakers/screens.
- **Git:** Phase 7 files are modified locally and have not been committed or pushed.
- **Next step:** After the Phase 7 release is authorized and published, the user can repeat the phone check for Ghost, opening speed, brightness, sound and the quick-start guide.
