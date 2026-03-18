# AGENTS.md

## Cursor Cloud specific instructions

### Project Overview

Lite Extension Manager is a Chrome/Edge browser extension for managing other browser extensions. It uses React 18 + Ant Design + Webpack 5 with Manifest V3. There is no backend, database, or Docker dependency — everything runs client-side.

### Development Commands

See `README.md` "开发" section. Key scripts are in `package.json`:
- `npm start` — Webpack dev server on port 5300, writes to `build/` with HMR
- `npm run build` — Production build for Chrome
- `npm run build:edge` — Production build for Edge
- `npm run prettier` — Format code

### Non-obvious Setup Gotchas

- **`src/utils/secret.js` must exist before build/dev-server will work.** It is gitignored. Copy from the demo file: `cp src/utils/secret.demo.js src/utils/secret.js`. The update script handles this automatically.
- **No test framework is configured.** There are no automated tests in this repo. Lint with `npx eslint src/ --ext .js,.jsx,.ts,.tsx`. Format-check with `npx prettier --check 'src/**/*.{js,jsx,ts,tsx,json,css,scss}'`.
- **E2E testing requires loading the extension in a real Chromium browser** (Chrome or Edge). Load `/workspace/build/` as an unpacked extension via `chrome://extensions/` with Developer mode enabled.
- **Dev server (port 5300)** provides HMR for Popup and Options pages but **not** for the Background service worker — after background script changes, reload the extension manually.
