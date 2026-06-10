---
trigger: always_on
---

# Vive Níjar Project Rules & Standards

You are an expert Nuxt 4 developer working on the Vive Níjar project. 
You must ALWAYS follow these rules without being asked:

## 1. Internationalization
- **NO HARDCODED STRINGS:** It is strictly forbidden to write plain text in Vue templates or TS files.
- **AUTOMATED WRITING:** You must use your `edit_file` skill to update `./i18n/locales/en.json` and `./i18n/locales/es.json` BEFORE creating or modifying any component.
- **SYNC:** Ensure every new key exists in all two languages.
- **NAMING:** Use hierarchical keys (e.g., `components.product_card.title`).

## 2. Tech Stack Standards
- **Nuxt 4:** Use Nuxt 4 conventions and directory structures.
- **Shadcn & UI:** Use the `shadcn-vue-architect` skill. 
    - Use `tailwind-variants` (tv) for component logic.
    - Use `reka-ui` for accessibility.
    - **LIGHT MODE ONLY:** Do not add `dark:` classes or dark mode logic.

## 3. Workflow Autonomy
- **ACT, DON'T ASK:** If a task requires creating a translation, a composable, and a component, do all steps directly. 
- **CLEANUP:** When using Mapbox, always implement proper unmounting logic to prevent memory leaks.

## 4. File Paths
- Translations: `./i18n/locales/{en,es}.json`
- Composables: `app/composables/useBeaches*.ts`
- Types: `app/types/beach.ts`

## 5. Code Architecture and Nuxt 4 Best Practices (Strict Anti-Monolith)
- **CLEAN PAGES (Zero Heavy Logic):** Views in `pages/` act exclusively as coordinators for routes, layouts, and high-level data fetching. It is STRICTLY FORBIDDEN to embed complex UI logic or extensive forms directly in the page..
- **COMPONENT EXTRACTION RULE:** Any block of code meeting one of the following conditions must be extracted into an independent component in `components/`:
  - Exceeds 40-50 lines within the `<template>`.
  - Represents a repetitive list element (e.g., event cards, table rows).
  - Manages a complex UI sub-state (e.g., search filter groups, confirmation dialogs, modals).
- **LOGIC ENCAPSULATION (Composables & Utils):**
  - **No repeating functions:** Any reusable logic or calculation (such as the Haversine formula for geolocation or formatters) must go into `utils/` or `server/utils/`.
  - **State and Fetching:** Complex logic for forms or filtering flows must be encapsulated in dedicated composables (e.g., `composables/useBeaches.ts`, etc.) to keep the `<script setup>` in pages as short as possible.
- **STRICT USE OF SHADCN-VUE:** It is forbidden to layout native HTML elements (`<input>`, `<button>`, `<label>`) directly in the views if variants already exist in Shadcn-Vue. The shadcn-vue-architect skill must be invoked to generate or use consistent and accessible UI components.
- **MANDATORY PRIOR REFACTORING:** Before creating any helper function or component, Trae MUST scan the current workspace to check if something similar already exists that can be parameterized or extended, avoiding code duplication.


## 5 Layout & Styling
- **LAYOUT FREEDOM AND EXPRESSIVENESS:** In the public area, total creative freedom is granted to design dynamic layouts, asymmetrical grids, interactive maps, and Tailwind CSS animations in order to enrich the user's cultural experience, without being tied to the visual rigidity of Shadcn.
- **LIMITS OF FREEDOM (Aesthetics do not break architecture):** Freedom in the public area is solely visual and related to CSS layout. **Rule 5** must still be strictly followed: filter logic must be isolated in composables, and cards and blocks must be independent atomic components.