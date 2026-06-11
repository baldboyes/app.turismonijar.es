# Proposal: Weather Code Undefined Mitigation & Caching

## Intent
Prevent runtime crashes in the weather UI components (`TiempoPortada.vue` and `TiempoDetalleModal.vue`) caused by API rate-limiting payloads (e.g. `{"error":true,"reason":"Too many concurrent requests"}`). This proposal details the implementation of API payload validation, defensive optional chaining, local storage caching as a fallback, background reload retry loops, and clear UI update indicators.

## Scope
### In Scope
- **API Payload Validation**: Discard incoming API payloads in `fetchWeather()` if they contain an `error` key or lack the expected `current`/`daily` structures.
- **Local Cache Storage**: Persist the last successfully retrieved weather data and timestamp to `localStorage` (client-side only).
- **Safe Computed Fallbacks**: Update all computed properties in `useWeather.ts` to use optional chaining (`weatherData.value?.current?.weather_code`) and return safe fallback values.
- **Connection Retry & Reload**:
  - Automatically retry fetching every 30 seconds if the last fetch failed or was rate-limited.
  - Listen for window `focus` and `visibilitychange` events to trigger background updates when the user returns to the tab/app.
- **UI Indicators**:
  - Render a `text-xs` status message indicating either the last update time ("Última actualización: HH:MM") or the active refresh state ("Obteniendo información...").
  - Update rendering logic so the loader skeleton only displays when no weather data (cached or live) is available, preventing UI flicker during background refreshes.
- **Internationalization**: Localize the status messages in `es.json` and `en.json` under the `weather` namespace.

### Out of Scope
- Migrating to a different weather data provider.
- Adjusting the look and feel of the primary weather graphics or charts beyond adding the status indicators.
- Offline support using Service Workers or databases.

## Approach
### 1. Storage & Initialization
- Initialize module-level refs `weatherData` and a new `lastUpdate` ref from `localStorage` inside `useWeather.ts` (wrapped in `process.client` checks).
- Define helper constants for storage keys:
  - `WEATHER_DATA_KEY = 'weather_cached_data'`
  - `WEATHER_TIME_KEY = 'weather_last_update_time'`

### 2. Validation & Background Fetching
- Introduce `isRefreshing` ref to track background fetches.
- Modify `fetchWeather(force = false)`:
  - Skip execution if `isRefreshing.value` is true.
  - If we have no cached `weatherData`, set `isLoading.value = true` (triggers skeleton). Otherwise, set `isRefreshing.value = true`.
  - Validate response: Check if `data.error` is true or if `!data.current || !data.daily`. If invalid, throw a validation error.
  - On success:
    - Save to `weatherData.value` and update `lastUpdate.value = Date.now()`.
    - Write to `localStorage`.
    - Reset error states (`isError.value = false`).
  - On failure:
    - Print warning to console.
    - If `weatherData.value` is null, set `isError.value = true`.
  - Finally: Set `isLoading.value = false` and `isRefreshing.value = false`.

### 3. Connection Retry & Focus Listeners
- Maintain a global interval or timeout reference in the module.
- If a fetch fails, schedule a retry in 30 seconds. If a fetch succeeds, clear the retry timer and schedule the next check for 5 minutes later.
- Add event listeners for `focus` and `visibilitychange` to trigger `fetchWeather(true)` in the background (avoiding UI blocking).

### 4. Computed Safety
- Apply defensive optional chaining in `useWeather.ts` computed properties:
  - `isDay`
  - `temperature`
  - `windSpeed`
  - `humidity`
  - `uv`
  - `imgTiempo`
  - `weatherDescription`
  - `weatherState`

### 5. UI Indicators & Locales
- Add translations:
  - Spanish (`es.json`):
    - `"last_update": "Última actualización: {time}"`
    - `"refreshing": "Obteniendo información..."`
  - English (`en.json`):
    - `"last_update": "Last update: {time}"`
    - `"refreshing": "Refreshing..."`
- Insert status messages inside `TiempoPortada.vue` (below the temperature summary row) and `TiempoDetalleModal.vue` (below the current condition title) with styling class `text-xs opacity-80 mt-1`.

## Affected Areas
| Area | Impact | Description |
|------|--------|-------------|
| `app/composables/useWeather.ts` | Modified | Add payload validation, cache read/write, optional chaining, retry/reload loops, and export status flags. |
| `app/components/TiempoPortada.vue` | Modified | Adjust skeleton display condition to check `!weatherData`, and render the refresh/update time indicator. |
| `app/components/TiempoDetalleModal.vue` | Modified | Render the refresh/update time indicator below the main condition hero block. |
| `i18n/locales/es.json` | Modified | Add translations for `weather.last_update` and `weather.refreshing`. |
| `i18n/locales/en.json` | Modified | Add translations for `weather.last_update` and `weather.refreshing`. |

## Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| localStorage access issues (e.g. private browsing, Capacitor sandbox constraints) | Low | Wrap storage calls in try-catch blocks to fallback gracefully to in-memory state. |
| API structural changes trigger validation failure | Low | Logs will capture validation failures. Since cached data will stay active, this prevents crashes while developer inspects. |
| Excessive API rate limiting due to retry loop | Med | Ensure retry timer only triggers on error/failure states, and successful states default to a longer 5-minute interval. |

## Rollback Plan
Run the following git commands to undo changes:
```bash
git checkout -- app/composables/useWeather.ts app/components/TiempoPortada.vue app/components/TiempoDetalleModal.vue i18n/locales/es.json i18n/locales/en.json
```

## Success Criteria
- [ ] No application crashes occur when the Weather API returns a rate-limit error response.
- [ ] Weather widget renders successfully using cached data from `localStorage` in case of rate-limiting/network error.
- [ ] UI shows "Obteniendo información..." during background refresh, and a formatted last update indicator (e.g., "Última actualización: 10:45") upon completion.
- [ ] Reconnection retry runs every 30 seconds after failures, and updates are triggered on tab focus/visibility change.
- [ ] Locales are synced across both English and Spanish files.
