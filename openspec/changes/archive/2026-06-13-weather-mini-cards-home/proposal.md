# Proposal: Weather Mini Cards Home Hardening

## Intent

Reduce maintenance risks in the home weather mini card while preserving current visible behavior. The change clarifies how the card, modal, weather composable, cache, refresh loop, and i18n strings are built so future agents can modify the feature safely.

## Scope

### In Scope
- Reduce implicit module-level/global coupling in `useWeather.ts`, especially lifecycle listeners and shared mutable weather state.
- Align weather mini-card labels, units, and symbols with project i18n conventions, or explicitly document justified domain symbols.
- Remove `simulationMode` from production rendering or isolate it as non-production/dev-only behavior.
- Document the feature architecture, data flow, cache behavior, refresh/retry behavior, and component responsibilities.
- Preserve current visible behavior unless a small adjustment is required to satisfy the conventions above.

### Out of Scope
- Changing the weather API source or payload format.
- Redesigning the card/modal visuals beyond required cleanup.
- Replacing the whole weather feature with a new store architecture unless needed to remove current coupling.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `weather`: Clarify requirements for weather mini-card state ownership, production-safe rendering, i18n/units handling, and documentation of the home weather architecture.

## Approach

Keep the existing user experience and cache-first behavior. Harden the internals by making shared weather state/listener ownership explicit, moving or documenting remaining display literals according to i18n rules, and isolating preview/simulation concerns outside the production component path. Add concise technical documentation for the component/composable relationship and runtime behavior.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/composables/useWeather.ts` | Modified | Weather state, cache, refresh/retry loop, listener lifecycle, computed values. |
| `app/components/TiempoPortada.vue` | Modified | Mini-card rendering, badges, status line, simulation isolation. |
| `app/components/TiempoDetalleModal.vue` | Modified | Shared weather values and labels/units consistency. |
| `app/components/WeatherBackground.vue` | Modified | Documented consumer of simplified weather state if needed. |
| `i18n/locales/es.json` | Modified | Weather strings/labels/units alignment. |
| `i18n/locales/en.json` | Modified | Weather strings/labels/units alignment. |
| `openspec/specs/weather.md` | Modified | Existing weather capability requirements will receive deltas. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Refactor breaks cache-first loading or retry behavior | Medium | Preserve existing requirements and add targeted verification scenarios. |
| Over-localizing universal units harms readability | Low | Document accepted domain symbols when not localized. |
| Removing simulation mode affects developer preview workflows | Medium | Move it to a dev-only path or document the replacement workflow. |

## Rollback Plan

Revert the weather composable/component/i18n changes and restore the previous `TiempoPortada.vue`, `TiempoDetalleModal.vue`, `WeatherBackground.vue`, and `useWeather.ts` behavior. Existing localStorage weather cache keys remain compatible and require no migration rollback.

## Dependencies

- Existing weather API endpoint and localStorage cache keys remain unchanged.
- Existing `weather` OpenSpec capability is the source of truth for cache, validation, and status behavior.

## Success Criteria

- [ ] Current home weather mini-card and detail modal visible behavior is preserved.
- [ ] Shared weather state and event listener lifecycle are explicit and documented.
- [ ] Production component path contains no unisolated simulation behavior.
- [ ] Weather labels/units follow i18n conventions or have documented domain-symbol justification.
- [ ] Future agents can understand the feature architecture from the SDD artifacts.
