# Specification: Weather Code Undefined Mitigation & Caching

This specification defines the requirements and behavior scenarios for preventing runtime crashes and ensuring UI stability in the weather components of the application. 

**Reference Proposal**: [proposal-weather-code-undefined.md](file:///Users/baldboy/desarrollo/nijar/app.turismonijar.es/openspec/designs/proposal-weather-code-undefined.md)
**Status**: Proposed
**Date**: 2026-06-11

---

## 1. Functional Requirements

### 1.1 API Payload Validation
- **1.1.1** The `fetchWeather` action in `useWeather.ts` MUST validate the structure of the JSON payload before updating the `weatherData` state.
- **1.1.2** A payload MUST be considered invalid if it:
  - Contains an `error` boolean key set to `true`, OR
  - Lacks the `current` object, OR
  - Lacks the `daily` object.
- **1.1.3** If the payload is invalid, `fetchWeather` MUST throw a validation error and MUST NOT update the `weatherData` state.

### 1.2 Cache Storage & Fallback
- **1.2.1** The system MUST persist successfully fetched weather data and the fetch timestamp to client-side local storage (`localStorage`).
- **1.2.2** The local storage keys MUST be:
  - `weather_cached_data`: For the serialized weather JSON object.
  - `weather_last_update_time`: For the numeric timestamp representing when the fetch succeeded.
- **1.2.3** All `localStorage` read and write operations MUST be wrapped in safety blocks (e.g., `try-catch`) to fallback to in-memory state if `localStorage` access is blocked or unavailable.
- **1.2.4** On initialization, the system MUST retrieve the cached weather data and timestamp from `localStorage` to populate the initial state.
- **1.2.5** If the API endpoint fails to respond or returns an invalid payload, the system MUST retain the cached data as the active state to prevent the UI from going blank or displaying error skeletons when data was previously available.

### 1.3 Safe Computed Properties
- **1.3.1** All computed properties in `useWeather.ts` that depend on `weatherData` MUST use optional chaining to access nested fields (e.g. `weatherData.value?.current?.weather_code`).
- **1.3.2** Every computed property MUST define a safe fallback value if the referenced field is missing or undefined. Specifically:
  - `temperature`, `windSpeed`, `humidity`, and `uv` MUST fallback to `0` or numeric equivalents.
  - `weatherState`, `weatherDescription`, and `imgTiempo` MUST fallback to default/safe representations (e.g., `'sunny'`, empty string, or default icon path).

### 1.4 Background Refresh & Retry Loop
- **1.4.1** The composable MUST track whether a refresh is in progress using an `isRefreshing` ref.
- **1.4.2** If `fetchWeather` is called while `isRefreshing` is `true`, it MUST terminate early to prevent concurrent network requests.
- **1.4.3** If a fetch fails (network/HTTP error or validation failure), the system MUST schedule an automatic retry after exactly 30 seconds.
- **1.4.4** If a fetch succeeds, any pending 30-second retry timer MUST be cleared, and a normal refresh MUST be scheduled after exactly 5 minutes (300 seconds).
- **1.4.5** The system MUST register event listeners for window `focus` and `visibilitychange` events (triggering when `document.visibilityState === 'visible'`).
- **1.4.6** Upon trigger of focus or visibility events, the system MUST invoke `fetchWeather(true)` in the background to refresh weather details.

### 1.5 UI Status Indicators & Skeleton Loader
- **1.5.1** The UI components (`TiempoPortada.vue` and `TiempoDetalleModal.vue`) MUST display a loader skeleton only when no weather data (neither live nor cached) is available (`isLoading && !weatherData`).
- **1.5.2** If cached or live data is present, the UI MUST display the weather info instead of the skeleton, even if a background refresh is in progress.
- **1.5.3** A localized status indicator MUST be displayed in the UI:
  - Inside `TiempoPortada.vue`: below the temperature summary row.
  - Inside `TiempoDetalleModal.vue`: below the current condition title.
- **1.5.4** The status message MUST use the styling class `text-xs opacity-80 mt-1`.
- **1.5.5** While a background refresh is active (`isRefreshing === true`), the status message MUST display a localized refreshing text.
- **1.5.6** When no fetch is active, the status message MUST display a localized "Last update" text containing the formatted time (HH:MM) from the cached timestamp.

### 1.6 Internationalization (i18n)
- **1.6.1** All UI status message strings MUST be localized under the `weather` namespace in `i18n/locales/es.json` and `i18n/locales/en.json`.
- **1.6.2** The localized keys MUST match:
  - Spanish (`es.json`):
    - `weather.last_update`: `"Última actualización: {time}"`
    - `weather.refreshing`: `"Obteniendo información..."`
  - English (`en.json`):
    - `weather.last_update`: `"Last update: {time}"`
    - `weather.refreshing`: `"Refreshing..."`

---

## 2. Acceptance Scenarios

### Scenario 1: Initial Launch with Successful Fetch (Cold Start)
- **Given** the application has just loaded and there is no cached weather data in `localStorage`.
- **When** the weather composable initializes and calls `fetchWeather`.
- **Then** the skeleton loader MUST be shown on the home page widget (`TiempoPortada.vue`).
- **And** when the API responds with a valid weather payload:
  - `weatherData` MUST be updated.
  - The payload and current timestamp MUST be saved to `localStorage` under `weather_cached_data` and `weather_last_update_time`.
  - The skeleton loader MUST disappear, showing the active weather information.
  - The status indicator MUST show "Última actualización: [HH:MM]" (ES) or "Last update: [HH:MM]" (EN).

### Scenario 2: Initial Launch with API Error (Rate Limited / Network Offline)
- **Given** the application has just loaded and there is no cached weather data in `localStorage`.
- **When** the weather composable initializes and the API returns a rate-limiting payload (e.g. `{"error":true}`) or network is offline.
- **Then** payload validation MUST fail and reject the response.
- **And** `weatherData` MUST remain `null`.
- **And** `isError` MUST be set to `true`.
- **And** the skeleton loader MUST remain visible (or show an error state if implemented).
- **And** a retry timer MUST be scheduled to execute in 30 seconds.

### Scenario 3: Background Refresh Error with Cached Data Available (Warm Start)
- **Given** the application has valid weather data and a timestamp cached in `localStorage`.
- **When** the application starts up:
  - The composable MUST immediately load the cached data into `weatherData` and `lastUpdate`.
  - The UI MUST render the weather information using this cached data immediately (no skeleton loader).
- **And** when a background refresh fetch is executed and the API returns a rate-limiting error payload:
  - The validation MUST fail and reject the payload.
  - `weatherData` MUST retain its cached values (it MUST NOT be set to null or the error payload).
  - The UI MUST continue rendering the cached weather information without interruption.
  - The status indicator MUST continue to display the last successful update timestamp (e.g. "Última actualización: 10:45").
  - The system MUST schedule a retry fetch in 30 seconds.

### Scenario 4: Automatic Retry Loop Behavior
- **Given** a failed fetch has occurred and a 30-second retry timer is pending.
- **When** 30 seconds elapse.
- **Then** a background fetch MUST be triggered automatically.
- **And** if this fetch succeeds:
  - The 30-second retry timer MUST be cleared.
  - The new data and current timestamp MUST be cached in `localStorage`.
  - A 5-minute (300 seconds) refresh timer MUST be scheduled.
  - The status indicator MUST update to display the new update time.

### Scenario 5: User Returns to Tab/Window Focus
- **Given** the application tab is running in the background and is not active.
- **When** the user switches back to the application tab (triggering window `focus` or `visibilitychange` to visible).
- **Then** a background fetch MUST be triggered immediately.
- **And** while the fetch is running:
  - The UI MUST remain fully interactive and show cached weather data.
  - The status indicator MUST display "Obteniendo información..." (ES) or "Refreshing..." (EN).

### Scenario 6: Robustness of Computed Properties on Missing Fields
- **Given** `weatherData` is present but is missing properties (e.g., due to a partially mutated state or developer modification).
- **When** components access computed properties like `temperature` or `weatherState`.
- **Then** the computed properties MUST NOT throw `TypeError: Cannot read properties of undefined` exceptions.
- **And** they MUST return fallback values (e.g. `0` for temperature, `'sunny'` for weatherState) to prevent UI thread crashes.

---

## 3. Home Mini-Card Hardening Requirements

### 3.1 Home Mini-Card Behavior Preservation

The system MUST preserve the current home weather mini-card behavior while hardening its internals.

#### Scenario: Mini-card visible content remains stable

- **Given** valid live or cached weather data is available.
- **When** the home page renders the weather mini-card.
- **Then** the card MUST continue to show wind speed, UV index, humidity, weather icon, temperature, and status text.
- **And** clicking the card MUST continue to open the detail modal.

#### Scenario: Skeleton remains data-gated

- **Given** no live or cached weather data is available.
- **When** the mini-card is loading weather data.
- **Then** the mini-card MAY show the existing skeleton loader instead of weather metrics.

### 3.2 Cache-First Refresh Protection

The system MUST preserve cache-first weather rendering during refresh and retry behavior.

#### Scenario: Cached data survives refresh failure

- **Given** cached weather data is already active.
- **When** a background refresh fails or receives an invalid payload.
- **Then** the UI MUST continue rendering the cached data.
- **And** the retry loop MUST remain scheduled according to the existing weather refresh requirements.

#### Scenario: Refresh does not replace content with skeleton

- **Given** live or cached weather data is displayed.
- **When** a focus, visibility, scheduled, or manual background refresh starts.
- **Then** the card and modal MUST keep showing weather content.
- **And** refreshing state MUST be represented only by the localized status indicator.

### 3.3 Explicit Weather State Lifecycle

The system MUST make weather state ownership, refresh timers, event listeners, and cleanup expectations explicit and contained.

#### Scenario: Listener lifecycle is bounded

- **Given** the weather feature registers browser focus or visibility listeners.
- **When** the weather feature is mounted, reused, or disposed.
- **Then** listener registration MUST avoid duplicate handlers.
- **And** cleanup or intentional app-lifetime ownership MUST be documented.

#### Scenario: Shared state contract is clear

- **Given** multiple weather UI consumers read the weather composable state.
- **When** one consumer triggers a refresh.
- **Then** other consumers MUST observe the same active data, loading, error, refresh, and last-update state without conflicting ownership.

### 3.4 Weather Labels and Units Consistency

The system MUST align weather labels, status strings, and units with project i18n conventions, while allowing documented universal domain symbols.

#### Scenario: Localized labels are used

- **Given** weather UI renders user-facing words or phrases.
- **When** the active locale is Spanish or English.
- **Then** those words or phrases MUST come from matching `weather` locale keys.

#### Scenario: Universal symbols are justified

- **Given** the UI renders compact symbols such as `%`, `UV`, `km/h`, `mm`, or `°C`.
- **When** the symbol is kept outside locale files.
- **Then** the spec, design, or nearby documentation MUST justify it as a locale-neutral domain symbol.

### 3.5 Production-Safe Preview Behavior

The system MUST NOT keep uncontained simulation or preview-only behavior in the production weather rendering path.

#### Scenario: Production path excludes simulation controls

- **Given** the production home mini-card is rendered.
- **When** weather data is displayed.
- **Then** preview-only simulation state, labels, controls, or fixture toggles MUST NOT be reachable by users.

#### Scenario: Developer preview remains isolated if retained

- **Given** developer preview behavior is still needed.
- **When** it is implemented.
- **Then** it MUST be isolated behind a non-production path, fixture, or documented development-only entry point.

### 3.6 Weather Architecture Documentation

The system MUST maintain concise documentation of the weather mini-card architecture and data flow.

#### Scenario: Future agent can trace data flow

- **Given** a future maintainer reviews the weather artifacts.
- **When** they need to modify the mini-card, modal, background, or composable.
- **Then** documentation MUST identify each component responsibility, data source, cache keys, refresh/retry behavior, and i18n ownership.

#### Scenario: Documentation matches preserved behavior

- **Given** the implementation is hardened without product redesign.
- **When** documentation is updated.
- **Then** it MUST describe the current visible behavior and any intentional non-behavioral internal changes.
