# QuestLog

![QuestLog Logo](assets/brand/questlog_logo_transparent.png)

QuestLog is a small beginner-friendly web app for tracking games you want to play, are currently playing, or have already finished.
It can fetch game metadata and cover art from the RAWG API, and it can import your Steam library through a tiny local Node server.

## Demo

- [Watch the QuestLog demo video](assets/demo/questlog-demo.mp4)
- The demo shows the app running locally with the current game library, Steam import tools, filtering, and tracking workflow.

## Features

- Add a game title
- Choose a status: `Backlog`, `Playing`, `Finished`, `Paused`, or `Dropped`
- Add a personal rating from `1` to `10`
- Search, sort, and filter by status, platform, collections, favorites, and tags
- Edit notes, collections, favorites, and custom tags
- Import your Steam library through a local proxy
- Export or import a JSON backup
- Delete entries
- Save everything in `localStorage`
- Pull matching metadata and cover art from RAWG

## Project Structure

```text
QuestLog/
|-- assets/
|   |-- brand/
|   |   |-- questlog_logo_transparent.png
|   |   `-- questlog_q_icon_transparent.png
|   `-- demo/
|       `-- questlog-demo.mp4
|-- index.html
|-- package.json
|-- README.md
|-- server.js
|-- css/
|   `-- styles.css
`-- js/
    `-- app.js
```

## What Each File Does

- `index.html` contains the page structure, form, filter dropdown, and game list container.
- `css/styles.css` controls the layout, colors, spacing, card-based game shelf, and responsive design.
- `js/app.js` handles RAWG lookup, Steam import requests, filtering, editing, backups, theme/view preferences, and saving/loading from `localStorage`.
- `server.js` serves the app on `localhost` and proxies Steam API requests so Steam import works in the browser.
- `package.json` adds the `npm start` command for running the local server.
- `README.md` explains the app and folder structure so it is easier to understand later.

## How to Run It

1. Make sure Node.js is installed.
2. Open this folder in a terminal.
3. Run `npm start`.
4. QuestLog will open in your browser at `http://localhost:3000`.
5. Add your RAWG key or Steam settings in QuestLog's Settings modal.

### PowerShell launcher

- Run `.\Start-QuestLog.ps1` to start QuestLog and mirror server output into a timestamped file inside `logs/`.
- If PowerShell blocks scripts on your machine, run `powershell -ExecutionPolicy Bypass -File .\Start-QuestLog.ps1`.

## Notes About the API

- This project uses the RAWG API from the browser, so the API key is stored in `localStorage` for simplicity.
- This project uses a small local server for Steam import because Steam requests are not reliable from a plain local HTML file.
- That is fine for a small personal project, but it is not secure enough for a production app.
- RAWG asks for attribution when you use their data and images, so the app includes a source credit in the interface.

## GitHub Publishing Notes

- Your game library, RAWG key, Steam API key, and Steam ID are stored in the browser's `localStorage`, not in this repository.
- Timestamped launch logs are written to `logs/` locally and should not be committed.
- Before pushing, review screenshots or copied log snippets to make sure they do not contain personal IDs or API keys.

## Recommended Release Workflow

- Treat this root folder as your working project.
- Put scratch files, experiments, exports, and local-only test artifacts inside `testing/`.
- Run `.\Prepare-Release.ps1` whenever you want to publish a clean snapshot.
- The script rebuilds `release/` from a whitelist of safe app files and leaves out local-only folders like `logs/` and `testing/`.
- If you want the safest GitHub setup, initialize the Git repository inside `release/` instead of the project root.

### Suggested publish flow

1. Make changes in the main project folder.
2. Test locally from the main project folder.
3. Run `.\Prepare-Release.ps1`.
4. Open the `release/` folder and review what will be published.
5. Commit and push from `release/`.
