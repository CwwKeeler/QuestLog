# Changelog

All notable QuestLog release notes should be recorded here and mirrored in the matching GitHub Release entry.

## [v1.0.3] - 2026-04-21

### Highlights

- Added a dedicated stats page for viewing library progress, activity, and rankings in one place.
- Brought the desktop experience forward with new quality-of-life features across both macOS and Windows builds.

### Added

- A new `View Stats` modal with overview cards, status breakdowns, activity highlights, top platforms, top tags, top collections, and library leaderboards.
- Bulk-selection controls for updating multiple games at once from the library view.
- New scenic background personalization options with richer built-in art treatments.

### Improved

- `Pick Up Where You Left Off` now prioritizes Steam last-played data for more accurate resurfacing.
- Steam activity sync can now run automatically on a selectable interval of 5, 10, 30, or 60 minutes while QuestLog is open.
- Scenic backgrounds now pin artwork to the top of the page and fade naturally into the app background while scrolling.
- The Windows packaged build now matches the latest macOS feature set, including stats, personalization, and Steam activity improvements.

### Fixed

- Spotlight cards no longer show extra update text that made the shelf feel cluttered.
- Scrollbars now stay visually muted and only reveal a softer in-app thumb while scrolling.
- The root page scrollbar styling now applies correctly without the bright default track showing through.

### Notes

- The generated Windows installer for this version is `QuestLog-Setup-1.0.3.exe`.
- The generated macOS release assets for this version are `QuestLog-1.0.3-mac-arm64.dmg` and `QuestLog-1.0.3-mac-arm64.zip`.
- A GitHub Release entry should use this changelog section as its release notes.

## [v1.0.2] - 2026-04-19

### Highlights

- Added the first packaged macOS release workflow for QuestLog.
- Kept the GitHub release asset naming consistent across platforms while adding Mac-specific archives.

### Added

- macOS packaging targets for signed-ready `.dmg`, `.zip`, and unpacked `.app` smoke-test builds.
- A generated `.icns` app icon workflow and a macOS launcher helper script for local desktop runs.
- A post-pack cleanup step that clears macOS extended attributes from packaged app output.

### Improved

- Desktop startup scripts now use a cross-platform Electron entry path that works cleanly on macOS.
- Release artifact names now stay predictable for GitHub uploads across Windows and macOS builds.
- README packaging instructions now cover the full macOS build flow alongside the existing Windows release flow.

### Fixed

- Packaged macOS builds no longer rely on Windows-style path separators in the desktop startup command.
- Local macOS packaging is less likely to carry Finder or Gatekeeper metadata into release artifacts.

### Notes

- The generated Windows installer for this version remains `QuestLog-Setup-1.0.2.exe`.
- The generated macOS release assets for this version are `QuestLog-1.0.2-mac-arm64.dmg`, `QuestLog-1.0.2-mac-arm64.zip`, `QuestLog-1.0.2-mac-x64.dmg`, and `QuestLog-1.0.2-mac-x64.zip`.
- A GitHub Release entry should use this changelog section as its release notes.

## [v1.0.1] - 2026-04-18

### Highlights

- Added the first packaged Windows installer for QuestLog.
- Promoted the desktop shell into a proper desktop distribution target instead of a source-only test harness.

### Added

- Electron Builder packaging configuration for Windows NSIS installer builds.
- Packaged desktop startup scripts and Windows icon support for the installer build.
- A documented Windows installer workflow for local packaging.

### Improved

- Desktop packaging now reuses the same QuestLog UI and local server behavior as the browser version.
- The app can now be distributed as a normal Windows install with Start Menu and desktop shortcuts.

### Fixed

- Local installer builds no longer stall on unnecessary dependency rebuilds.
- Unsigned local packaging no longer blocks on the Windows code-sign editing step.

### Notes

- The generated installer for this version is `QuestLog-Setup-1.0.1.exe`.
- A GitHub Release entry should use this changelog section as its release notes.

## [v1.0.0] - 2026-04-18

### Highlights

- First public GitHub release for QuestLog with the browser app and Electron desktop shell startup flow.
- Added a clean publish workflow that rebuilds a sanitized `release/` snapshot before GitHub pushes.

### Added

- Steam import with progress tracking, metadata repair, and incremental collection repair tools.
- Automatic collection suggestions for game series and developers.
- RAWG and Steam Store metadata fallback for missing artwork and game details.
- Desktop app shell with launch scripts and persistent local data across relaunches.
- Backup/export tools, favorites, custom collections, tags, notes, and filtering controls.

### Improved

- Steam reimports reuse cached data when possible so repeat imports are faster.
- Grid and compact views now recover more gracefully from broken cover images.
- The app and release workflow now avoid logs, local IDs, and personal machine paths in the publishable repo.

### Fixed

- Tag filters no longer clip into the game list in the collapsed state.
- Grid view now respects repaired artwork instead of sticking to broken Steam image sources.
- Missing collection groupings can now be repaired without reimporting the full library.

### Notes

- The desktop app is currently started from source with Electron and is not yet packaged as a standalone installer.
