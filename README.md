# Falling Blocks Game

A simple browser-based falling-block game, built with HTML, CSS, and vanilla JavaScript. This project also validates the first real Codex Bridge development workflow.

## Local usage

Serve this directory through a local HTTP server, then open its URL in a desktop browser. For example, with Python available:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. No dependency installation is required. Direct `file://` opening may block ES modules.

Use the on-screen controls on a phone, or ←/→ to move, ↓ to soft drop, ↑ to rotate clockwise, Space to hard drop, P to pause/resume, and R to restart on a keyboard. Holding left/right/down repeats on touch. High score is saved locally when storage is available. Leaving the page pauses the game.

## Tests

With Node.js 18 or later and npm available, run:

```sh
npm test
```

Tests use Node's built-in test runner. There are no third-party dependencies.

## Deployment

Published with GitHub Pages from the root of `main`: <https://tszstone-star.github.io/falling-blocks-game/>. HTTPS is enforced. Relative asset paths support deployment under this repository subpath.

## Current status

Phase 1 gameplay and Canvas UI passed the user's independent browser play check on 2026-10-02. Phase 2 layout and accessibility polish also passed the user's browser review on 2026-10-02. Phase 3 deployment and public smoke acceptance completed on 2026-10-02. Phase 4 phone controls and portrait layout are published for physical-phone review; see `PROJECT_STATE.md` and `docs/TEST_PLAN.md` for details.
