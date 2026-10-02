# Falling Blocks Game

A simple browser-based falling-block game, built with HTML, CSS, and vanilla JavaScript. This project also validates the first real Codex Bridge development workflow.

## Local usage

Serve this directory through a local HTTP server, then open its URL in a desktop browser. For example, with Python available:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765`. No dependency installation is required. Direct `file://` opening may block ES modules.

Use ←/→ to move, ↓ to soft drop, ↑ to rotate clockwise, Space to hard drop, P to pause/resume, and R to restart. High score is saved locally when storage is available. Focus loss pauses the game.

## Tests

With Node.js 18 or later and npm available, run:

```sh
npm test
```

Tests use Node's built-in test runner. There are no third-party dependencies.

## Deployment

GitHub Pages is the intended static hosting target in Phase 3. Deployment has not been configured. Relative asset paths support deployment under a repository subpath.

## Current status

Phase 1 gameplay and Canvas UI passed the user's independent browser play check on 2026-10-02. Phase 2 layout and accessibility polish also passed the user's browser review on 2026-10-02. The first Git baseline is on `main`; GitHub Pages has not been configured.
