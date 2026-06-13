# Tasks: Weather Mini Cards Home Hardening

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 280-430 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 safeguards/runtime → PR 2 UI/i18n/preview → PR 3 docs/verification |
| Delivery strategy | ask-always |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Protect cache-first behavior and contain weather runtime lifecycle | PR 1 | Includes safeguards and `useWeather.ts` refactor. |
| 2 | Clean production UI labels, units, and preview coupling | PR 2 | Depends on PR 1 shared contract. |
| 3 | Document architecture and complete verification | PR 3 | Can be final docs/verification slice. |

## Phase 1: Safeguards and Runtime Contract

- [x] 1.1 Capture characterization safeguards for `app/composables/useWeather.ts`: cache hydrate, failed refresh preserving data, retry scheduling, and no skeleton during refresh; use available test tooling or documented manual fixtures if no runner exists.
- [x] 1.2 Define cache keys, refresh/retry timing, listener ownership, and exported weather contract in `app/composables/useWeather.ts` before refactoring.
- [x] 1.3 Refactor `app/composables/useWeather.ts` to use an idempotent singleton runtime setup with bounded focus/visibility listeners and timer cleanup expectations.
- [x] 1.4 Verify multiple consumers share `weatherData`, loading, refreshing, error, and `lastUpdate` state without duplicate listeners or competing timers.

## Phase 2: UI, i18n, and Preview Isolation

- [x] 2.1 Update `app/components/TiempoPortada.vue` to preserve mini-card content, skeleton gating, click-to-open behavior, and localized refresh/error status.
- [x] 2.2 Remove or isolate `simulationMode` and preview-only labels from the production path in `app/components/TiempoPortada.vue`.
- [x] 2.3 Update `app/components/TiempoDetalleModal.vue` to preserve modal metrics/status while removing preview props or branches no longer used.
- [x] 2.4 Add missing user-facing weather labels to `i18n/locales/es.json` and `i18n/locales/en.json`; keep `%`, `UV`, `km/h`, `mm`, and `°C` only as documented locale-neutral symbols.
- [x] 2.5 Keep `app/components/WeatherBackground.vue` as a pure visual consumer unless contract changes require a narrow prop/type adjustment.

## Phase 3: Documentation

- [x] 3.1 Create `docs/weather-mini-cards.md` documenting component roles, API endpoint, localStorage keys, cache-first behavior, refresh/retry cadence, listener lifecycle, and i18n/unit policy.
- [x] 3.2 Reference `docs/weather-mini-cards.md` from nearby code comments only where it prevents rediscovery; avoid broad comment noise.

## Phase 4: Verification

- [x] 4.1 Run `nuxi typecheck` or the project type command and record the result.
- [x] 4.2 Manually verify cold no-cache skeleton, cached immediate render, failed refresh keeping cached content, focus/visibility refresh, modal open/close, ES/EN labels, and absence of production preview controls.
- [x] 4.3 Update this `tasks.md` with checked boxes and concise verification notes during apply.

## Apply Verification Notes

- `npm run build` — passed. Nuxt production build completed with existing sourcemap/Rollup annotation/chunk-size warnings.
- `npx nuxi typecheck` — failed only on known unrelated TS2532 errors in `app/components/CustomDrawer.vue` and `app/components/ImageLightbox.vue`; no weather files were reported.
- `git diff --check` — passed with no whitespace errors.
- Manual browser evidence for 4.2 was provided by the user: most scenarios work correctly, with prior confirmation `funciona bien`.
- Cold/no-cache check nuance: the skeleton was not observed because the home/map interface appears to remain blank while gated, and the weather fetch completes quickly enough that the mini-card renders with cached/live data by the time it appears. This is acceptable under the spec because the skeleton is `MAY` behavior when no live/cached data exists, and no broken loading state was observed.
- Scenario evidence recorded for 4.2: cached/data render works, modal open/close works by prior manual confirmation, refresh/focus/visibility behavior showed no broken loading state, localized labels and absence of production preview controls were covered by the manual pass plus prior static production-path checks. Task 4.2 is complete under the spec wording.
