
const STORAGE_KEY = "questlog-games";
const API_KEY_STORAGE = "questlog-rawg-api-key";
const STEAM_API_KEY_STORAGE = "questlog-steam-api-key";
const STEAM_ID_STORAGE = "questlog-steam-id";
const STEAM_LAST_SYNC_STORAGE = "questlog-steam-last-sync";
const THEME_STORAGE = "questlog-theme";
const VIEW_STORAGE = "questlog-view";
const RAWG_BASE_URL = "https://api.rawg.io/api";
const STEAM_APP_IMAGE_BASE = "https://cdn.akamai.steamstatic.com/steam/apps";
const DEFAULT_STATUS = "Backlog";
const DEFAULT_RATING = 0;
const DEFAULT_THEME = "dark";
const DEFAULT_VIEW = "grid";
const TAG_FILTER_PREVIEW_COUNT = 18;
const STEAM_IMPORT_EXCLUSION_PATTERNS = [
  /\bdemo\b/i,
  /\bplaytest\b/i,
  /\bsoftware\b/i,
  /\btool\b/i,
  /\btools\b/i,
  /\butility\b/i,
  /\butilities\b/i
];
const COMPLETION_KEYWORDS = [
  "beat game",
  "beaten",
  "finish game",
  "finished game",
  "completed game",
  "complete the game",
  "the end",
  "ending",
  "true ending",
  "final boss",
  "credits",
  "epilogue"
];

const settingsModal = document.querySelector("#settings-modal");
const gameModal = document.querySelector("#game-modal");
const openSettingsButton = document.querySelector("#open-settings-button");
const openAddModalButton = document.querySelector("#open-add-modal-button");
const closeSettingsButton = document.querySelector("#close-settings-button");
const closeGameModalButton = document.querySelector("#close-game-modal-button");
const deleteFromModalButton = document.querySelector("#delete-from-modal-button");
const apiForm = document.querySelector("#api-form");
const apiKeyInput = document.querySelector("#api-key");
const apiFeedback = document.querySelector("#api-feedback");
const steamForm = document.querySelector("#steam-form");
const steamIdInput = document.querySelector("#steam-id");
const steamApiKeyInput = document.querySelector("#steam-api-key");
const steamImportButton = document.querySelector("#steam-import-button");
const metadataRepairButton = document.querySelector("#metadata-repair-button");
const collectionsRepairButton = document.querySelector("#collections-repair-button");
const steamFeedback = document.querySelector("#steam-feedback");
const steamImportProgress = document.querySelector("#steam-import-progress");
const steamImportProgressLabel = document.querySelector("#steam-import-progress-label");
const steamImportProgressCount = document.querySelector("#steam-import-progress-count");
const steamImportProgressBar = document.querySelector("#steam-import-progress-bar");
const backupFeedback = document.querySelector("#backup-feedback");
const exportLibraryButton = document.querySelector("#export-library-button");
const importLibraryButton = document.querySelector("#import-library-button");
const nukeLibraryButton = document.querySelector("#nuke-library-button");
const importFileInput = document.querySelector("#import-file-input");
const gameForm = document.querySelector("#game-form");
const titleInput = document.querySelector("#title");
const statusInput = document.querySelector("#status");
const ratingInput = document.querySelector("#rating");
const customTagsInput = document.querySelector("#custom-tags");
const formFeedback = document.querySelector("#form-feedback");
const addButton = gameForm.querySelector('button[type="submit"]');
const statsGrid = document.querySelector("#stats-grid");
const librarySummary = document.querySelector("#library-summary");
const searchInput = document.querySelector("#search-input");
const sortInput = document.querySelector("#sort-input");
const filterStatusInput = document.querySelector("#filter-status");
const filterPlatformInput = document.querySelector("#filter-platform");
const filterCollectionInput = document.querySelector("#filter-collection");
const favoritesFilterButton = document.querySelector("#favorites-filter-button");
const clearFiltersButton = document.querySelector("#clear-filters");
const viewToggleButtons = [...document.querySelectorAll(".view-toggle")];
const themeToggleButtons = [...document.querySelectorAll(".theme-toggle")];
const tagFilterList = document.querySelector("#tag-filter-list");
const tagFilterToggle = document.querySelector("#tag-filter-toggle");
const tagFilterSummary = document.querySelector("#tag-filter-summary");
const gameList = document.querySelector("#game-list");
const emptyState = document.querySelector("#empty-state");
const gameEditForm = document.querySelector("#game-edit-form");
const editGameIdInput = document.querySelector("#edit-game-id");
const editTitleInput = document.querySelector("#edit-title");
const editStatusInput = document.querySelector("#edit-status");
const editRatingInput = document.querySelector("#edit-rating");
const editTagsInput = document.querySelector("#edit-tags");
const editCollectionsInput = document.querySelector("#edit-collections");
const editNotesInput = document.querySelector("#edit-notes");
const editFavoriteInput = document.querySelector("#edit-favorite");
const editLockStatusInput = document.querySelector("#edit-lock-status");
const gameModalSummary = document.querySelector("#game-modal-summary");

let rawgApiKey = loadSetting(API_KEY_STORAGE);
let steamApiKey = loadSetting(STEAM_API_KEY_STORAGE);
let steamId = loadSetting(STEAM_ID_STORAGE);
let steamLastSyncedAt = loadSetting(STEAM_LAST_SYNC_STORAGE);
let activeTheme = loadSetting(THEME_STORAGE) || DEFAULT_THEME;
let activeView = loadSetting(VIEW_STORAGE) || DEFAULT_VIEW;
let activeTagFilters = [];
let favoritesOnly = false;
let games = loadGames().map(normalizeGame);
let steamImportInProgress = false;
let tagFiltersExpanded = false;

applyTheme();
syncApiKeyUi();
syncSteamUi();
refreshUi();
window.handleQuestLogImageError = handleQuestLogImageError;
window.handleQuestLogImageLoad = handleQuestLogImageLoad;

openSettingsButton.addEventListener("click", () => openModal(settingsModal));
openAddModalButton.addEventListener("click", () => titleInput.focus());
closeSettingsButton.addEventListener("click", () => closeModal(settingsModal));
closeGameModalButton.addEventListener("click", () => closeModal(gameModal));
deleteFromModalButton.addEventListener("click", handleDeleteFromModal);
settingsModal.addEventListener("click", handleModalBackdropClick);
gameModal.addEventListener("click", handleModalBackdropClick);
document.addEventListener("keydown", handleKeydown);
apiForm.addEventListener("submit", handleSaveApiKey);
steamForm.addEventListener("submit", handleSaveSteamSettings);
steamImportButton.addEventListener("click", handleSteamImport);
metadataRepairButton.addEventListener("click", handleRepairBrokenMetadata);
collectionsRepairButton.addEventListener("click", handleRepairCollections);
exportLibraryButton.addEventListener("click", exportLibrary);
importLibraryButton.addEventListener("click", () => importFileInput.click());
nukeLibraryButton.addEventListener("click", nukeLibrary);
importFileInput.addEventListener("change", importLibrary);
gameForm.addEventListener("submit", handleAddGame);
gameEditForm.addEventListener("submit", handleSaveGameEdits);
searchInput.addEventListener("input", refreshUi);
sortInput.addEventListener("change", refreshUi);
filterStatusInput.addEventListener("change", refreshUi);
filterPlatformInput.addEventListener("change", refreshUi);
filterCollectionInput.addEventListener("change", refreshUi);
favoritesFilterButton.addEventListener("click", toggleFavoritesFilter);
clearFiltersButton.addEventListener("click", clearFilters);
tagFilterList.addEventListener("click", handleTagFilterClick);
tagFilterToggle.addEventListener("click", toggleTagFilterExpansion);
gameList.addEventListener("click", handleGameListClick);
viewToggleButtons.forEach((button) => button.addEventListener("click", handleViewChange));
themeToggleButtons.forEach((button) => button.addEventListener("click", handleThemeChange));

function refreshUi() {
  pruneInactiveTagFilters();
  games = games.map(normalizeGame);
  renderDashboard();
  renderFilterControls();
  renderGames();
  syncViewButtons();
  syncThemeButtons();
}

function renderDashboard() {
  const totalGames = games.length;
  const backlogCount = games.filter((game) => game.status === "Backlog").length;
  const playingCount = games.filter((game) => game.status === "Playing").length;
  const finishedCount = games.filter((game) => game.status === "Finished").length;
  const favoriteCount = games.filter((game) => game.favorite).length;
  const ratedGames = games.filter((game) => Number.isFinite(game.rating) && game.rating > 0);
  const averageScore = ratedGames.length
    ? (ratedGames.reduce((sum, game) => sum + game.rating, 0) / ratedGames.length).toFixed(1)
    : "--";
  const totalHours = Math.round(games.reduce((sum, game) => sum + (Number(game.steamPlaytimeMinutes) || 0), 0) / 60);
  const completionRate = totalGames > 0 ? `${Math.round((finishedCount / totalGames) * 100)}%` : "--";

  statsGrid.innerHTML = [
    createStatCard("Total Games", String(totalGames)),
    createStatCard("Playing", String(playingCount)),
    createStatCard("Backlog", String(backlogCount)),
    createStatCard("Finished", String(finishedCount)),
    createStatCard("Favorites", String(favoriteCount)),
    createStatCard("Completion", completionRate),
    createStatCard("Avg Score", averageScore),
    createStatCard("Steam Hours", String(totalHours))
  ].join("");
}

function createStatCard(label, value) {
  return `
    <article class="stat-card">
      <p class="stat-card__label">${escapeHtml(label)}</p>
      <p class="stat-card__value">${escapeHtml(value)}</p>
    </article>
  `;
}

function renderFilterControls() {
  renderSelectOptions(filterPlatformInput, getAvailablePlatforms(), "All Platforms");
  renderSelectOptions(filterCollectionInput, getAvailableCollections(), "All Collections");
  renderTagFilters(getAvailableTags());
  favoritesFilterButton.classList.toggle("is-active", favoritesOnly);
  favoritesFilterButton.setAttribute("aria-pressed", String(favoritesOnly));
}

function renderSelectOptions(selectElement, values, allLabel) {
  const currentValue = selectElement.value || "All";
  selectElement.innerHTML = `
    <option value="All">${escapeHtml(allLabel)}</option>
    ${values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(value)}</option>`).join("")}
  `;
  selectElement.value = values.includes(currentValue) ? currentValue : "All";
}

function renderTagFilters(tags) {
  if (tags.length === 0) {
    tagFilterToggle.classList.add("hidden");
    tagFilterToggle.setAttribute("aria-expanded", "false");
    tagFilterSummary.classList.add("hidden");
    tagFilterList.classList.remove("is-expanded");
    tagFilterList.innerHTML = `<span class="helper-text">No tags yet. Import a library or add your own tags to start building filters.</span>`;
    return;
  }

  const sortedTags = sortTagsForFilter(tags);
  const visibleTags = getVisibleTagFilters(sortedTags);

  tagFilterList.classList.toggle("is-expanded", tagFiltersExpanded);
  tagFilterToggle.classList.toggle("hidden", sortedTags.length <= TAG_FILTER_PREVIEW_COUNT);
  tagFilterToggle.textContent = tagFiltersExpanded ? "Show Fewer" : `Show All (${sortedTags.length})`;
  tagFilterToggle.setAttribute("aria-expanded", String(tagFiltersExpanded));
  tagFilterSummary.classList.remove("hidden");
  tagFilterSummary.textContent = activeTagFilters.length > 0
    ? `${activeTagFilters.length} selected. Showing ${visibleTags.length} of ${sortedTags.length} tags.`
    : `Showing ${visibleTags.length} of ${sortedTags.length} tags.`;

  tagFilterList.innerHTML = visibleTags.map((tag) => `
    <button
      type="button"
      class="chip-button ${activeTagFilters.includes(tag) ? "is-active" : ""}"
      data-tag-filter="${escapeAttribute(tag)}"
      aria-pressed="${activeTagFilters.includes(tag)}"
    >
      ${escapeHtml(tag)}
    </button>
  `).join("");
}

function renderGames() {
  const filteredGames = getFilteredGames();
  renderLibrarySummary(filteredGames);
  gameList.classList.toggle("compact-view", activeView === "compact");
  gameList.innerHTML = "";
  emptyState.classList.toggle("hidden", filteredGames.length > 0);

  filteredGames.forEach((game) => {
    const item = document.createElement("li");
    item.className = "game-item";
    const artClass = getGameArtClass(game);
    item.innerHTML = `
      <div class="${artClass}">
        ${renderGameImage(game)}
        <div class="game-item__overlay">
          <span class="pill pill--status-${escapeAttribute(game.status)}">${escapeHtml(game.status)}</span>
          <span class="pill pill--neutral">${escapeHtml(formatScore(game.rating))}</span>
        </div>
      </div>
      <div class="game-item__body">
        <div class="game-item__heading">
          <div>
            <h3 class="game-item__title">${escapeHtml(game.title)}</h3>
            ${renderSubtitle(game)}
          </div>
          <button
            type="button"
            class="favorite-button ${game.favorite ? "is-active" : ""}"
            data-toggle-favorite-id="${game.id}"
            aria-label="${game.favorite ? "Remove from favorites" : "Add to favorites"}"
            aria-pressed="${game.favorite}"
          >
            &#9733;
          </button>
        </div>

        <div class="game-item__meta">
          ${renderNeutralPill(game.importSource === "steam" ? "Steam Import" : "Manual")}
          ${game.platforms[0] ? renderNeutralPill(game.platforms[0]) : ""}
          ${formatReleaseYear(game.released) ? renderNeutralPill(formatReleaseYear(game.released)) : ""}
          ${renderTagPills(getDisplayTags(game))}
        </div>

        <div class="game-item__summary">
          <div>${escapeHtml(formatPlaytime(game.steamPlaytimeMinutes))}</div>
          <div>${escapeHtml(formatAchievementSummary(game.steamAchievementSummary))}</div>
          <div>${escapeHtml(formatEstimatedLength(game.estimatedHours))}</div>
          <div>${escapeHtml(formatCollectionsSummary(game.collections))}</div>
          <div class="game-item__timestamp">${escapeHtml(formatUpdatedTimestamp(game.updatedAt))}</div>
        </div>

        <div class="game-item__actions">
          <button type="button" class="button button--secondary" data-open-game-id="${game.id}">Details</button>
          ${renderSourceLink(game)}
          <button type="button" class="button button--danger" data-delete-id="${game.id}">Delete</button>
        </div>
      </div>
    `;
    gameList.appendChild(item);
  });
}

function getFilteredGames() {
  const searchQuery = searchInput.value.trim().toLowerCase();
  const selectedStatus = filterStatusInput.value;
  const selectedPlatform = filterPlatformInput.value;
  const selectedCollection = filterCollectionInput.value;

  return [...games]
    .filter((game) => {
      const haystack = [
        game.title,
        game.searchTitle,
        game.notes,
        ...game.customTags,
        ...game.rawgTags,
        ...game.collections,
        ...game.platforms
      ].join(" ").toLowerCase();

      const matchesSearch = !searchQuery || haystack.includes(searchQuery);
      const matchesStatus = selectedStatus === "All" || game.status === selectedStatus;
      const matchesPlatform = selectedPlatform === "All" || game.platforms.includes(selectedPlatform);
      const matchesCollection = selectedCollection === "All" || game.collections.includes(selectedCollection);
      const matchesTags = activeTagFilters.length === 0 || activeTagFilters.every((tag) => getAllTags(game).includes(tag));
      const matchesFavorite = !favoritesOnly || game.favorite;

      return matchesSearch && matchesStatus && matchesPlatform && matchesCollection && matchesTags && matchesFavorite;
    })
    .sort(compareGames);
}

function compareGames(left, right) {
  switch (sortInput.value) {
    case "title-asc":
      return left.title.localeCompare(right.title);
    case "title-desc":
      return right.title.localeCompare(left.title);
    case "rating-desc":
      return right.rating - left.rating;
    case "rating-asc":
      return left.rating - right.rating;
    case "playtime-desc":
      return (right.steamPlaytimeMinutes || 0) - (left.steamPlaytimeMinutes || 0);
    case "release-desc":
      return compareDateStrings(right.released, left.released);
    case "release-asc":
      return compareDateStrings(left.released, right.released);
    case "recent":
    default:
      return compareDateStrings(right.createdAt, left.createdAt);
  }
}

function compareDateStrings(leftValue, rightValue) {
  return new Date(leftValue || 0).getTime() - new Date(rightValue || 0).getTime();
}

async function handleAddGame(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    setFormFeedback("Please enter a title before adding a game.", true);
    return;
  }

  setFormFeedback("Looking up game details...", false);
  addButton.disabled = true;
  addButton.textContent = "Finding Match...";

  try {
    const metadata = await fetchGameMetadata(title);
    const customTags = parseCsvList(customTagsInput.value);
    const duplicateGame = findPotentialDuplicateGame(title, metadata);

    if (duplicateGame) {
      applyManualAddToExistingGame(duplicateGame, {
        title,
        status: statusInput.value,
        customTags,
        metadata
      });
      persistGames();
      gameForm.reset();
      statusInput.value = DEFAULT_STATUS;
      titleInput.focus();
      setFormFeedback(`"${duplicateGame.title}" is already in your library, so QuestLog updated that entry instead of creating a duplicate.`, false);
      refreshUi();
      return;
    }

    const newGame = normalizeGame({
      id: crypto.randomUUID(),
      title: metadata.title || title,
      searchTitle: title,
      status: statusInput.value,
      rating: metadata.metacritic,
      coverImage: metadata.coverImage,
      backupCoverImage: metadata.backupCoverImage,
      released: metadata.released,
      genres: metadata.genres,
      platforms: metadata.platforms,
      rawgTags: metadata.rawgTags,
      estimatedHours: metadata.estimatedHours,
      customTags,
      collections: metadata.suggestedCollections || [],
      notes: "",
      favorite: false,
      statusLocked: false,
      steamAppId: null,
      steamPlaytimeMinutes: 0,
      steamAchievementSummary: null,
      importSource: "manual",
      rawgSlug: metadata.rawgSlug,
      rawgUrl: metadata.rawgUrl,
      matchNote: metadata.matchNote,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    games.unshift(newGame);
    persistGames();
    gameForm.reset();
    statusInput.value = DEFAULT_STATUS;
    titleInput.focus();
    setFormFeedback(metadata.matchNote, metadata.isError);
    refreshUi();
  } finally {
    addButton.disabled = false;
    addButton.textContent = "Add to QuestLog";
  }
}

function handleSaveApiKey(event) {
  event.preventDefault();
  rawgApiKey = apiKeyInput.value.trim();

  if (!rawgApiKey) {
    localStorage.removeItem(API_KEY_STORAGE);
    syncApiKeyUi("RAWG key removed. New entries will save without online metadata.");
    return;
  }

  localStorage.setItem(API_KEY_STORAGE, rawgApiKey);
  syncApiKeyUi("RAWG key saved in this browser.");
}

function handleSaveSteamSettings(event) {
  event.preventDefault();
  steamId = steamIdInput.value.trim();
  steamApiKey = steamApiKeyInput.value.trim();

  persistSetting(STEAM_ID_STORAGE, steamId);
  persistSetting(STEAM_API_KEY_STORAGE, steamApiKey);
  syncSteamUi("Steam settings saved in this browser.");
}
async function handleSteamImport() {
  if (!steamId || !steamApiKey) {
    syncSteamUi("Add both your Steam ID64 and Steam Web API key before importing.");
    return;
  }

  steamImportInProgress = true;
  steamImportButton.disabled = true;
  steamImportButton.textContent = "Importing...";
  steamFeedback.textContent = "Fetching your Steam library and suggested statuses.";
  updateSteamImportProgress(0, 1, "Contacting Steam...");

  try {
    const ownedGames = await fetchSteamOwnedGames();
    const filteredGames = ownedGames.filter((game) => shouldImportSteamGame(game));
    const skippedCount = ownedGames.length - filteredGames.length;

    if (ownedGames.length === 0) {
      hideSteamImportProgress(true);
      syncSteamUi("Steam returned no owned games. Check that your Steam library and game details are visible to this account, then try again.");
      return;
    }

    if (filteredGames.length === 0) {
      hideSteamImportProgress(true);
      syncSteamUi("Steam returned entries, but they all matched your excluded categories like demos, playtests, or software.");
      return;
    }

    updateSteamImportProgress(0, filteredGames.length, `Starting Steam import for ${filteredGames.length} games...`);
    const importedGames = await mapWithConcurrency(
      filteredGames,
      2,
      importSteamGame,
      ({ completed, total, item }) => {
        const title = item?.name || `Steam App ${item?.appid || "Unknown"}`;
        updateSteamImportProgress(completed, total, `Imported ${completed} of ${total}: ${title}`);
      }
    );
    mergeImportedGames(importedGames);
    steamLastSyncedAt = new Date().toISOString();
    persistSetting(STEAM_LAST_SYNC_STORAGE, steamLastSyncedAt);
    persistGames();
    refreshUi();
    updateSteamImportProgress(importedGames.length, importedGames.length, `Steam import complete: ${importedGames.length} games processed.`);
    steamFeedback.textContent = skippedCount > 0
      ? `Imported or updated ${importedGames.length} Steam games and skipped ${skippedCount} software, demos, or playtests. Manual status locks were preserved.`
      : `Imported or updated ${importedGames.length} Steam games. Manual status locks were preserved.`;
  } catch (error) {
    console.error("Could not import Steam library.", error);
    hideSteamImportProgress(true);
    syncSteamUi(buildSteamImportErrorMessage(error));
  } finally {
    steamImportInProgress = false;
    steamImportButton.disabled = false;
    steamImportButton.textContent = "Import My Library";
  }
}

async function handleRepairBrokenMetadata() {
  const repairableGames = games.filter(doesGameNeedMetadataRepair);

  if (repairableGames.length === 0) {
    syncSteamUi("No broken or missing metadata entries were found. Everything already looks healthy.");
    return;
  }

  metadataRepairButton.disabled = true;
  metadataRepairButton.textContent = "Repairing...";
  steamFeedback.textContent = `Checking ${repairableGames.length} entries for incremental metadata repair.`;
  updateSteamImportProgress(0, repairableGames.length, "Preparing metadata repair...");

  try {
    const repairedResults = await mapWithConcurrency(
      repairableGames,
      2,
      repairGameMetadata,
      ({ completed, total, item }) => {
        updateSteamImportProgress(
          completed,
          total,
          `Repaired ${completed} of ${total}: ${item?.title || item?.searchTitle || "Unknown game"}`
        );
      }
    );

    const repairedCount = repairedResults.filter(Boolean).length;
    persistGames();
    refreshUi();
    updateSteamImportProgress(repairableGames.length, repairableGames.length, "Metadata repair complete.");
    steamFeedback.textContent = repairedCount > 0
      ? `Incremental repair finished. Updated ${repairedCount} of ${repairableGames.length} flagged entries.`
      : "Incremental repair finished, but none of the flagged entries returned better metadata.";
  } catch (error) {
    console.error("Could not repair broken metadata.", error);
    hideSteamImportProgress(true);
    syncSteamUi("QuestLog could not repair broken metadata right now. Check your RAWG and Steam settings, then try again.");
  } finally {
    metadataRepairButton.disabled = false;
    metadataRepairButton.textContent = "Repair Broken Metadata";
  }
}

async function handleRepairCollections() {
  const repairableGames = games.filter(doesGameNeedCollectionRepair);

  if (repairableGames.length === 0) {
    syncSteamUi("No games currently need auto-filled series or developer collections.");
    return;
  }

  collectionsRepairButton.disabled = true;
  collectionsRepairButton.textContent = "Filling...";
  steamFeedback.textContent = `Scanning ${repairableGames.length} entries for missing series and developer collections.`;
  updateSteamImportProgress(0, repairableGames.length, "Preparing collection repair...");

  try {
    const repairedResults = await mapWithConcurrency(
      repairableGames,
      2,
      repairGameCollections,
      ({ completed, total, item }) => {
        updateSteamImportProgress(
          completed,
          total,
          `Updated ${completed} of ${total}: ${item?.title || item?.searchTitle || "Unknown game"}`
        );
      }
    );

    const updatedCount = repairedResults.filter(Boolean).length;
    persistGames();
    refreshUi();
    updateSteamImportProgress(repairableGames.length, repairableGames.length, "Collection repair complete.");
    steamFeedback.textContent = updatedCount > 0
      ? `Auto-filled collections for ${updatedCount} of ${repairableGames.length} games.`
      : "Collection repair finished, but no new series or developer groups were found.";
  } catch (error) {
    console.error("Could not repair collections.", error);
    hideSteamImportProgress(true);
    syncSteamUi("QuestLog could not auto-fill collections right now. Check your metadata settings and try again.");
  } finally {
    collectionsRepairButton.disabled = false;
    collectionsRepairButton.textContent = "Auto-Fill Collections";
  }
}

function handleGameListClick(event) {
  const favoriteButton = event.target.closest("[data-toggle-favorite-id]");
  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.toggleFavoriteId);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-id]");
  if (deleteButton) {
    deleteGame(deleteButton.dataset.deleteId);
    return;
  }

  const openButton = event.target.closest("[data-open-game-id]");
  if (openButton) {
    openGameModal(openButton.dataset.openGameId);
  }
}

function openGameModal(gameId) {
  const game = games.find((entry) => entry.id === gameId);
  if (!game) {
    return;
  }

  editGameIdInput.value = game.id;
  editTitleInput.value = game.title;
  editStatusInput.value = game.status;
  editRatingInput.value = String(game.rating);
  editTagsInput.value = game.customTags.join(", ");
  editCollectionsInput.value = game.collections.join(", ");
  editNotesInput.value = game.notes;
  editFavoriteInput.checked = game.favorite;
  editLockStatusInput.checked = game.statusLocked;
  gameModalSummary.innerHTML = `
    <strong>${escapeHtml(game.title)}</strong><br>
    Source: ${escapeHtml(game.importSource === "steam" ? "Steam Import" : "Manual Entry")}<br>
    Platforms: ${escapeHtml(formatPlatformList(game.platforms))}<br>
    Playtime: ${escapeHtml(formatPlaytime(game.steamPlaytimeMinutes))}<br>
    Estimated length: ${escapeHtml(formatEstimatedLength(game.estimatedHours))}<br>
    Achievements: ${escapeHtml(formatAchievementSummary(game.steamAchievementSummary))}<br>
    Notes: ${escapeHtml(game.matchNote || "No extra metadata note saved.")}
  `;
  openModal(gameModal);
}

function handleSaveGameEdits(event) {
  event.preventDefault();
  const game = games.find((entry) => entry.id === editGameIdInput.value);

  if (!game) {
    return;
  }

  game.title = editTitleInput.value.trim() || game.title;
  game.status = editStatusInput.value;
  game.rating = clampRating(Number(editRatingInput.value));
  game.customTags = parseCsvList(editTagsInput.value);
  game.collections = parseCsvList(editCollectionsInput.value);
  game.notes = editNotesInput.value.trim();
  game.favorite = editFavoriteInput.checked;
  game.statusLocked = editLockStatusInput.checked;
  game.updatedAt = new Date().toISOString();

  persistGames();
  refreshUi();
  closeModal(gameModal);
}

function handleDeleteFromModal() {
  if (!editGameIdInput.value) {
    return;
  }

  deleteGame(editGameIdInput.value);
  closeModal(gameModal);
}

function deleteGame(gameId) {
  games = games.filter((game) => game.id !== gameId);
  persistGames();
  refreshUi();
}

function toggleFavorite(gameId) {
  const game = games.find((entry) => entry.id === gameId);
  if (!game) {
    return;
  }

  game.favorite = !game.favorite;
  game.updatedAt = new Date().toISOString();
  persistGames();
  refreshUi();
}

function clearFilters() {
  searchInput.value = "";
  filterStatusInput.value = "All";
  filterPlatformInput.value = "All";
  filterCollectionInput.value = "All";
  activeTagFilters = [];
  favoritesOnly = false;
  refreshUi();
}

function toggleFavoritesFilter() {
  favoritesOnly = !favoritesOnly;
  refreshUi();
}

function handleTagFilterClick(event) {
  const tagButton = event.target.closest("[data-tag-filter]");
  if (!tagButton) {
    return;
  }

  const tag = tagButton.dataset.tagFilter;
  activeTagFilters = activeTagFilters.includes(tag)
    ? activeTagFilters.filter((item) => item !== tag)
    : [...activeTagFilters, tag];
  refreshUi();
}

function toggleTagFilterExpansion() {
  tagFiltersExpanded = !tagFiltersExpanded;
  renderTagFilters(getAvailableTags());
}

function handleThemeChange(event) {
  activeTheme = event.currentTarget.dataset.theme;
  persistSetting(THEME_STORAGE, activeTheme);
  applyTheme();
  syncThemeButtons();
}

function handleViewChange(event) {
  activeView = event.currentTarget.dataset.view;
  persistSetting(VIEW_STORAGE, activeView);
  syncViewButtons();
  renderGames();
}

function applyTheme() {
  document.body.classList.toggle("theme-light", activeTheme === "light");
}

function syncThemeButtons() {
  themeToggleButtons.forEach((button) => {
    const isActive = button.dataset.theme === activeTheme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncViewButtons() {
  viewToggleButtons.forEach((button) => {
    const isActive = button.dataset.view === activeView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function syncApiKeyUi(message) {
  apiKeyInput.value = rawgApiKey;
  apiFeedback.textContent = message || (
    rawgApiKey
      ? "RAWG is connected. New games can pull cover art, tags, genres, and release details."
      : "No RAWG key saved yet. Games still work, but they save without online metadata."
  );
}

function syncSteamUi(message) {
  steamIdInput.value = steamId;
  steamApiKeyInput.value = steamApiKey;
  steamFeedback.textContent = message || (
    steamId && steamApiKey
      ? "Steam is ready. You can import your library whenever you want."
      : "Save your Steam ID and API key to import your library and suggested progress data."
  );
}

function updateSteamImportProgress(completed, total, label) {
  const safeTotal = Math.max(total, 1);
  const percent = Math.max(0, Math.min(100, Math.round((completed / safeTotal) * 100)));
  steamImportProgress.classList.remove("hidden");
  steamImportProgress.setAttribute("aria-hidden", "false");
  steamImportProgressLabel.textContent = label;
  steamImportProgressCount.textContent = `${completed} / ${total} (${percent}%)`;
  steamImportProgressBar.max = safeTotal;
  steamImportProgressBar.value = Math.min(completed, safeTotal);
}

function hideSteamImportProgress(force = false) {
  if (steamImportInProgress && !force) {
    return;
  }

  steamImportProgress.classList.add("hidden");
  steamImportProgress.setAttribute("aria-hidden", "true");
  steamImportProgressLabel.textContent = "Preparing Steam import...";
  steamImportProgressCount.textContent = "0%";
  steamImportProgressBar.max = 100;
  steamImportProgressBar.value = 0;
}

function openModal(modal) {
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  if (settingsModal.classList.contains("hidden") && gameModal.classList.contains("hidden")) {
    document.body.style.overflow = "";
  }
}

function handleModalBackdropClick(event) {
  if (event.target.hasAttribute("data-close-settings")) {
    closeModal(settingsModal);
  }

  if (event.target.hasAttribute("data-close-game-modal")) {
    closeModal(gameModal);
  }
}

function handleKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  if (!gameModal.classList.contains("hidden")) {
    closeModal(gameModal);
  } else if (!settingsModal.classList.contains("hidden")) {
    closeModal(settingsModal);
  }
}

function exportLibrary() {
  const backup = {
    exportedAt: new Date().toISOString(),
    games,
    preferences: {
      theme: activeTheme,
      view: activeView
    }
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `questlog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  backupFeedback.textContent = "JSON backup exported.";
}

function nukeLibrary() {
  const confirmed = window.confirm(
    "This will permanently remove every game from QuestLog on this browser. Do you want to continue?"
  );

  if (!confirmed) {
    return;
  }

  games = [];
  activeTagFilters = [];
  favoritesOnly = false;
  persistGames();
  refreshUi();
  closeModal(settingsModal);
  backupFeedback.textContent = "Your QuestLog library was wiped on this browser.";
}

async function importLibrary(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const importedGames = Array.isArray(parsed.games) ? parsed.games : Array.isArray(parsed) ? parsed : [];
    games = importedGames.map(normalizeGame);
    persistGames();

    if (parsed.preferences?.theme) {
      activeTheme = parsed.preferences.theme;
      persistSetting(THEME_STORAGE, activeTheme);
      applyTheme();
    }

    if (parsed.preferences?.view) {
      activeView = parsed.preferences.view;
      persistSetting(VIEW_STORAGE, activeView);
    }

    refreshUi();
    backupFeedback.textContent = `Imported ${games.length} games from backup.`;
  } catch (error) {
    console.error("Could not import backup.", error);
    backupFeedback.textContent = "That file could not be imported. Make sure it is a valid QuestLog JSON backup.";
  } finally {
    importFileInput.value = "";
  }
}

function loadGames() {
  const savedGames = localStorage.getItem(STORAGE_KEY);
  if (!savedGames) {
    return [];
  }

  try {
    const parsed = JSON.parse(savedGames);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read saved games from localStorage.", error);
    return [];
  }
}

function normalizeGame(game) {
  return {
    id: game.id || crypto.randomUUID(),
    title: game.title || "Untitled Game",
    searchTitle: game.searchTitle || game.title || "",
    status: normalizeStatus(game.status),
    rating: clampRating(Number(game.rating ?? DEFAULT_RATING)),
    coverImage: game.coverImage || "",
    backupCoverImage: game.backupCoverImage || "",
    coverImageBroken: Boolean(game.coverImageBroken),
    released: game.released || "",
    genres: ensureStringArray(game.genres),
    platforms: ensureStringArray(game.platforms),
    rawgTags: ensureStringArray(game.rawgTags),
    estimatedHours: clampEstimatedHours(game.estimatedHours),
    customTags: ensureStringArray(game.customTags),
    collections: ensureStringArray(game.collections),
    notes: typeof game.notes === "string" ? game.notes : "",
    favorite: Boolean(game.favorite),
    statusLocked: Boolean(game.statusLocked),
    steamAppId: game.steamAppId || null,
    steamPlaytimeMinutes: Number(game.steamPlaytimeMinutes) || 0,
    steamAchievementSummary: game.steamAchievementSummary || null,
    importSource: game.importSource === "steam" ? "steam" : "manual",
    rawgSlug: game.rawgSlug || "",
    rawgUrl: game.rawgUrl || buildSteamStoreUrl(game.steamAppId),
    matchNote: game.matchNote || "",
    createdAt: game.createdAt || new Date().toISOString(),
    updatedAt: game.updatedAt || game.createdAt || new Date().toISOString()
  };
}

function normalizeStatus(status) {
  return ["Backlog", "Playing", "Finished", "Paused", "Dropped"].includes(status)
    ? status
    : DEFAULT_STATUS;
}

function clampRating(value) {
  if (!Number.isFinite(value)) {
    return DEFAULT_RATING;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function clampEstimatedHours(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return 0;
  }

  return Math.round(numericValue * 10) / 10;
}

function ensureStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
}

function persistGames() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function persistSetting(storageKey, value) {
  if (value) {
    localStorage.setItem(storageKey, value);
  } else {
    localStorage.removeItem(storageKey);
  }
}

function loadSetting(storageKey) {
  return localStorage.getItem(storageKey) || "";
}

function getAvailablePlatforms() {
  return sortAlpha([...new Set(games.flatMap((game) => game.platforms))]);
}

function getAvailableCollections() {
  return sortAlpha([...new Set(games.flatMap((game) => game.collections))]);
}

function getAvailableTags() {
  return sortAlpha([...new Set(games.flatMap((game) => getAllTags(game)))]);
}

function findPotentialDuplicateGame(title, metadata) {
  const normalizedCandidates = [
    normalizeTitle(title),
    normalizeTitle(metadata?.title),
    normalizeTitle(metadata?.rawgSlug)
  ].filter(Boolean);

  return games.find((game) => {
    const gameCandidates = [
      normalizeTitle(game.title),
      normalizeTitle(game.searchTitle),
      normalizeTitle(game.rawgSlug)
    ].filter(Boolean);

    return normalizedCandidates.some((candidate) => gameCandidates.includes(candidate));
  }) || null;
}

function applyManualAddToExistingGame(existingGame, { title, status, customTags, metadata }) {
  existingGame.searchTitle = existingGame.searchTitle || title;
  existingGame.title = existingGame.title || metadata?.title || title;
  existingGame.status = existingGame.statusLocked ? existingGame.status : status;
  existingGame.rating = existingGame.rating || metadata?.metacritic || DEFAULT_RATING;
  existingGame.coverImage = existingGame.coverImage || metadata?.coverImage || "";
  existingGame.backupCoverImage = existingGame.backupCoverImage || metadata?.backupCoverImage || "";
  existingGame.coverImageBroken = false;
  existingGame.released = existingGame.released || metadata?.released || "";
  existingGame.genres = ensureStringArray([...existingGame.genres, ...(metadata?.genres || [])]);
  existingGame.platforms = ensureStringArray([...existingGame.platforms, ...(metadata?.platforms || [])]);
  existingGame.rawgTags = ensureStringArray([...existingGame.rawgTags, ...(metadata?.rawgTags || [])]);
  existingGame.customTags = ensureStringArray([...existingGame.customTags, ...customTags]);
  existingGame.collections = ensureStringArray([...existingGame.collections, ...(metadata?.suggestedCollections || [])]);
  existingGame.estimatedHours = existingGame.estimatedHours || metadata?.estimatedHours || 0;
  existingGame.rawgSlug = existingGame.rawgSlug || metadata?.rawgSlug || "";
  existingGame.rawgUrl = existingGame.rawgUrl || metadata?.rawgUrl || buildSteamStoreUrl(existingGame.steamAppId);
  existingGame.matchNote = metadata?.matchNote || existingGame.matchNote;
  existingGame.updatedAt = new Date().toISOString();
}

function doesGameNeedMetadataRepair(game) {
  return Boolean(
    game.coverImageBroken
    || (!game.coverImage && !game.backupCoverImage)
  );
}

async function repairGameMetadata(game) {
  const lookupTitle = game.searchTitle || game.title;
  const metadata = game.importSource === "steam" && game.steamAppId
    ? await fetchSteamImportMetadata(lookupTitle, game.steamAppId)
    : rawgApiKey
      ? await fetchGameMetadata(lookupTitle)
      : null;

  if (!metadata) {
    return false;
  }

  const hasAnyArtwork = Boolean(metadata.coverImage || metadata.backupCoverImage);
  const improvedMetadata = hasAnyArtwork
    || Boolean(metadata.released)
    || Boolean(metadata.genres?.length)
    || Boolean(metadata.platforms?.length)
    || Boolean(metadata.rawgTags?.length);

  if (!improvedMetadata) {
    return false;
  }

  Object.assign(game, normalizeGame({
    ...game,
    title: game.title || metadata.title || lookupTitle,
    searchTitle: game.searchTitle || lookupTitle,
    coverImage: metadata.coverImage || game.coverImage,
    backupCoverImage: metadata.backupCoverImage || game.backupCoverImage,
    coverImageBroken: false,
    released: metadata.released || game.released,
    genres: metadata.genres?.length ? metadata.genres : game.genres,
    platforms: metadata.platforms?.length ? metadata.platforms : game.platforms,
    rawgTags: metadata.rawgTags?.length ? metadata.rawgTags : game.rawgTags,
    collections: ensureStringArray([...game.collections, ...(metadata.suggestedCollections || [])]),
    estimatedHours: metadata.estimatedHours || game.estimatedHours,
    rating: metadata.metacritic || game.rating,
    rawgSlug: metadata.rawgSlug || game.rawgSlug,
    rawgUrl: metadata.rawgUrl || game.rawgUrl,
    matchNote: metadata.matchNote || game.matchNote,
    updatedAt: new Date().toISOString()
  }));

  return true;
}

function doesGameNeedCollectionRepair(game) {
  const collections = ensureStringArray(game.collections);
  const hasSeriesCollection = collections.some((item) => item.startsWith("Series: "));
  const hasDeveloperCollection = collections.some((item) => item.startsWith("Developer: "));
  const inferredSeries = inferSeriesCollection(game.title || game.searchTitle);
  const canLookupDevelopers = Boolean(
    (game.importSource === "steam" && game.steamAppId)
    || rawgApiKey
  );

  return Boolean(
    (inferredSeries && !hasSeriesCollection)
    || (canLookupDevelopers && !hasDeveloperCollection)
  );
}

async function repairGameCollections(game) {
  const existingCollections = ensureStringArray(game.collections);
  const inferredCollections = buildSuggestedCollections({
    title: game.title || game.searchTitle,
    developers: []
  });
  const needsDeveloperCollection = !existingCollections.some((item) => item.startsWith("Developer: "));

  let metadata = null;
  if (needsDeveloperCollection) {
    const lookupTitle = game.searchTitle || game.title;
    metadata = game.importSource === "steam" && game.steamAppId
      ? await fetchSteamImportMetadata(lookupTitle, game.steamAppId)
      : rawgApiKey
        ? await fetchGameMetadata(lookupTitle)
        : null;
  }

  const repairedCollections = ensureStringArray([
    ...existingCollections,
    ...inferredCollections,
    ...(metadata?.suggestedCollections || [])
  ]);

  if (repairedCollections.length === existingCollections.length) {
    return false;
  }

  Object.assign(game, normalizeGame({
    ...game,
    collections: repairedCollections,
    updatedAt: new Date().toISOString()
  }));

  return true;
}

function shouldImportSteamGame(game) {
  const title = String(game?.name || "").trim();
  if (!title) {
    return true;
  }

  return !STEAM_IMPORT_EXCLUSION_PATTERNS.some((pattern) => pattern.test(title));
}

function sortTagsForFilter(tags) {
  return [...tags].sort((left, right) => {
    const leftIsActive = activeTagFilters.includes(left);
    const rightIsActive = activeTagFilters.includes(right);

    if (leftIsActive !== rightIsActive) {
      return leftIsActive ? -1 : 1;
    }

    const usageDifference = getTagUsageCount(right) - getTagUsageCount(left);
    if (usageDifference !== 0) {
      return usageDifference;
    }

    return left.localeCompare(right);
  });
}

function renderLibrarySummary(filteredGames) {
  const totalCount = games.length;
  const filteredCount = filteredGames.length;
  const parts = [
    filteredCount === totalCount
      ? `Showing all ${totalCount} games`
      : `Showing ${filteredCount} of ${totalCount} games`
  ];
  const mostRecentUpdate = getMostRecentUpdatedAt();

  if (mostRecentUpdate) {
    parts.push(`Last updated ${formatRelativeTime(mostRecentUpdate)}`);
  }

  if (steamLastSyncedAt) {
    parts.push(`Steam synced ${formatRelativeTime(steamLastSyncedAt)}`);
  }

  librarySummary.textContent = parts.join(" | ");
}

function getVisibleTagFilters(sortedTags) {
  if (tagFiltersExpanded || sortedTags.length <= TAG_FILTER_PREVIEW_COUNT) {
    return sortedTags;
  }

  const previewTags = sortedTags.slice(0, TAG_FILTER_PREVIEW_COUNT);
  return sortTagsForFilter([...new Set([...activeTagFilters, ...previewTags])]);
}

function getTagUsageCount(tag) {
  return games.filter((game) => getAllTags(game).includes(tag)).length;
}

function pruneInactiveTagFilters() {
  const availableTags = getAvailableTags();
  activeTagFilters = activeTagFilters.filter((tag) => availableTags.includes(tag));
}

function getAllTags(game) {
  return [...new Set([...game.rawgTags, ...game.customTags])];
}

function sortAlpha(values) {
  return values.sort((left, right) => left.localeCompare(right));
}

function parseCsvList(value) {
  return [...new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  )];
}

async function fetchGameMetadata(title) {
  if (!rawgApiKey) {
    return {
      title,
      coverImage: "",
      backupCoverImage: "",
      genres: [],
      platforms: [],
      rawgTags: [],
      metacritic: 0,
      estimatedHours: 0,
      rawgSlug: "",
      rawgUrl: "",
      suggestedCollections: [],
      matchNote: "Saved without online metadata. Add a RAWG key in Settings if you want richer matches.",
      isError: false
    };
  }

  try {
    const searchUrl = new URL(`${RAWG_BASE_URL}/games`);
    searchUrl.searchParams.set("key", rawgApiKey);
    searchUrl.searchParams.set("search", title);
    searchUrl.searchParams.set("search_precise", "true");
    searchUrl.searchParams.set("page_size", "5");

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`RAWG request failed with status ${response.status}`);
    }

    const data = await response.json();
    const bestMatch = pickBestMatch(title, data.results || []);

    if (!bestMatch) {
      return {
        title,
        coverImage: "",
        backupCoverImage: "",
        genres: [],
        platforms: [],
        rawgTags: [],
        metacritic: 0,
        estimatedHours: 0,
        rawgSlug: "",
        rawgUrl: "",
        suggestedCollections: [],
        matchNote: "No RAWG match was found, so the title was saved as a custom entry.",
        isError: false
      };
    }

    const details = await fetchGameDetails(bestMatch.slug);

    return {
      title: bestMatch.name || title,
      coverImage: bestMatch.background_image || details?.background_image || "",
      backupCoverImage: getRawgBackupCoverImage(bestMatch, details),
      released: bestMatch.released || "",
      genres: Array.isArray(bestMatch.genres) ? bestMatch.genres.map((genre) => genre.name) : [],
      platforms: extractPlatformNames(bestMatch.platforms),
      rawgTags: extractTagNames(details?.tags),
      metacritic: Number(bestMatch.metacritic || details?.metacritic || 0),
      estimatedHours: Number(details?.playtime || bestMatch.playtime || 0),
      rawgSlug: bestMatch.slug || "",
      rawgUrl: bestMatch.slug ? `https://rawg.io/games/${bestMatch.slug}` : "",
      suggestedCollections: buildSuggestedCollections({
        title: bestMatch.name || title,
        developers: extractDeveloperNames(details?.developers)
      }),
      matchNote: `Matched "${title}" to "${bestMatch.name || title}".`,
      isError: false
    };
  } catch (error) {
    console.error("Could not fetch game metadata.", error);
    return {
      title,
      coverImage: "",
      backupCoverImage: "",
      genres: [],
      platforms: [],
      rawgTags: [],
      metacritic: 0,
      estimatedHours: 0,
      rawgSlug: "",
      rawgUrl: "",
      suggestedCollections: [],
      matchNote: "Saved the game, but metadata lookup failed. Check your RAWG key and browser network access.",
      isError: true
    };
  }
}

async function fetchGameDetails(slug) {
  if (!slug) {
    return null;
  }

  const detailsUrl = new URL(`${RAWG_BASE_URL}/games/${slug}`);
  detailsUrl.searchParams.set("key", rawgApiKey);
  const response = await fetch(detailsUrl);

  if (!response.ok) {
    throw new Error(`RAWG detail request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchSteamOwnedGames() {
  const url = new URL("/api/steam/owned-games", window.location.origin);
  url.searchParams.set("key", steamApiKey);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("include_appinfo", "1");
  url.searchParams.set("include_played_free_games", "1");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Steam owned games request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.response?.games || [];
}

async function fetchSteamStoreDetails(appId) {
  const url = new URL("/api/steam/store-details", window.location.origin);
  url.searchParams.set("appids", String(appId));
  url.searchParams.set("l", "english");
  url.searchParams.set("cc", "us");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Steam store details request failed with status ${response.status}`);
  }

  const data = await response.json();
  const storeEntry = data?.[String(appId)];

  if (!storeEntry?.success || !storeEntry?.data) {
    throw new Error(`Steam store details were not available for app ${appId}`);
  }

  return storeEntry.data;
}
async function importSteamGame(game) {
  const appId = game.appid;
  const playtimeMinutes = game.playtime_forever || 0;
  const existingGame = findExistingSteamGame(appId);
  const canReuseMetadata = hasReusableSteamMetadata(existingGame);
  const canReuseAchievements = canReuseSteamAchievementSummary(existingGame, playtimeMinutes);
  const metadata = canReuseMetadata
    ? getReusableSteamMetadata(existingGame)
    : await fetchSteamImportMetadata(game.name || `Steam App ${appId}`, appId);
  const achievementSummary = playtimeMinutes > 0
    ? canReuseAchievements
      ? existingGame.steamAchievementSummary
      : await fetchSteamAchievementSummary(appId)
    : null;
  const inferredStatus = inferSteamStatus(playtimeMinutes, achievementSummary);

  return normalizeGame({
    id: crypto.randomUUID(),
    title: metadata?.title || game.name || `Steam App ${appId}`,
    searchTitle: game.name || `Steam App ${appId}`,
    status: inferredStatus,
    rating: metadata?.metacritic || DEFAULT_RATING,
    coverImage: metadata?.coverImage || buildSteamHeaderImage(appId),
    backupCoverImage: metadata?.backupCoverImage || "",
    released: metadata?.released || "",
    genres: metadata?.genres || [],
    platforms: metadata?.platforms?.length ? metadata.platforms : ["Steam"],
    rawgTags: metadata?.rawgTags || [],
    estimatedHours: metadata?.estimatedHours || 0,
    customTags: [],
    collections: metadata?.suggestedCollections || [],
    notes: "",
    favorite: false,
    statusLocked: false,
    steamAppId: appId,
    steamPlaytimeMinutes: playtimeMinutes,
    steamAchievementSummary: achievementSummary,
    importSource: "steam",
    rawgSlug: metadata?.rawgSlug || "",
    rawgUrl: buildSteamStoreUrl(appId),
    matchNote: metadata?.matchNote || buildSteamMatchNote(inferredStatus),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

async function fetchSteamImportMetadata(title, appId) {
  const rawgMetadata = rawgApiKey ? await fetchGameMetadata(title) : null;
  const storeMetadata = await fetchSteamStoreMetadata(appId);

  if (!rawgMetadata) {
    return storeMetadata;
  }

  if (!storeMetadata) {
    return rawgMetadata;
  }

  return mergeSteamMetadata(rawgMetadata, storeMetadata);
}

async function fetchSteamStoreMetadata(appId) {
  try {
    const storeData = await fetchSteamStoreDetails(appId);
    return buildSteamStoreMetadata(storeData, appId);
  } catch (error) {
    console.warn(`Could not load Steam store metadata for app ${appId}.`, error);
    return null;
  }
}

function mergeSteamMetadata(primaryMetadata, fallbackMetadata) {
  if (!primaryMetadata) {
    return fallbackMetadata;
  }

  if (!fallbackMetadata) {
    return primaryMetadata;
  }

  return {
    ...fallbackMetadata,
    ...primaryMetadata,
    title: primaryMetadata.title || fallbackMetadata.title,
    coverImage: primaryMetadata.coverImage || fallbackMetadata.coverImage,
    backupCoverImage: primaryMetadata.backupCoverImage || fallbackMetadata.backupCoverImage,
    released: primaryMetadata.released || fallbackMetadata.released,
    genres: primaryMetadata.genres?.length ? primaryMetadata.genres : fallbackMetadata.genres,
    platforms: primaryMetadata.platforms?.length ? primaryMetadata.platforms : fallbackMetadata.platforms,
    rawgTags: primaryMetadata.rawgTags?.length ? primaryMetadata.rawgTags : fallbackMetadata.rawgTags,
    estimatedHours: primaryMetadata.estimatedHours || fallbackMetadata.estimatedHours,
    rawgSlug: primaryMetadata.rawgSlug || fallbackMetadata.rawgSlug,
    rawgUrl: primaryMetadata.rawgUrl || fallbackMetadata.rawgUrl,
    metacritic: primaryMetadata.metacritic || fallbackMetadata.metacritic,
    matchNote: buildMergedSteamMetadataNote(primaryMetadata, fallbackMetadata)
  };
}

function buildMergedSteamMetadataNote(primaryMetadata, fallbackMetadata) {
  if (primaryMetadata?.coverImage && primaryMetadata?.genres?.length) {
    return primaryMetadata.matchNote;
  }

  if (fallbackMetadata?.matchNote && primaryMetadata?.matchNote) {
    return `${primaryMetadata.matchNote} ${fallbackMetadata.matchNote}`;
  }

  return primaryMetadata?.matchNote || fallbackMetadata?.matchNote || "";
}

function buildSteamStoreMetadata(storeData, appId) {
  if (!storeData) {
    return null;
  }

  const primaryCover = getSteamStorePrimaryCover(storeData, appId);
  const backupCover = getSteamStoreBackupCover(storeData, primaryCover, appId);

  return {
    title: storeData.name || `Steam App ${appId}`,
    coverImage: primaryCover,
    backupCoverImage: backupCover,
    released: normalizeSteamStoreReleaseDate(storeData.release_date?.date),
    genres: extractSteamStoreGenres(storeData.genres),
    platforms: ["Steam"],
    rawgTags: [],
    suggestedCollections: buildSuggestedCollections({
      title: storeData.name || `Steam App ${appId}`,
      developers: ensureStringArray(storeData.developers)
    }),
    estimatedHours: 0,
    rawgSlug: "",
    rawgUrl: buildSteamStoreUrl(appId),
    metacritic: Number(storeData.metacritic?.score || 0),
    matchNote: "Steam Store fallback metadata was used for this import."
  };
}

function getSteamStorePrimaryCover(storeData, appId) {
  return storeData.library_capsule
    || storeData.library_capsule_2x
    || storeData.header_image
    || storeData.capsule_imagev5
    || buildSteamHeaderImage(appId);
}

function getSteamStoreBackupCover(storeData, primaryCover, appId) {
  const candidates = [
    storeData.library_capsule_2x,
    storeData.library_capsule,
    storeData.header_image,
    storeData.capsule_imagev5,
    ...extractScreenshotUrls(storeData.screenshots),
    buildSteamHeaderImage(appId)
  ].filter(Boolean);

  return candidates.find((candidate) => candidate !== primaryCover) || "";
}

function normalizeSteamStoreReleaseDate(value) {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : "";
}

function extractSteamStoreGenres(genres) {
  if (!Array.isArray(genres)) {
    return [];
  }

  return genres
    .map((genre) => genre?.description)
    .filter(Boolean)
    .slice(0, 10);
}

function findExistingSteamGame(appId) {
  return games.find((game) => game.steamAppId === appId) || null;
}

function hasReusableSteamMetadata(game) {
  if (!game) {
    return false;
  }

  return Boolean(
    game.coverImage ||
    game.backupCoverImage ||
    game.released ||
    game.rawgSlug ||
    game.platforms.some((platform) => platform !== "Steam") ||
    game.genres.length ||
    game.rawgTags.length
  );
}

function getReusableSteamMetadata(game) {
  if (!game) {
    return null;
  }

  return {
    title: game.title,
    coverImage: game.coverImage,
    backupCoverImage: game.backupCoverImage,
    released: game.released,
    genres: game.genres,
    platforms: game.platforms,
    rawgTags: game.rawgTags,
    estimatedHours: game.estimatedHours,
    rawgSlug: game.rawgSlug,
    rawgUrl: game.rawgUrl,
    matchNote: game.matchNote
  };
}

function canReuseSteamAchievementSummary(game, playtimeMinutes) {
  if (!game) {
    return false;
  }

  if (Number(game.steamPlaytimeMinutes || 0) !== Number(playtimeMinutes || 0)) {
    return false;
  }

  return playtimeMinutes <= 0 || game.steamAchievementSummary !== null;
}

function buildSteamMatchNote(status) {
  if (status === "Finished") {
    return "Steam import suggests this game is finished.";
  }

  if (status === "Playing") {
    return "Steam import suggests this game is in progress.";
  }

  return "Steam import suggests this game is still in the backlog.";
}

async function fetchSteamAchievementSummary(appId) {
  try {
    const playerAchievementData = await fetchSteamPlayerAchievements(appId);

    const unlockedAchievements = playerAchievementData.playerstats?.achievements || [];

    if (unlockedAchievements.length === 0) {
      return null;
    }

    const unlockedCount = unlockedAchievements.filter((achievement) => achievement.achieved === 1).length;

    if (unlockedCount === 0) {
      return {
        unlockedCount: 0,
        totalCount: unlockedAchievements.length,
        hasCompletionAchievement: false,
        completionAchievementName: "",
        completionRate: 0
      };
    }

    let schemaAchievements = [];
    try {
      const schemaData = await fetchSteamSchema(appId);
      schemaAchievements = schemaData.game?.availableGameStats?.achievements || [];
    } catch (error) {
      console.warn(`Could not load Steam schema for app ${appId}. Falling back to player achievement data only.`, error);
    }

    const schemaByApiName = new Map(schemaAchievements.map((achievement) => [achievement.name, achievement]));
    const totalCount = schemaAchievements.length || unlockedAchievements.length;
    const completionAchievement = unlockedAchievements.find((achievement) => {
      if (achievement.achieved !== 1) {
        return false;
      }

      const schema = schemaByApiName.get(achievement.apiname);
      const haystack = [achievement.apiname, schema?.displayName, schema?.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return COMPLETION_KEYWORDS.some((keyword) => haystack.includes(keyword));
    });

    return {
      unlockedCount,
      totalCount,
      hasCompletionAchievement: Boolean(completionAchievement),
      completionAchievementName: completionAchievement
        ? schemaByApiName.get(completionAchievement.apiname)?.displayName || completionAchievement.apiname
        : "",
      completionRate: totalCount > 0 ? unlockedCount / totalCount : 0
    };
  } catch (error) {
    if (!isExpectedSteamAchievementError(error)) {
      console.warn(`Could not load Steam achievements for app ${appId}.`, error);
    }

    return null;
  }
}

async function fetchSteamPlayerAchievements(appId) {
  const url = new URL("/api/steam/player-achievements", window.location.origin);
  url.searchParams.set("key", steamApiKey);
  url.searchParams.set("steamid", steamId);
  url.searchParams.set("appid", String(appId));
  url.searchParams.set("l", "english");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Steam player achievements request failed with status ${response.status}`);
  }

  return response.json();
}

async function fetchSteamSchema(appId) {
  const url = new URL("/api/steam/schema", window.location.origin);
  url.searchParams.set("key", steamApiKey);
  url.searchParams.set("appid", String(appId));
  url.searchParams.set("l", "english");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Steam schema request failed with status ${response.status}`);
  }

  return response.json();
}

function inferSteamStatus(playtimeMinutes, achievementSummary) {
  if (!playtimeMinutes) {
    return "Backlog";
  }

  if (!achievementSummary) {
    return playtimeMinutes < 360 ? "Backlog" : "Playing";
  }

  if (achievementSummary.hasCompletionAchievement || achievementSummary.completionRate === 1) {
    return "Finished";
  }

  return playtimeMinutes < 360 ? "Backlog" : "Playing";
}

function mergeImportedGames(importedGames) {
  importedGames.forEach((importedGame) => {
    const existingIndex = games.findIndex((game) => game.steamAppId === importedGame.steamAppId);

    if (existingIndex === -1) {
      games.push(importedGame);
      return;
    }

    const existingGame = games[existingIndex];
    games[existingIndex] = normalizeGame({
      ...existingGame,
      ...importedGame,
      id: existingGame.id,
      title: existingGame.title || importedGame.title,
      rating: existingGame.rating || importedGame.rating,
      customTags: existingGame.customTags,
      collections: ensureStringArray([...existingGame.collections, ...importedGame.collections]),
      notes: existingGame.notes,
      favorite: existingGame.favorite,
      statusLocked: existingGame.statusLocked,
      status: existingGame.statusLocked ? existingGame.status : importedGame.status,
      createdAt: existingGame.createdAt,
      updatedAt: new Date().toISOString()
    });
  });
}

async function mapWithConcurrency(items, limit, asyncMapper, onProgress) {
  const results = new Array(items.length);
  let currentIndex = 0;
  let completedCount = 0;

  async function worker() {
    while (currentIndex < items.length) {
      const index = currentIndex;
      currentIndex += 1;
      const item = items[index];
      results[index] = await asyncMapper(item);
      completedCount += 1;
      if (typeof onProgress === "function") {
        onProgress({
          completed: completedCount,
          total: items.length,
          index,
          item,
          result: results[index]
        });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function pickBestMatch(title, results) {
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const normalizedTitle = normalizeTitle(title);
  return results.find((result) => normalizeTitle(result.name) === normalizedTitle) || results[0];
}

function normalizeTitle(value) {
  return String(value || "").trim().toLowerCase();
}

function extractPlatformNames(platforms) {
  if (!Array.isArray(platforms)) {
    return [];
  }

  return platforms
    .map((item) => item.platform?.name)
    .filter(Boolean)
    .slice(0, 5);
}

function extractDeveloperNames(developers) {
  if (!Array.isArray(developers)) {
    return [];
  }

  return developers
    .map((developer) => developer?.name)
    .filter(Boolean)
    .slice(0, 3);
}

function buildSuggestedCollections({ title, developers }) {
  const seriesName = inferSeriesCollection(title);
  const developerCollections = ensureStringArray(developers).map((developer) => `Developer: ${developer}`);

  return ensureStringArray([
    seriesName ? `Series: ${seriesName}` : "",
    ...developerCollections
  ]);
}

function inferSeriesCollection(title) {
  const cleanedTitle = String(title || "").trim();
  if (!cleanedTitle) {
    return "";
  }

  const colonSeries = cleanedTitle.split(":")[0]?.trim();
  if (colonSeries && colonSeries.length >= 3 && colonSeries !== cleanedTitle) {
    return colonSeries;
  }

  const dashSeries = cleanedTitle.split(" - ")[0]?.trim();
  if (dashSeries && dashSeries.length >= 3 && dashSeries !== cleanedTitle) {
    return dashSeries;
  }

  const sequelMatch = cleanedTitle.match(/^(.*?)(?:\s+(?:\d+|[IVX]+))(?:\s|$)/i);
  if (sequelMatch?.[1]) {
    return sequelMatch[1].trim();
  }

  return "";
}

function extractTagNames(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => tag?.name)
    .filter(Boolean)
    .slice(0, 10);
}

function getRawgBackupCoverImage(bestMatch, details) {
  const candidates = [
    details?.background_image_additional,
    details?.background_image,
    ...extractScreenshotUrls(details?.short_screenshots),
    ...extractScreenshotUrls(bestMatch?.short_screenshots)
  ].filter(Boolean);

  const primaryImage = bestMatch?.background_image || details?.background_image || "";
  return candidates.find((candidate) => candidate !== primaryImage) || "";
}

function extractScreenshotUrls(screenshots) {
  if (!Array.isArray(screenshots)) {
    return [];
  }

  return screenshots
    .map((item) => item?.image || item?.path_full || item?.path_thumbnail)
    .filter(Boolean);
}

function renderGameImage(game) {
  if (game.coverImage || game.backupCoverImage) {
    const imageSource = getGameImageSource(game);
    const imageClass = getGameImageClass(game);
    const fallbackSource = getGameImageFallbackSource(game, imageSource);
    return `<img class="${imageClass}" src="${escapeAttribute(imageSource)}" alt="${escapeAttribute(game.title)} cover art" data-game-id="${escapeAttribute(game.id)}" data-fallback-src="${escapeAttribute(fallbackSource)}" data-fallback-applied="false" onload="window.handleQuestLogImageLoad && window.handleQuestLogImageLoad(this)" onerror="window.handleQuestLogImageError && window.handleQuestLogImageError(this)">`;
  }

  return `<div class="game-item__placeholder" aria-hidden="true"></div>`;
}

function getGameImageSource(game) {
  if (game.importSource === "steam" && game.steamAppId && activeView === "grid") {
    const preferredGridImage = getPreferredSteamGridImage(game);
    if (preferredGridImage) {
      return preferredGridImage;
    }
  }

  return game.coverImage || game.backupCoverImage;
}

function getPreferredSteamGridImage(game) {
  if (!game.steamAppId) {
    return game.coverImage || game.backupCoverImage || "";
  }

  if (game.coverImageBroken) {
    return game.coverImage || game.backupCoverImage || buildSteamHeaderImage(game.steamAppId);
  }

  const gridBanner = buildSteamGridBanner(game.steamAppId);
  return gridBanner || game.coverImage || game.backupCoverImage || buildSteamHeaderImage(game.steamAppId);
}

function getGameImageClass(game) {
  if (game.importSource !== "steam") {
    return "game-item__image";
  }

  return activeView === "grid"
    ? "game-item__image game-item__image--steam-grid"
    : "game-item__image game-item__image--steam-compact";
}

function getGameImageFallbackSource(game, currentSource) {
  if (game.importSource !== "steam") {
    return game.backupCoverImage && game.backupCoverImage !== currentSource
      ? game.backupCoverImage
      : "";
  }

  if (game.coverImage && game.coverImage !== currentSource) {
    return game.coverImage;
  }

  if (game.backupCoverImage && game.backupCoverImage !== currentSource) {
    return game.backupCoverImage;
  }

  const headerImage = buildSteamHeaderImage(game.steamAppId);

  if (activeView === "grid" && headerImage && headerImage !== currentSource) {
    return headerImage;
  }

  return "";
}

function handleQuestLogImageError(imageElement) {
  const fallbackSource = imageElement.dataset.fallbackSrc || "";
  const hasTriedFallback = imageElement.dataset.fallbackApplied === "true";

  if (fallbackSource && !hasTriedFallback && fallbackSource !== imageElement.currentSrc) {
    imageElement.dataset.fallbackApplied = "true";
    imageElement.src = fallbackSource;
    return;
  }

  markGameCoverImageBroken(imageElement.dataset.gameId);
  replaceBrokenImageWithPlaceholder(imageElement);
}

function handleQuestLogImageLoad(imageElement) {
  clearGameCoverImageBroken(imageElement.dataset.gameId);
}

function markGameCoverImageBroken(gameId) {
  const game = games.find((entry) => entry.id === gameId);
  if (!game || game.coverImageBroken) {
    return;
  }

  game.coverImageBroken = true;
  game.updatedAt = new Date().toISOString();
  persistGames();
}

function clearGameCoverImageBroken(gameId) {
  const game = games.find((entry) => entry.id === gameId);
  if (!game || !game.coverImageBroken) {
    return;
  }

  game.coverImageBroken = false;
  persistGames();
}

function replaceBrokenImageWithPlaceholder(imageElement) {
  const artContainer = imageElement.parentElement;
  if (!artContainer) {
    return;
  }

  imageElement.remove();

  if (!artContainer.querySelector(".game-item__placeholder")) {
    artContainer.insertAdjacentHTML("afterbegin", '<div class="game-item__placeholder" aria-hidden="true"></div>');
  }
}

function getGameArtClass(game) {
  if (game.importSource !== "steam") {
    return "game-item__art";
  }

  return activeView === "grid"
    ? "game-item__art game-item__art--steam-grid"
    : "game-item__art game-item__art--steam-compact";
}

function renderSubtitle(game) {
  if (!game.searchTitle || game.searchTitle === game.title) {
    return "";
  }

  return `<p class="game-item__subtitle">Added as "${escapeHtml(game.searchTitle)}"</p>`;
}

function renderNeutralPill(value) {
  return `<span class="pill pill--neutral">${escapeHtml(value)}</span>`;
}

function renderTagPills(tags) {
  return tags.map((tag) => `<span class="pill pill--tag">${escapeHtml(tag)}</span>`).join("");
}

function getDisplayTags(game) {
  return getAllTags(game).slice(0, 3);
}

function renderSourceLink(game) {
  if (!game.rawgUrl) {
    return `<span class="helper-text">Local entry</span>`;
  }

  const label = game.importSource === "steam" ? "Steam Page" : "RAWG Page";
  return `<a class="button button--secondary" href="${escapeAttribute(game.rawgUrl)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function formatReleaseYear(released) {
  return released ? released.slice(0, 4) : "";
}

function formatPlaytime(playtimeMinutes) {
  if (!playtimeMinutes) {
    return "Playtime: 0 hours";
  }

  const hours = Math.round((playtimeMinutes / 60) * 10) / 10;
  return `Playtime: ${hours} hours`;
}

function formatEstimatedLength(estimatedHours) {
  if (!estimatedHours) {
    return "Estimated length: unknown";
  }

  return `Estimated length: ${estimatedHours} hours`;
}

function formatScore(score) {
  if (!score) {
    return "No MC";
  }

  return `${score} MC`;
}

function formatAchievementSummary(summary) {
  if (!summary) {
    return "Achievements: no Steam data";
  }

  const baseText = `Achievements: ${summary.unlockedCount}/${summary.totalCount || 0} unlocked`;

  if (summary.hasCompletionAchievement && summary.completionAchievementName) {
    return `${baseText} | Found "${summary.completionAchievementName}"`;
  }

  if (summary.completionRate === 1 && summary.totalCount > 0) {
    return `${baseText} | 100% complete`;
  }

  return baseText;
}

function isExpectedSteamAchievementError(error) {
  const message = String(error?.message || "");
  return message.includes("status 400");
}

function formatCollectionsSummary(collections) {
  if (!collections.length) {
    return "Collections: none";
  }

  return `Collections: ${collections.join(", ")}`;
}

function formatPlatformList(platforms) {
  return platforms.length ? platforms.join(", ") : "Unknown";
}

function formatUpdatedTimestamp(updatedAt) {
  return updatedAt ? `Updated ${formatRelativeTime(updatedAt)}` : "Updated recently";
}

function formatRelativeTime(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    return "recently";
  }

  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) {
    return "just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.round(hours / 24);
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  return new Date(value).toLocaleDateString();
}

function getMostRecentUpdatedAt() {
  if (!games.length) {
    return "";
  }

  return [...games]
    .map((game) => game.updatedAt || game.createdAt)
    .filter(Boolean)
    .sort(compareDateStrings)
    .at(-1) || "";
}

function buildSteamHeaderImage(appId) {
  return appId ? `${STEAM_APP_IMAGE_BASE}/${appId}/header.jpg` : "";
}

function buildSteamGridBanner(appId) {
  return appId ? `${STEAM_APP_IMAGE_BASE}/${appId}/capsule_616x353.jpg` : "";
}

function buildSteamStoreUrl(appId) {
  return appId ? `https://store.steampowered.com/app/${appId}/` : "";
}

function buildSteamImportErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("failed to fetch") || message.includes("networkerror")) {
    return "Steam import could not reach the local QuestLog server. Start the app with npm start, then open the localhost URL instead of opening index.html directly.";
  }

  if (message.includes("403") || message.includes("401")) {
    return "Steam rejected the request. Double-check the API key, Steam ID64, and that your library visibility allows owned games to be returned.";
  }

  return "Steam import failed. The most common causes are browser-only Steam API restrictions, a private library, or an invalid Steam key or Steam ID64.";
}

function setFormFeedback(message, isError) {
  formFeedback.textContent = message;
  formFeedback.style.color = isError ? "#ffb4b4" : "";
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
