# Exploration: Weather Code Undefined Error

### Current State
Today, the weather state is managed by a module-level state `weatherData` inside the `useWeather.ts` composable:
```typescript
const weatherData = ref<WeatherData | null>(null)
```
This is fetched from `https://baldboy.es/tiempo/datos_meteorologicos.json`.
In the UI, components like `TiempoPortada.vue` and `TiempoDetalleModal.vue` conditionally render content when `weatherData` is truthy (e.g., `v-if="!isLoading && weatherData"`).
However, if the API endpoint returns an error payload (e.g., rate limit JSON `{"error":true,"reason":"Too many concurrent requests"}`), the HTTP fetch itself is successful and parses successfully as JSON. This sets `weatherData.value` to a non-null object that does not conform to the `WeatherData` interface.

As a result:
1. `weatherData` is truthy.
2. The UI attempts to render the components.
3. Computed properties in `useWeather.ts` like `weatherState` try to access properties of `weatherData.value.current` (e.g., `weatherData.value.current.weather_code`), throwing:
   `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'weather_code')`
4. The rendering thread crashes, breaking the weather UI and preventing it from falling back to the skeleton/loading/error state.

### Affected Areas
- `app/composables/useWeather.ts` — The computed properties (`weatherState`, `isDay`, `temperature`, `windSpeed`, `humidity`, `uv`, `imgTiempo`, `weatherDescription`) read properties of `weatherData.value.current` or `weatherData.value.daily` without checking if those child properties actually exist. Also, the `fetchWeather` method sets `weatherData.value` without validating the JSON structure.
- `app/components/TiempoPortada.vue` — Attempts to render the weather card and access computed properties whenever `weatherData` is not null, regardless of whether it represents an error payload.
- `app/components/TiempoDetalleModal.vue` — Tries to read deep nested properties like `weatherData.value.current.time`, `weatherData.value.daily.uv_index_max`, etc., which will throw similar `TypeError` exceptions if `current` or `daily` is missing.

### Approaches

1. **Defensive optional chaining & sensible fallbacks**
   Update all computed properties in `useWeather.ts` to use optional chaining (e.g. `weatherData.value?.current?.weather_code`) and return safe fallback values (e.g., `'sunny'`, `0`, or `''`).
   - Pros: Simple to implement, prevents runtime crashes in the composable itself.
   - Cons: Doesn't prevent components from mounting with invalid/empty states, which might lead to further `TypeError` exceptions inside the modal or layout templates (e.g. `weatherData.value.daily.uv_index_max[0]` in `TiempoDetalleModal.vue`).
   - Effort: Low

2. **Validation of API payload structure during fetch**
   Validate the JSON payload structure in `fetchWeather()` before setting `weatherData.value`. If it contains an error or lacks the expected keys (such as `current` or `daily`), discard it, throw a validation error, and let the `catch` block handle setting `isError.value = true`.
   - Pros: Keeps `weatherData.value` clean and strictly conforming to `WeatherData`. The UI components will automatically remain unmounted (showing the loading/skeleton state) when the API is rate-limited or returns an error.
   - Cons: Does not add defense-in-depth within computed properties if state is mutated or partial.
   - Effort: Low-Medium

3. **Hybrid: API validation + Defensive optional chaining (Recommended)**
   Combine response validation inside the fetch function with safe optional chaining and default fallbacks in the computed properties.
   - Pros: Maximum robustness. Prevents UI components from trying to render invalid rate-limited data, while also protecting the computed properties against future format changes or partial loads.
   - Cons: None (negligible extra code).
   - Effort: Low-Medium

### Recommendation
Adopt **Approach 3 (Hybrid)**:
1. In `useWeather.ts` -> `fetchWeather()`, check that the parsed JSON has `current` and `daily` before saving it to `weatherData.value`. If not (e.g. `data.error` is true, or the keys are missing), throw a validation error.
2. In `useWeather.ts` computed properties, change direct property accesses (e.g., `weatherData.value.current.weather_code` and `weatherData.value?.current.is_day`) to use optional chaining safely (`weatherData.value?.current?.weather_code` and `weatherData.value?.current?.is_day`).

### Risks
- If the API changes its field names or structure, validation will reject the response and show the skeleton loader, but this is far better than a total frontend crash.

### Ready for Proposal
Yes
