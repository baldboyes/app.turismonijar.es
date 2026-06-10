# Skill Registry

This registry tracks specialized skills available to the AI agent for local development and workflow automation.

| Skill Name | Scope | Trigger / Description | Location |
|------------|-------|-----------------------|----------|
| **caveman** | `project` | Ultra-compressed communication mode. Cuts token usage ~75% by speaking like caveman while keeping full technical accu... | [caveman](./.agents/skills/caveman/SKILL.md) |
| **i18n-automated-manager** | `project` | Automatically manage translations in 103 Cultura. Force the agent to write keys directly into JSON files. | [i18n-manager](./.agents/skills/i18n-manager/SKILL.md) |
| **shadcn-vue-architect** | `project` | Architect consistent UI components using Shadcn-Nuxt, Reka-UI, and Tailwind 4. Focuses on accessibility, variant mana... | [shadcn-vue-architect](./.agents/skills/shadcn-vue-architect/SKILL.md) |
| **a11y-debugging** | `user` | Uses Chrome DevTools MCP for accessibility (a11y) debugging and auditing based on web.dev guidelines. Use when testin... | [a11y-debugging](~/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md) |
| **android-cli** | `user` | Orchestrates Android development tasks including project creation, deployment, SDK management, and environment diagno... | [skills](~/.gemini/config/plugins/android-cli-plugin/skills/SKILL.md) |
| **branch-pr** | `user` | Create Gentle AI pull requests with issue-first checks. Trigger: creating, opening, or preparing PRs for review. | [branch-pr](~/.gemini/skills/branch-pr/SKILL.md) |
| **chained-pr** | `user` | Trigger: PRs over 400 lines, stacked PRs, review slices. Split oversized changes into chained PRs that protect review... | [chained-pr](~/.gemini/skills/chained-pr/SKILL.md) |
| **chrome-devtools** | `user` | Uses Chrome DevTools via MCP for efficient debugging, troubleshooting and browser automation. Use when debugging web ... | [chrome-devtools](~/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md) |
| **chrome-extensions** | `user` | Build and publish Chrome Extensions using Manifest V3 best practices. Use this skill whenever the user asks to create... | [chrome-extensions](~/.gemini/config/plugins/modern-web-guidance-plugin/skills/chrome-extensions/SKILL.md) |
| **cognitive-doc-design** | `user` | Design docs that reduce cognitive load. Trigger: writing guides, READMEs, RFCs, onboarding, architecture, or review-f... | [cognitive-doc-design](~/.gemini/skills/cognitive-doc-design/SKILL.md) |
| **comment-writer** | `user` | Write warm, direct collaboration comments. Trigger: PR feedback, issue replies, reviews, Slack messages, or GitHub co... | [comment-writer](~/.gemini/skills/comment-writer/SKILL.md) |
| **debug-optimize-lcp** | `user` | Guides debugging and optimizing Largest Contentful Paint (LCP) using Chrome DevTools MCP tools. Use this skill whenev... | [debug-optimize-lcp](~/.gemini/config/plugins/chrome-devtools-plugin/skills/debug-optimize-lcp/SKILL.md) |
| **find-skills** | `user` | Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is... | [find-skills](~/.agents/skills/find-skills/SKILL.md) |
| **go-testing** | `user` | Trigger: Go tests, go test coverage, Bubbletea teatest, golden files. Apply focused Go testing patterns. | [go-testing](~/.gemini/skills/go-testing/SKILL.md) |
| **issue-creation** | `user` | Create Gentle AI issues with issue-first checks. Trigger: creating GitHub issues, bug reports, or feature requests. | [issue-creation](~/.gemini/skills/issue-creation/SKILL.md) |
| **judgment-day** | `user` | Trigger: judgment day, dual review, adversarial review, juzgar. Run blind dual review, fix confirmed issues, then re-... | [judgment-day](~/.gemini/skills/judgment-day/SKILL.md) |
| **memory-leak-debugging** | `user` | Diagnoses and resolves memory leaks in JavaScript/Node.js applications. Use when a user reports high memory usage, OO... | [memory-leak-debugging](~/.gemini/config/plugins/chrome-devtools-plugin/skills/memory-leak-debugging/SKILL.md) |
| **modern-web-guidance** | `user` | Search tool for modern web development best practices. MANDATORY: Execute FIRST for all HTML/CSS and clientside JS ta... | [modern-web-guidance](~/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md) |
| **skill-creator** | `user` | Trigger: new skills, agent instructions, documenting AI usage patterns. Create LLM-first skills with valid frontmatter. | [skill-creator](~/.gemini/skills/skill-creator/SKILL.md) |
| **skill-improver** | `user` | Trigger: improve skills, audit skills, refactor skills, skill quality. Audit and upgrade existing LLM-first skills. | [skill-improver](~/.gemini/skills/skill-improver/SKILL.md) |
| **skill-installer** | `user` | Install Codex skills into $CODEX_HOME/skills from a curated list or a GitHub repo path. Use when a user asks to list ... | [skill-installer](~/.codex/skills/.system/skill-installer/SKILL.md) |
| **troubleshooting** | `user` | Uses Chrome DevTools MCP and documentation to troubleshoot connection and target issues. Trigger this skill when list... | [troubleshooting](~/.gemini/config/plugins/chrome-devtools-plugin/skills/troubleshooting/SKILL.md) |
| **work-unit-commits** | `user` | Plan commits as reviewable work units. Trigger: implementation, commit splitting, chained PRs, or keeping tests and d... | [work-unit-commits](~/.gemini/skills/work-unit-commits/SKILL.md) |
