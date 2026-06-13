# Delta for Weather

## ADDED Requirements

### Requirement: Home Mini-Card Behavior Preservation

The system MUST preserve the current home weather mini-card behavior while hardening its internals.

#### Scenario: Mini-card visible content remains stable

- GIVEN valid live or cached weather data is available
- WHEN the home page renders the weather mini-card
- THEN the card MUST continue to show wind speed, UV index, humidity, weather icon, temperature, and status text
- AND clicking the card MUST continue to open the detail modal.

#### Scenario: Skeleton remains data-gated

- GIVEN no live or cached weather data is available
- WHEN the mini-card is loading weather data
- THEN the mini-card MAY show the existing skeleton loader instead of weather metrics.

### Requirement: Cache-First Refresh Protection

The system MUST preserve cache-first weather rendering during refresh and retry behavior.

#### Scenario: Cached data survives refresh failure

- GIVEN cached weather data is already active
- WHEN a background refresh fails or receives an invalid payload
- THEN the UI MUST continue rendering the cached data
- AND the retry loop MUST remain scheduled according to the existing weather refresh requirements.

#### Scenario: Refresh does not replace content with skeleton

- GIVEN live or cached weather data is displayed
- WHEN a focus, visibility, scheduled, or manual background refresh starts
- THEN the card and modal MUST keep showing weather content
- AND refreshing state MUST be represented only by the localized status indicator.

### Requirement: Explicit Weather State Lifecycle

The system MUST make weather state ownership, refresh timers, event listeners, and cleanup expectations explicit and contained.

#### Scenario: Listener lifecycle is bounded

- GIVEN the weather feature registers browser focus or visibility listeners
- WHEN the weather feature is mounted, reused, or disposed
- THEN listener registration MUST avoid duplicate handlers
- AND cleanup or intentional app-lifetime ownership MUST be documented.

#### Scenario: Shared state contract is clear

- GIVEN multiple weather UI consumers read the weather composable state
- WHEN one consumer triggers a refresh
- THEN other consumers MUST observe the same active data, loading, error, refresh, and last-update state without conflicting ownership.

### Requirement: Weather Labels and Units Consistency

The system MUST align weather labels, status strings, and units with project i18n conventions, while allowing documented universal domain symbols.

#### Scenario: Localized labels are used

- GIVEN weather UI renders user-facing words or phrases
- WHEN the active locale is Spanish or English
- THEN those words or phrases MUST come from matching `weather` locale keys.

#### Scenario: Universal symbols are justified

- GIVEN the UI renders compact symbols such as `%`, `UV`, `km/h`, `mm`, or `°C`
- WHEN the symbol is kept outside locale files
- THEN the spec, design, or nearby documentation MUST justify it as a locale-neutral domain symbol.

### Requirement: Production-Safe Preview Behavior

The system MUST NOT keep uncontained simulation or preview-only behavior in the production weather rendering path.

#### Scenario: Production path excludes simulation controls

- GIVEN the production home mini-card is rendered
- WHEN weather data is displayed
- THEN preview-only simulation state, labels, controls, or fixture toggles MUST NOT be reachable by users.

#### Scenario: Developer preview remains isolated if retained

- GIVEN developer preview behavior is still needed
- WHEN it is implemented
- THEN it MUST be isolated behind a non-production path, fixture, or documented development-only entry point.

### Requirement: Weather Architecture Documentation

The system MUST maintain concise documentation of the weather mini-card architecture and data flow.

#### Scenario: Future agent can trace data flow

- GIVEN a future maintainer reviews the weather artifacts
- WHEN they need to modify the mini-card, modal, background, or composable
- THEN documentation MUST identify each component responsibility, data source, cache keys, refresh/retry behavior, and i18n ownership.

#### Scenario: Documentation matches preserved behavior

- GIVEN the implementation is hardened without product redesign
- WHEN documentation is updated
- THEN it MUST describe the current visible behavior and any intentional non-behavioral internal changes.
