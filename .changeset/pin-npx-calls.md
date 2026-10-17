---
"buddy-changesets": patch
---

`init-changesets` now pins the CLI it fetches for `changeset init` to an exact version, the same in every package manager's command. After init, it runs the installed `changeset` binary through the repository's package manager instead of fetching an unpinned copy with `npx`.
