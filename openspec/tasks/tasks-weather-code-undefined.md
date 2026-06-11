# Tasks: Weather Code Undefined Mitigation & Caching

This document maps out the specific implementation steps required to prevent runtime crashes caused by rate limits and server errors in the weather widgets.

## Phase 1: Foundation

- [x] **1.1 Localize Spanish Messages**
  - Add the following keys to the `"weather"` namespace in `i18n/locales/es.json`:
    - `"last_update": "Última actualización: {time}"`
    - `"refreshing": "Obteniendo información..."`
  - *File*: `i18n/locales/es.json`

- [x] **1.2 Localize English Messages**
  - Add the following keys to the `"weather"` namespace in `i18n/locales/en.json`:
    - `"last_update": "Last update: {time}"`
    - `"refreshing": "Refreshing..."`
  - *File*: `i18n/locales/en.json`

---

## Phase 2: Core Implementation

- [x] **2.1 Add State and Constants to Composable**
  - Add local storage key constants:
    - `WEATHER_DATA_KEY = 'weather_cached_data'`
    - `WEATHER_TIME_KEY = 'weather_last_update_time'`
  - Declare module-scoped variables:
    - `lastUpdate` ref (`number | null`, initially `null`)
    - `isRefreshing` ref (`boolean`, initially `false`)
    - `refreshTimer` (`NodeJS.Timeout | null`, initially `null`)
    - `isInitialized` (`boolean`, initially `false`)
    - `hasFetchedApi` (`boolean`, initially `false`)
  - *File*: `app/composables/useWeather.ts`

- [x] **2.2 Implement Cache Initialization**
  - Create the `initCache()` function inside `useWeather.ts` to execute under client-side conditions:
    - Read `WEATHER_DATA_KEY` and `WEATHER_TIME_KEY` within a `try-catch` block.
    - Set `weatherData.value` and `lastUpdate.value` accordingly.
    - Call `initCache()` inside `useWeather()` setup if not already initialized.
  - *File*: `app/composables/useWeather.ts`

- [x] **2.3 Implement Timer Scheduling**
  - Create a helper `scheduleNext(success: boolean)` inside `useWeather.ts`:
    - Clear any active timeout referenced by `refreshTimer`.
    - If `success` is `true`, schedule the next `fetchWeather(true)` in 5 minutes (300,000ms).
    - If `success` is `false`, schedule the next `fetchWeather(true)` in 30 seconds (30,000ms).
  - *File*: `app/composables/useWeather.ts`

- [x] **2.4 Enhance Fetch with Validation and Retry Logic**
  - Update `fetchWeather(force = false)`:
    - Check if `isRefreshing.value` or `isLoading.value` is true and abort if so.
    - Check if `weatherData.value && !force && hasFetchedApi` and abort if so.
    - Set `isLoading.value = true` only if `weatherData.value` is `null`. Otherwise, set `isRefreshing.value = true`.
    - Validate response: Check if `data.error === true` or if `!data.current || !data.daily`. Throw a validation error if true.
    - On success: Set `weatherData.value` and `lastUpdate.value = Date.now()`, write to `localStorage` (safely caught), reset `isError.value = false`, and set `hasFetchedApi = true`. Call `scheduleNext(true)`.
    - On catch: Set `isError.value = true` ONLY if `weatherData.value` is `null`. Log warning and call `scheduleNext(false)`.
    - On finally: Reset `isLoading.value = false` and `isRefreshing.value = false`.
  - *File*: `app/composables/useWeather.ts`

- [x] **2.5 Register Page/Focus Event Listeners**
  - Register listener in `useWeather.ts` if `process.client` is active:
    - On `window` `focus` and `document` `visibilitychange` (where `document.visibilityState === 'visible'`), call `fetchWeather(true)`.
  - *File*: `app/composables/useWeather.ts`

- [x] **2.6 Implement Defensive Computed Fallbacks**
  - Rewrite all computed properties in `useWeather.ts` using optional chaining and default fallbacks:
    - `isDay`: `weatherData.value?.current?.is_day === 1`
    - `temperature`: `weatherData.value?.current?.temperature_2m ?? 0`
    - `windSpeed`: `weatherData.value?.current?.wind_speed_10m ?? 0`
    - `humidity`: `weatherData.value?.current?.relative_humidity_2m ?? 0`
    - `uv`: `weatherData.value?.daily?.uv_index_max?.[0] ?? 0` (and round it safely)
    - `imgTiempo`: Check `weatherData.value?.current?.weather_code` and fallback to `null` if undefined or code mapping is missing.
    - `weatherDescription`: Check `weatherData.value?.current?.weather_code` and fallback to `''` if undefined or code mapping is missing.
    - `weatherState`: Check `weatherData.value?.current?.weather_code` and return `'sunny'` as fallback.
  - *File*: `app/composables/useWeather.ts`

---

## Phase 3: Integration

- [x] **3.1 Update TiempoPortada Layout & Loader Condition**
  - Change conditional rendering:
    - Show loaded UI template if `weatherData` is truthy (lines 19, 27).
    - Show loading skeleton loader `v-else-if="isLoading || !weatherData"` (line 77).
  - Add `formattedLastUpdate` computed property to format `lastUpdate` to `HH:MM`.
  - Add status indicator below the temperature summary row using classes `text-xs opacity-80 mt-1 text-shadow-sm select-none`:
    - Show `weather.refreshing` when `isRefreshing` is true.
    - Show `weather.last_update` (with time payload) when `lastUpdate` is present.
  - *File*: `app/components/TiempoPortada.vue`

- [x] **3.2 Safeguard TiempoDetalleModal Templates & Add Status Indicator**
  - Update template attributes to safely read nested properties using optional chaining:
    - `weatherData?.daily?.uv_index_max?.[0]`
    - `weatherData?.current?.wind_direction_10m`
    - `weatherData?.current?.precipitation`
    - `weatherData?.daily?.sunrise?.[0]`
    - `weatherData?.daily?.sunset?.[0]`
    - `weatherData?.current?.time`
  - Add status indicator in the hero section below the weather description using `text-xs opacity-80 mt-1 text-shadow-sm select-none`:
    - Show `weather.refreshing` when `isRefreshing` is true.
    - Show `weather.last_update` (with time payload) when `lastUpdate` is present.
  - Ensure the bottom timestamp uses `weatherData?.current?.time` safely.
  - *File*: `app/components/TiempoDetalleModal.vue`

---

## Phase 4: Testing & Verification

- [x] **4.1 Verify Simulation Mode**
  - Set `simulationMode = true` in `TiempoPortada.vue` and verify that all simulated conditions render without throwing console warnings or crashes.
  - Revert `simulationMode = false` before committing.

- [x] **4.2 Verify Mock API Errors**
  - Temporarily mock API response inside `useWeather.ts` to return rate-limiting payloads (e.g. `{"error": true}`).
  - Confirm the UI defaults gracefully to cached `localStorage` data immediately.
  - Verify that the 30-second retry loop kicks off and logs warnings instead of crashing.

- [x] **4.3 Verify Network Offline Support**
  - Block requests using Chrome DevTools or disconnect internet access.
  - Verify that the widget loads cached weather details instead of displaying the loader skeleton forever.

- [x] **4.4 Verify Internationalization Sync**
  - Toggle UI language between Spanish and English.
  - Confirm that the status messages adapt dynamically.

---

## Review Workload Forecast

- **Estimated Changed Lines**: ~200 lines
- **400-Line Budget Risk**: Low (touches ~5 files and ~200 lines total)
- **Chained PRs Recommended**: No
- **Delivery Strategy**: ask-on-risk
