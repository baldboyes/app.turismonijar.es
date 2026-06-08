---
name: "i18n-automated-manager"
description: "Automatically manage translations in 103 Cultura. Force the agent to write keys directly into JSON files."
---

# i18n Automated Manager

## Rules for the Agent
- Direct File Access: When creating or modifying a component, you MUST open and edit ./i18n/locales/en.json and ./i18n/locales/es.json.
- Key Generation: If a text string is needed (e.g., "Welcome"), generate a key like pages.home.welcome and insert it into the JSON files.
- No Placeholders: Do not ask the user to add the keys. Use your edit_file skill to update the locales folder immediately.
- Synchronization: Ensure the new key exists in ALL two languages (EN, ES).

## File Paths
- English: ./i18n/locales/en.json
- Spanish: ./i18n/locales/es.json

## Example Workflow
User: "Add a login button to the header."
Agent: 
1. Reads ./i18n/locales/en.json.
2. Adds "login": "Log In" under the auth section.
3. Repeats for ./i18n/locales/es.json ("Iniciar sesión").