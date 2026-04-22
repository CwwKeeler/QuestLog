# QuestLog

![QuestLog Logo](assets/brand/questlog_logo_transparent.png)

QuestLog is a desktop-friendly game library tracker for managing your backlog, active games, finished runs, notes, and imports in one place. It started as a simple browser app and now ships with packaged Windows and macOS desktop builds.

## What It Does

- Track games with statuses: `Backlog`, `Playing`, `Paused`, `Finished`, and `Dropped`
- Search, sort, and filter by status, platform, collections, favorites, and tags
- Save notes, favorites, collections, custom tags, and ratings
- Import your Steam library and refresh Steam activity data
- Pull cover art and metadata from RAWG
- Surface a `Pick Up Where You Left Off` shelf based on active games and Steam last-played data
- Bulk update multiple games at once
- View a dedicated stats page with library breakdowns, rankings, and activity summaries
- Personalize the app with light/dark themes, layout options, and built-in backgrounds
- Export and import local JSON backups

## Current Desktop Features

- Packaged Windows installer
- Packaged macOS `.dmg` and `.zip` builds
- Steam auto-sync interval options: `Off`, `5 min`, `10 min`, `30 min`, `1 hour`
- Scenic backgrounds that stay pinned near the top of the page and fade into the app background on scroll

## Demo

- [Watch the QuestLog demo video](https://youtu.be/6S6tBhGhd-k)

## Quick Start

### Run in the browser

1. Install Node.js.
2. Open the project folder in a terminal.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000`.

### Run as a desktop app

1. Install Node.js.
2. Open the project folder in a terminal.
3. Run `npm install`.
4. Run `npm run desktop-start`.

QuestLog will open in its Electron window and keep its own local app data between relaunches.

## Build Releases

### Windows

1. Run `npm install`
2. Run `npm run dist:win`
3. Find the installer in `dist/`

Release artifact format:
- `QuestLog-Setup-<version>.exe`

### macOS

1. Run `npm install`
2. Run `npm run dist:mac`
3. Find the release files in `dist/`

Release artifact format:
- `QuestLog-<version>-mac-<arch>.dmg`
- `QuestLog-<version>-mac-<arch>.zip`

Useful local test build:
- `npm run dist:mac:dir`

macOS note:
- The packaged app is unsigned by default, so Gatekeeper may warn on other Macs until the app is signed and notarized.

## Steam And RAWG Notes

- RAWG metadata is optional, but it improves cover art, tags, genres, and release information.
- Steam import and Steam activity sync need a Steam ID64 and Steam Web API key.
- Steam import works through the local QuestLog server instead of directly from a plain local HTML file.
- RAWG and Steam data are credited in the app where applicable.

## Local Data

- QuestLog stores library data and settings locally on the machine running it.
- Browser mode uses `localStorage`.
- Desktop mode keeps its own app data between relaunches.
- JSON backup export/import is built in for portability.

## Repository Layout

- [index.html](/Users/cwwkeeler/Documents/Codex%20Projects/Development/QuestLog/index.html): app shell and modal structure
- [css/styles.css](/Users/cwwkeeler/Documents/Codex%20Projects/Development/QuestLog/css/styles.css): app styling, themes, backgrounds, responsive layout
- [js/app.js](/Users/cwwkeeler/Documents/Codex%20Projects/Development/QuestLog/js/app.js): app logic, filters, Steam import, stats, backups, persistence
- [server.js](/Users/cwwkeeler/Documents/Codex%20Projects/Development/QuestLog/server.js): local server and Steam proxy routes
- [desktop/main.js](/Users/cwwkeeler/Documents/Codex%20Projects/Development/QuestLog/desktop/main.js): Electron desktop shell
- [CHANGELOG.md](/Users/cwwkeeler/Documents/Codex%20Projects/Development/QuestLog/CHANGELOG.md): release history

## License

- Code is licensed under the [MIT License](LICENSE).
- Branding assets are covered by [LICENSE-LOGO-CC-BY-4.0.txt](LICENSE-LOGO-CC-BY-4.0.txt).
