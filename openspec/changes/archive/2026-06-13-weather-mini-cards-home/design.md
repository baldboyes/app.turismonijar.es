# Design: Weather Mini Cards Home Hardening

## Technical Approach

Preserve the current home mini-card and detail modal behavior while making the weather runtime contract explicit. The implementation should keep the existing API endpoint, localStorage keys, WMO icon mapping, layout, refresh cadence, retry cadence, and cache-first rendering. Hardening should reshape ownership boundaries around `useWeather.ts`, remove production preview coupling from `TiempoPortada.vue` and `TiempoDetalleModal.vue`, align labels with i18n conventions, and document the feature for future agents.

Current architecture: `app/pages/index.vue` teleports `TiempoPortada` to `body` after beach data is mounted and has no beach error. `TiempoPortada.vue` owns open/close state, starts `fetchWeather()` on mount, renders `WeatherBackground`, then opens `TiempoDetalleModal.vue`. Both card and modal consume module-level refs from `app/composables/useWeather.ts`. That composable hydrates `weather_cached_data` and `weather_last_update_time`, fetches `https://baldboy.es/tiempo/datos_meteorologicos.json` with `cache: 'no-store'`, validates `current` and `daily`, stores successful payloads, schedules 5-minute refreshes, schedules 30-second retries, and currently registers focus/visibility listeners at module evaluation time.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| State ownership | Keep one shared weather runtime in `useWeather.ts`, but wrap lifecycle setup in an explicit singleton controller (`ensureWeatherRuntime()` / cleanup-capable owner). | Move to Pinia now; keep module-level listeners as-is. | Pinia is the project convention, but a full store migration increases behavior risk. A contained singleton preserves shared state and makes listener/timer ownership explicit. |
| Cache-first refresh | Preserve current `weatherData` during forced refreshes and failures; only use skeleton when no data exists. | Clear data before every fetch; introduce a separate stale screen. | The delta spec requires no skeleton replacement during refresh and cached data survival after invalid/network failures. |
| Preview isolation | Remove simulation branches from the production component path; if retained, move fixtures to a dev-only route/story/harness guarded outside `TiempoPortada.vue`. | Keep `simulationMode = ref(false)` in production code. | Disabled flags still leave preview state, labels, and props coupled to production rendering. Isolation reduces accidental exposure. |
| i18n and units | Move words/phrases such as preview labels and `Max` into `weather.*` locale keys if still rendered; keep `%`, `UV`, `km/h`, `mm`, `°`, and cardinal directions as documented locale-neutral meteorological symbols unless product requires localization. | Localize every symbol; keep all literals inline. | Compact universal units are domain symbols and avoid bloating templates, while human-readable labels must follow project i18n rules. |
| Documentation | Add a concise weather architecture note near the feature, referenced from this design. | Rely only on OpenSpec artifacts. | Future agents usually inspect code first; nearby docs reduce rediscovery and protect cache behavior. |

## Data Flow

```text
index.vue gate ──teleport──> TiempoPortada ──opens──> TiempoDetalleModal
                               │                         │
                               └──── useWeather runtime ──┘
                                             │
localStorage cache <── successful fetch ── Weather API
       │                         │
       └── immediate hydrate     └── retry/refresh timers + focus/visibility
```

## File Changes

| File | Action | Description |
|---|---|---|
| `app/composables/useWeather.ts` | Modify | Contain shared runtime lifecycle, listener registration, timer cleanup expectations, cache constants, and exported computed weather contract. |
| `app/components/TiempoPortada.vue` | Modify | Keep visible card behavior; remove production simulation branch; use localized labels/status and documented unit constants. |
| `app/components/TiempoDetalleModal.vue` | Modify | Remove preview props if no longer needed; align remaining words with `weather.*` keys; preserve modal metrics and refresh status. |
| `app/components/WeatherBackground.vue` | Keep/Document | Continue as pure visual consumer of `weatherState`, `isDay`, and `isFixed`. |
| `i18n/locales/es.json`, `i18n/locales/en.json` | Modify | Add any missing user-facing weather labels while preserving existing keys. |
| `docs/weather-mini-cards.md` | Create | Document component roles, API/cache keys, refresh/retry lifecycle, and accepted unit-symbol policy. |
| `openspec/specs/weather.md` | Archive note | Existing main spec is flat (`openspec/specs/weather.md`), so archive must merge the delta there, not into `openspec/specs/weather/spec.md`. |

## Interfaces / Contracts

The composable should continue exposing current consumers' contract: `weatherData`, `isLoading`, `isRefreshing`, `isError`, `lastUpdate`, computed metrics, `weatherState`, `fetchWeather(force?)`, `getWeatherIcon`, and `getWeatherDescription`. Add no behavior-breaking API unless both card and modal migrate together. Runtime setup must be idempotent: multiple consumers must not register duplicate listeners or create competing timers.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Typecheck | Refactor safety for composable/component contracts. | Run `nuxi typecheck` or project type command. |
| Manual browser | Mini-card content, skeleton cold start, modal open/close, status line, background state. | Test with cache present/absent and focus/visibility refresh. |
| Failure simulation | Invalid payload/network failure keeps cached data and schedules retry. | Use mocked fetch/devtools offline during manual verification; document result. |
| i18n review | ES/EN labels render from locale keys; accepted symbols remain stable. | Switch active locale and inspect card/modal. |

## Migration / Rollout

No data migration required. Preserve localStorage keys `weather_cached_data` and `weather_last_update_time`. Roll out as one internal refactor if changed lines remain reviewable; otherwise split lifecycle/i18n/docs into small slices before apply.

## Open Questions

None blocking.
