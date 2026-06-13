# Apply Progress: Weather Mini Cards Home

## Status

- Mode: Standard (strict_tdd is false in `openspec/config.yaml`; no unit/integration/e2e runner is configured)
- Delivery: chained PR slice, stacked-to-main
- Current slice: PR 3 documentation and final verification evidence
- Tasks complete: 14/14

## Completed Work

- [x] 1.1 Captured characterization safeguards for cache hydrate, failed refresh preserving data, retry scheduling, and no skeleton during refresh using code-level safeguards plus available static/build validation.
- [x] 1.2 Defined weather cache keys, refresh/retry timing constants, app-lifetime listener ownership, cleanup expectations, and the shared weather state contract in `app/composables/useWeather.ts`.
- [x] 1.3 Refactored `app/composables/useWeather.ts` to use `ensureWeatherRuntime()` as an idempotent singleton setup and `cleanupWeatherRuntime()` as an explicit cleanup hook for tests/dev harnesses.
- [x] 1.4 Verified by implementation review that all consumers still share module-level `weatherData`, `isLoading`, `isRefreshing`, `isError`, and `lastUpdate` refs while listener/timer ownership is bounded to one runtime.
- [x] 2.1 Updated `app/components/TiempoPortada.vue` while preserving loaded mini-card metrics, skeleton gating, click-to-open behavior, and localized refresh/error status.
- [x] 2.2 Removed `simulationMode`, preview fixtures, preview labels, and simulated-detail handlers from the production `TiempoPortada.vue` path.
- [x] 2.3 Updated `app/components/TiempoDetalleModal.vue` to preserve modal metrics/status while removing simulated preview props/branches.
- [x] 2.4 Added `weather.uv_max` and `weather.last_update_label` to both ES/EN locale files; retained compact `%`, `UV`, `km/h`, `mm`, and degree symbols as documented locale-neutral meteorological units.
- [x] 2.5 Kept `app/components/WeatherBackground.vue` unchanged as a pure visual consumer; no contract adjustment was required.
- [x] 3.1 Created `docs/weather-mini-cards.md` documenting component roles, API endpoint, localStorage cache keys, cache-first behavior, refresh/retry cadence, listener lifecycle, preview isolation, and i18n/unit policy.
- [x] 3.2 Added one targeted code reference from `app/composables/useWeather.ts` to `docs/weather-mini-cards.md` near the shared cache/runtime contract to prevent rediscovery without broad comment noise.
- [x] 4.1 Ran the project validation commands and recorded results below.
- [x] 4.2 Recorded user-provided manual browser evidence. Most scenarios work correctly; the cold/no-cache skeleton was not visibly observed because home/map gating plus a fast weather fetch meant the mini-card rendered with data by the time it appeared, which is acceptable because skeleton display is MAY behavior and no broken loading state was observed.
- [x] 4.3 Updated `tasks.md` checkboxes and verification notes during apply.

## Pending Work

- None.

## Verification Evidence

- `npx nuxi typecheck` — failed due existing unrelated strict-null errors in `app/components/CustomDrawer.vue` and `app/components/ImageLightbox.vue`; no weather files were reported in the error output.
- `npm run build` — passed. Nuxt production build completed; warnings were sourcemap/chunk-size/Rollup annotation related and not caused by this weather UI/i18n slice.
- `npm run build` — passed again for PR 3 after documentation/reference changes; warnings remained sourcemap/Rollup annotation/chunk-size related.
- `npx nuxi typecheck` — failed again only due the known unrelated TS2532 errors in `app/components/CustomDrawer.vue` and `app/components/ImageLightbox.vue`; no weather files were reported in the error output.
- `git diff --check` — passed with no whitespace errors.
- Static production-path check — `simulationMode`, `previewStates`, `simulatedState`, `simulatedIsDay`, and the Spanish preview fixture labels were removed from `TiempoPortada.vue` / `TiempoDetalleModal.vue`; a remaining `last_update_label` match exists only in unrelated `CustomDrawer.vue`.
- Characterization limitation: package.json has no unit, integration, e2e, lint, or test script, so PR 2 validation is static/build validation rather than executable unit tests.
- Manual browser evidence for task 4.2 was provided by the user: most scenarios work correctly, with prior confirmation `funciona bien`.
- Cold/no-cache nuance: the skeleton was not observed because the home/map interface appears to remain blank while gated, and the weather request completes quickly enough that the mini-card renders with live/cached data by the time it appears. This satisfies the spec because skeleton display is `MAY` behavior when no live/cached data exists, not a mandatory visible state, and no broken loading state was observed.
- Scenario-specific 4.2 conclusion: cached/data render, modal open/close, refresh/focus/visibility behavior, ES/EN labels, and absence of production preview controls are accepted based on the user's manual pass plus prior static production-path checks. Task 4.2 is complete under the delta spec wording.

## Changed Files

- `app/components/TiempoPortada.vue` — removed production-coupled simulation/preview rendering and handlers; preserved mini-card rendering and moved compact units behind documented constants.
- `app/components/TiempoDetalleModal.vue` — removed simulated preview props/branches; localized `Max` and last-update label; moved compact metric units behind documented constants.
- `i18n/locales/es.json` — added missing `weather.uv_max` and `weather.last_update_label` keys.
- `i18n/locales/en.json` — added missing `weather.uv_max` and `weather.last_update_label` keys.
- `docs/weather-mini-cards.md` — created weather mini-card architecture and maintenance guide for future agents.
- `app/composables/useWeather.ts` — added a targeted nearby reference to the weather architecture guide at the shared runtime/cache contract.
- `openspec/changes/weather-mini-cards-home/tasks.md` — recorded `stacked-to-main` chain strategy and marked PR 2 tasks 2.1 through 2.5 complete.
- `openspec/changes/weather-mini-cards-home/tasks.md` — marked PR 3 documentation and command-verification tasks complete.
- `openspec/changes/weather-mini-cards-home/tasks.md` — recorded scenario-specific user manual evidence for task 4.2, including the acceptable cold/no-cache skeleton nuance, and marked 4.2 complete.
- `openspec/changes/weather-mini-cards-home/apply-progress.md` — merged PR 1, PR 2, and PR 3 progress with validation evidence.
- `openspec/changes/weather-mini-cards-home/apply-progress.md` — updated final task count to 14/14 and recorded task 4.2 completion evidence.

## Next Recommendation

Proceed to `sdd-verify` for final artifact validation, then archive if verification passes.

## Risks / Notes

- Typecheck remains blocked by unrelated pre-existing errors outside the weather feature.
- Cold/no-cache skeleton was not visibly observed, but this is acceptable because the spec says the skeleton MAY show while loading with no live/cached data; the observed path rendered weather data by the time the mini-card appeared and showed no broken loading state.
- The working tree includes unrelated pre-existing changes in `.atl/skill-registry.md`, `app/pages/ajustes.vue`, and `package-lock.json`; this PR 3 slice did not modify them.
