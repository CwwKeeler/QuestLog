# Changelog

All notable QuestLog release notes should be recorded here and mirrored in the matching GitHub Release entry.

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
