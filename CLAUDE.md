# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

No build step, no bundler, no package manager. All JS files are plain scripts loaded in `<script src>` order in `index.html`.

Syntax-check JS without a browser:
```bash
node --check js/components/program.js
# or all at once:
for f in js/**/*.js js/*.js; do node --check "$f"; done
```

## Architecture

### State — `js/store.js`

Single global object `S` holds all app state, persisted to `localStorage` under key `ft_v10`.

```js
S = {
  maxes,        // { [exId]: { kg, inc } } — starting weight & weekly increment per exercise
  weekData,     // { 'w0': { 'd0': { [exId]: { s1, s2, ..., targetMet } } } }
  setDrafts,    // in-progress set values not yet saved: { 'w0_d0_exId': { s1, s2 } }
  workoutSessions, // { 'w0_d0': { start: ms, end: ms|null } }
  exerciseSwaps,   // { 'w0': { 'd0': { [exId]: { altIdx, customName } } } }
  streak, prs, weeklyWeights, explanations,
  nutrition: { customFoods, dailyLog, goal },
  profile, theme, notifEnabled
}
```

`saveS()` writes to localStorage and prompts for export every 50 saves. `loadS()` falls back through `ft_v9` → `ft_v8` for backwards compatibility.

### Exercise Data — `js/data.js`

`EX` object maps exercise IDs (e.g. `g1_cp`, `g2_lp`) to descriptors:
```js
{ id, name, scheme, sets, reps, repType, hasWeight, rmMult, alts[], gifUrl }
```
`repType` is one of `"fixed"` / `"range"` / `"plus"` / `"max"`. Weight-based exercises have `hasWeight: true` and an `rmMult` used to calculate the starting 1RM percentage.

`DAYS` is a 3-element array of exercise ID arrays: `DAYS[0]` = Gün 1, `DAYS[1]` = Gün 2, `DAYS[2]` = Gün 3.

`EXERCISE_GIFS` maps display names to GitHub raw URLs.

### Progressive Overload Logic — `js/utils.js`

`getKgAt(exId, weekIdx)` computes the current working weight by starting from `S.maxes[exId].kg` and adding `inc` for every week where `exCompletedInWeek` returns true (i.e. `targetMet === true`). Weights are rounded to nearest 2.5 kg via `mround25`.

### Set Save Flow — `js/components/program.js`

Two save paths:
- **`autoSaveSets`** (on `blur`): saves silently when all sets are filled, auto-completes the day when all exercises are done.
- **`saveDynamicDone`** (manual button): allows saving with empty sets after a confirm dialog.

Both call `startWorkoutIfNeeded(w,d)` on first save for a day, and `finishWorkout(w,d)` when all day exercises complete. `workoutDuration` returns null for sessions open > 6 hours (stale guard). `undoDone` resets the session if all exercises are removed.

### Workout Session Timer — `js/components/program-helpers.js`

`workoutSessions['w0_d0'] = { start: Date.now(), end: null }`. End is set by `finishWorkout`. Duration is only shown if either the session has an end, or it started < 6 hours ago.

### Nutrition — `js/components/nutrition.js`

Daily log key: `todayStr()` → `'YYYY-MM-DD'`. Data lives in `S.nutrition.dailyLog[dateKey][mealKey][]`.

Food add tabs: `search` (OpenFoodFacts API via `fetchWithRetry` in `js/api.js`) → `saved` → `recent` → `tarif` (recipe/portion) → `ai` (paste from ChatGPT/Claude, regex parser) → `photo` (CalorieNinja image API).

AI paste parser (`parseAiPaste`) strips markdown bold, handles `~` prefix and en-dash ranges (uses midpoint), and extracts name from the first non-macro line.

### Swap System — `js/components/swap.js`

Per-week-per-day exercise swaps stored in `S.exerciseSwaps['w'+w]['d'+d][exId] = { altIdx, customName }`. `getSwap(exId, w, d)` returns the active swap. `getSwapName` resolves the display name.

### CSS Architecture

Each CSS file is scoped to one feature. No preprocessor — plain CSS variables defined in `css/base.css` under `:root` and `[data-theme="light"]`. Never add inline `<style>` to `index.html`.

### Service Worker

`sw.js` must stay at root (scope is `/fitness/`). The inline blob-based SW registration that was previously in `index.html` has been removed — only `js/sw-register.js` registers it. Cache key follows semver: `fittrack-v2.x.x`.

## Version Bumping

Version is displayed in `index.html` as `Sürüm X.Y.Z` inside a `</div>`. GitHub Actions (`version-bump.yml`) auto-increments patch on every push to `main` unless the commit message contains `chore: bump version`. The workflow reads the version with regex `(\d+\.\d+\.\d+)</div>`, replaces `Sürüm {old}` with `Sürüm {new}`, and commits directly — no temp files.

## Key Patterns

- **All JS is global scope** — functions defined in any `js/` file are available everywhere. Load order in `index.html` matters (`data.js` → `store.js` → `utils.js` → `api.js` → components → `init.js` → `sw-register.js`).
- **Re-render on save** — `saveS(); renderProgram(); renderProgress();` is the standard pattern after any state change. Components do full innerHTML re-renders, not diffing.
- **Modal pattern** — `.mo` + `.ms` for overlays (`display:flex` when `.open` class added). `.ob` for full-screen onboarding overlays (`position:fixed;inset:0`).
- **No build-time type safety** — exercise IDs like `g1_cp` are raw strings; always cross-reference with `EX[id]` before use.
- **Turkish locale** — UI strings are Turkish. Use `normalizeUppercaseText()` (in `utils.js`) for Turkish-correct uppercase instead of `.toUpperCase()`.
