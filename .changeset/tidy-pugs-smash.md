---
"buddy-changesets": minor
---

Move the plugin into `packages/buddy-changesets` and publish the documentation at <https://repobuddy.github.io/buddy-changesets>.

The repository is now a pnpm monorepo: the plugin lives in `packages/buddy-changesets`, and the docs site lives in `apps/web`. The marketplace catalogs at the repository root point at the new plugin directory, so `npx skills add repobuddy/buddy-changesets` and the Claude Code, Cursor, Codex, and Copilot CLI marketplace sources keep working unchanged. The plugin's `homepage` now points at the documentation site.
