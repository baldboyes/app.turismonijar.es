## Exploration: Weather Mini Cards on Home Page

### Current State
The home page renders the weather mini card through `app/pages/index.vue`, which teleports `<TiempoPortada />` to `body` only after the beach map data is mounted and neither the beach loading nor beach error overlay is active. The mini card itself is `app/components/TiempoPortada.vue`; it is a fixed, rounded card in the top-left safe-area region (`224px x 104px`) and expands into a full-screen detail view when clicked.

Weather state is centralized in `app/composables/useWeather.ts` using module-level Vue refs, so every `useWeather()` consumer shares the same data, loading, refresh, error, and cache state. `TiempoPortada.vue` calls `fetchWeather()` on mount and renders either live/cached weather content or a skeleton loader.

The weather source is `https://baldboy.es/tiempo/datos_meteorologicos.json`, fetched with `cache: 'no-store'`. Successful responses are validated for `current` and `daily`, stored in `weatherData`, timestamped in `lastUpdate`, and cached in `localStorage` under `weather_cached_data` and `weather_last_update_time`. Invalid payloads, HTTP failures, and network errors set `isError` while keeping any existing cached weather data.

The mini card renders three top badges from computed weather values: wind speed, UV index, and humidity. The bottom summary renders an OpenWeather icon URL mapped from WMO weather codes, the current temperature, and a small localized status line when refreshing or when stale cached data is being shown after an error. The card opens `TiempoDetalleModal.vue`, which reuses the same composable for detailed hourly forecast, metrics, sunrise/sunset, and status indicators.

Visual weather state is reduced from WMO codes into `sunny`, `cloudy`, `rainy`, or `snowy` via `weatherState` in `useWeather.ts`. `WeatherBackground.vue` receives that state plus `isDay` and renders the animated gradient, clouds, rain, solar flare, moon, or stars. The card and modal also apply darker translucent boxes for cloudy/rainy daytime conditions to preserve contrast.

Labels and content come mostly from `i18n/locales/es.json` and `i18n/locales/en.json` under the `weather` namespace. Weather icon descriptions are stored as i18n keys in the `wmoIconCode` map in `useWeather.ts`; badges and units such as `km/h`, `%`, `UV`, `mm`, and `Max:` are currently hardcoded in the Vue templates.

Loading and error behavior is intentionally cache-first: on first launch with no cache, `isLoading` shows the mini-card skeleton until valid data arrives. With cached data, the UI renders immediately and background refreshes set `isRefreshing` instead of replacing content with the skeleton. Failed fetches schedule a retry after 30 seconds; successful fetches schedule the next refresh after 5 minutes. Focus and visibility events trigger `fetchWeather(true)` when the document is visible.

### Affected Areas
- `app/pages/index.vue` — Mounts and teleports `TiempoPortada` onto the home page after the beach data gate succeeds.
- `app/components/TiempoPortada.vue` — Main mini card UI, loading skeleton, click-to-open behavior, status line, live badges, weather icon, temperature, simulation preview mode, and transition to detail view.
- `app/components/TiempoDetalleModal.vue` — Full-screen detail view opened from the mini card; reuses the same weather state and rendering helpers for hourly forecast and weather metrics.
- `app/components/WeatherBackground.vue` — Animated background renderer driven by simplified weather state and day/night mode.
- `app/composables/useWeather.ts` — Shared weather store/composable, API fetch, payload validation, cache hydration/persistence, retry scheduling, computed weather values, WMO-code mappings, icon URLs, and localized descriptions.
- `i18n/locales/es.json` — Spanish weather labels, descriptions, status strings, and modal labels.
- `i18n/locales/en.json` — English weather labels, descriptions, status strings, and modal labels.
- `openspec/specs/weather.md` — Existing OpenSpec requirements for weather payload validation, cache fallback, refresh loops, and UI status indicators.

### Approaches
1. **Keep current implementation and document behavior** — No application changes; treat this exploration as the map of how the current mini cards work.
   - Pros: No product risk; current behavior already matches the existing weather stability spec.
   - Cons: Existing hardcoded units/labels and module-level event listeners remain as-is.
   - Effort: Low

2. **Future cleanup: extract presentation subcomponents and constants** — If later changes are requested, split badge rows, status line, and weather code mapping into smaller units.
   - Pros: Reduces `TiempoPortada.vue`/`TiempoDetalleModal.vue` size and improves testability/readability.
   - Cons: Adds refactor scope without changing user-visible behavior.
   - Effort: Medium

3. **Future i18n/style hardening** — Localize remaining hardcoded template text/units where appropriate and centralize status formatting.
   - Pros: Better consistency with the project convention of no hardcoded strings.
   - Cons: Units such as `km/h`, `%`, and `UV` may be acceptable domain symbols; changing them needs product judgment.
   - Effort: Low to Medium

### Recommendation
For this exploration topic, keep the current implementation unchanged and use this artifact as the technical map. If a follow-up proposal is needed, the most valuable next step would be a small cleanup proposal focused on i18n consistency and component decomposition, not a weather data-flow rewrite.

### Risks
- `useWeather.ts` registers global `focus` and `visibilitychange` listeners at module evaluation time and does not remove them; this is acceptable in SPA lifetime usage but is a lifecycle coupling to be aware of.
- `TiempoPortada.vue` contains a `simulationMode` toggle and hardcoded Spanish preview labels; it is disabled in production but lives in the production component.
- Several units and small labels are hardcoded in templates despite the OpenSpec config convention preferring no hardcoded UI strings.
- `weatherData` is shared via module-level refs rather than Pinia; this works but is an implicit state pattern separate from the configured state-management convention.

### Ready for Proposal
No — not for the original question, because this was an explanatory exploration. Yes only if the user wants to change behavior, refactor the card/modal, or enforce stricter i18n/component conventions.
