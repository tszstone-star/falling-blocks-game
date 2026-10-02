# Decisions

| Decision | Reason / status |
| --- | --- |
| HTML, CSS, vanilla JavaScript ES modules; Canvas gameplay | Implemented in Phase 1; dependency-free static application |
| No third-party dependencies | Keep setup, maintenance, and deployment minimal; Node's built-in test runner is sufficient |
| GitHub Pages deployment target | Static hosting fits the application; deployment is planned for Phase 3 |
| `localStorage` for local high score | Implemented with guarded reads/writes and in-memory fallback |
| Separate game logic and UI | Pure rules can be tested independently of rendering |
| Codex Bridge workflow validation | This project serves as the first real Codex Bridge development workflow validation; scaffold creation alone does not establish full end-to-end workflow validation |
| Scaffold-only Phase 0 | Historical initialization scope; Phase 1 now implements gameplay |
| Local Git repository without a commit | Initialization is requested; committing is reserved for explicit authorization |

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
