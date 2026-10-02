# Decisions

| Decision | Reason / status |
| --- | --- |
| HTML, CSS, vanilla JavaScript ES modules; Canvas gameplay | Implemented in Phase 1; dependency-free static application |
| No third-party dependencies | Keep setup, maintenance, and deployment minimal; Node's built-in test runner is sufficient |
| GitHub Pages deployment | Static hosting fits the application; published from `main` root at https://tszstone-star.github.io/falling-blocks-game/ |
| `localStorage` for local high score | Implemented with guarded reads/writes and in-memory fallback |
| Separate game logic and UI | Pure rules can be tested independently of rendering |
| Codex Bridge workflow validation | This project serves as the first real Codex Bridge development workflow validation; scaffold creation alone does not establish full end-to-end workflow validation |
| Scaffold-only Phase 0 | Historical initialization scope; Phase 1 now implements gameplay |
| Git baseline | Commit `2e3551f0cdcc2379b711b2e5d8e13c94dea45352` was created and pushed after explicit authorization; future commits still require explicit authorization under `AGENTS.md` |

## Phase 1 V0.1 — 2026-10-02

The user explicitly authorized the complete playable MVP and the previously undecided V0.1 rules. The historical PROJECT_HANDOFF.md is preserved.

| Decision | Reason / behavior |
| --- | --- |
| 10×20 visible board; seven I/O/T/S/Z/J/L pieces; 7-bag | Simple bounded rules; shuffled bags prevent unbounded piece droughts |
| ArrowLeft/Right/Down/Up, Space, P, R | Move, soft drop, clockwise rotate, hard drop, pause/resume, restart |
| Immediate lock on blocked descent or hard drop | No lock delay or extra drop points |
| Basic clockwise rotation with ordered kicks `[0,0],[-1,0],[1,0],[-2,0],[2,0],[0,-1]` | Limited boundary correction; full SRS is outside V0.1 |
| Clear scores 100/300/500/800 × pre-clear level | Explicit order when a clear crosses a level threshold |
| Level 1 start, +1 per 10 cumulative lines; `max(100,800-(level-1)*60)` ms | Deterministic progression and minimum interval, covered by tests |
| Visible top spawn centered by rotation box; blocked spawn is game over | No hidden rows; collision checks use occupied cells |
| Pause retains elapsed time; focus loss pauses automatically | Frozen gravity and explicit resume; new-piece lock resets gravity timer |
| Restart preserves only high score | Resets all transient game state and generates a fresh bag |
| Guard localStorage access, validate saved values | Restricted storage cannot prevent play; fallback persists only within the page |

The initial browser automation attempt was blocked by browser security policy. The user subsequently completed an independent real-browser play check on 2026-10-02 and reported no problems; Phase 1 is accepted.

## Phase 2 — 2026-10-02

| Decision | Reason / behavior |
| --- | --- |
| Limit Phase 2 to clarity, layout, responsive sizing, control feedback and accessibility | Polish the existing MVP without adding gameplay or settings |
| Keep the 10×20 Canvas at a 1:2 aspect ratio; stack the information panel under the board on narrow screens | Preserve the playable field while avoiding cramped/overflowing side-by-side content |
| Use semantic stat labels, concise status announcements and visible keyboard focus | Improve navigation and state comprehension without altering game rules |
| No new gameplay systems, animation, sound, theme controls or touch input | Preserve the accepted Phase 1 scope |

The user completed the Phase 2 browser review on 2026-10-02 and accepted the result. Phase 2 is complete; its review did not change the gameplay scope.

## Phase 4 — 2026-10-02

| Decision | Reason / behavior |
| --- | --- |
| Prioritize phone portrait play | The user expects to play mainly on a phone; keep the full board and controls visible together on common short screens |
| Add pointer-based left/right holds and single-press hard-drop/rotate | Current phone button order is left, right, hard drop, rotate; soft drop is available on the keyboard |
| Pause on coarse-pointer startup and when the page becomes hidden | Gives the player time to get ready and prevents unattended play after switching apps |
| Confirm restart from touch devices | Reduces accidental loss of a phone game |

The latest phone layout is published in commit `014ed694`. The user reviewed the game on two phones and confirmed Phase 4 is settled on 2026-10-02; Phase 4 is accepted.

## Phase 5 — approved 2026-10-03

| Decision | Reason / behavior |
| --- | --- |
| Raise level every 20,000 points; accelerate gravity by 5% per level | Uses the existing line-clear score table; start at 800 ms per cell and cap speed at 100 ms per cell |
| Keep one page-session top-three name board | Names are trimmed, limited to 10 Unicode code points and clear on refresh; same name keeps its best score and ties preserve earlier entries |
| Keep numeric high score separately in local storage | The requested name board is temporary while the existing high-score behavior stays intact |
| Synthesize a quiet 80 BPM electronic loop with Web Audio | No external audio files or dependencies; music toggle defaults on, and playback stops on pause, backgrounding and game over |
| Use the exact title `Baozi Blocks` | Keep the phone header short and consistent with the browser tab title |

The approved behavior is implemented. See `PHASE5_PLAN.md` for the original proposal and `TEST_PLAN.md` for checks and remaining physical-phone acceptance.

## Phase 6 — approved 2026-10-03

| Decision | Reason / behavior |
| --- | --- |
| Level comes from lines: `1 + floor(lines / 10)` | Separates progression from score and avoids score-multiplier feedback loops |
| Fixed line-clear scores: 100/300/500/800 | Rewards clear quality consistently at every level |
| Gravity is `max(100, round(800 / 1.06^(level - 1)))` ms | Gradual exponential speed growth with a 100 ms floor |
| Use localStorage key `baozi-blocks-high-score-v2` | Keep score scales separate without deleting legacy data |
| Ghost projection, 500 ms Lock Delay, at most eight resets, once-per-piece Hold | Improve landing visibility and last-moment placement choices with bounded timing rules |
| Clockwise SRS with JLSTZ/I kick tables; O unchanged | Standardize wall/floor rotation while keeping controls simple |
| Synthesize quiet effects with Web Audio and separate Music/Sound controls | Keep the game self-contained and let phone players control each channel |
| Track active Play Time and four-line clears for the current round only | Show arcade-style results without persisting additional personal data |

Implementation and automated coverage are recorded in `docs/TEST_PLAN.md`; after publication the user should review touch feel and speaker volume on-device.
