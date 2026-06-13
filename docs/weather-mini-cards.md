# Weather Mini Cards Architecture

The home weather mini card is a cache-first, shared-runtime weather surface. It keeps the current visible behavior stable while making ownership, refresh, and i18n rules explicit for future maintenance.

## Quick path

1. Start at `app/pages/index.vue`: the page teleports `TiempoPortada` after beach data has loaded successfully.
2. Follow `TiempoPortada.vue`: the closed card renders the compact metrics and opens `TiempoDetalleModal.vue`.
3. Follow `useWeather.ts`: every weather UI reads the same shared refs, cache keys, and refresh loop.

## Component roles

| File | Responsibility |
|------|----------------|
| `app/pages/index.vue` | Gates the weather card behind the home page mounted/success state and teleports it to `body`. |
| `app/components/TiempoPortada.vue` | Renders the closed mini card, skeleton state, refresh/error status, and open/close transition. It triggers the initial `fetchWeather()` call on mount. |
| `app/components/TiempoDetalleModal.vue` | Renders the expanded weather detail view from the same shared weather state. It does not own independent weather data. |
| `app/components/WeatherBackground.vue` | Pure visual consumer of `weatherState`, `isDay`, and `isFixed`; it does not fetch or mutate weather state. |
| `app/composables/useWeather.ts` | Owns the shared weather refs, browser runtime setup, cache hydration, API fetch, retry/refresh timer, and focus/visibility listeners. |

## Data flow

```text
index.vue gate ──teleport──> TiempoPortada ──opens──> TiempoDetalleModal
                               │                         │
                               └──── useWeather runtime ──┘
                                             │
localStorage cache <── successful fetch ── Weather API
       │                         │
       └── immediate hydrate     └── retry/refresh timers + focus/visibility
```

## Runtime contract

| Topic | Contract |
|-------|----------|
| API endpoint | `https://baldboy.es/tiempo/datos_meteorologicos.json` fetched with `cache: 'no-store'`. |
| Cache keys | `weather_cached_data` and `weather_last_update_time`. Keep these stable unless a migration is planned. |
| Shared refs | `weatherData`, `isLoading`, `isRefreshing`, `isError`, and `lastUpdate` are module-level refs shared by all consumers. |
| Initial load | The skeleton is only for the no-data loading state. Cached data should hydrate immediately when available. |
| Refresh cadence | Successful fetches schedule the next refresh after `WEATHER_REFRESH_INTERVAL_MS` (5 minutes). |
| Retry cadence | Failed or invalid payload refreshes keep existing data visible and schedule retry after `WEATHER_RETRY_INTERVAL_MS` (30 seconds). |
| Listener lifecycle | `ensureWeatherRuntime()` registers one app-lifetime focus/visibility listener pair. `cleanupWeatherRuntime()` exists for tests or dev harnesses, not normal production teardown. |
| Preview behavior | Production weather components must not contain reachable simulation controls, labels, or fixture toggles. Use a separate non-production harness if preview fixtures are needed. |

## i18n and unit policy

User-facing words and phrases belong under `weather.*` in `i18n/locales/es.json` and `i18n/locales/en.json`.

Compact meteorological symbols are intentionally locale-neutral and may stay near the rendering code when they are used as units:

- `%`
- `UV`
- `km/h`
- `mm`
- `°` / `°C`
- cardinal wind directions such as `N`, `NE`, `E`, `SE`, `S`, `SW`, `W`, `NW`

If product copy changes from symbols to readable words, move the new words into locale keys.

## Maintenance checklist

- Preserve cache-first rendering: never clear `weatherData` before a background refresh.
- Keep one weather runtime owner: do not add component-local focus/visibility listeners for weather refresh.
- Keep the closed mini card content stable: wind speed, UV index, humidity, icon, temperature, and status text.
- Keep the modal reading the shared composable state instead of accepting fixture or simulation props.
- Re-run `npm run build`, `npx nuxi typecheck`, and `git diff --check` after weather changes.
