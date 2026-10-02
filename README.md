# Baozi Blocks

A simple browser-based falling-block game, built with HTML, CSS, and vanilla JavaScript. This project also validates the first real Codex Bridge development workflow.

## Local usage

Serve this directory through a local HTTP server, then open its URL in a desktop browser. For example, with Python available:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. No dependency installation is required. Direct `file://` opening may block ES modules.

On a phone, use the on-screen controls to move left/right, hold a piece, hard drop, or rotate clockwise. Holding left/right repeats. On a keyboard, use ←/→ to move, ↓ to soft drop, ↑ to rotate, Space to hard drop, C to hold, P to pause/resume, and R to restart. Music and sound effects have separate controls. High score is saved locally when storage is available. Leaving the page pauses the game.

## Tests

With Node.js 18 or later and npm available, run:

```sh
npm test
```

Tests use Node's built-in test runner. There are no third-party dependencies.

## Deployment

Published with GitHub Pages from the root of `main`: <https://tszstone-star.github.io/falling-blocks-game/>. HTTPS is enforced. Relative asset paths support deployment under this repository subpath.

## Current status

Phases 1–5 are complete, including public deployment and the user's phone-play acceptance on 2026-10-02. Phase 6 replaces score-based levels with line-based levels, fixed line-clear scores and 6% gravity growth; it adds Ghost, Lock Delay, Hold, SRS, synthesized sound effects and per-round statistics. V2 high score uses its own local storage key. See `PROJECT_STATE.md` and `docs/TEST_PLAN.md` for implementation and verification status.
