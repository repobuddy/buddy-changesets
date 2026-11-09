---
title: Releasing agent plugins
description: Use changeset version and changeset publish for a Claude Code, Cursor, Codex, or Copilot CLI plugin that is not distributed through npm.
---

An agent plugin for Claude Code, Cursor, Codex, or Copilot CLI is installed from a
git repository or a marketplace catalog, not from npm. It carries its version in
`plugin.json` and the vendor manifests, not only in `package.json`. Changesets still
fits, but its defaults cover only `package.json` and npm:

- `changeset version` bumps `package.json` and nothing else, so the manifests drift.
- `changeset publish` publishes to npm, and skips private packages.

Changesets has no plugin API for other version files. Both gaps close with its
existing configuration and with scripts around the CLI. The
[`init-changesets`](/buddy-changesets/skills/init-changesets/) skill sets this up when
it detects a plugin repository.

## How it works

1. **The plugin package is private.** Its `package.json` has `"private": true` and
   holds the version. A plugin without a `package.json` gets a minimal one.
   Changesets cannot run without one: `changeset version`, `changeset publish`,
   `changesets/action`, and changesets-gitlab all find packages by reading
   `package.json`, and changesets has no plugin API to change that.
2. **Changesets versions and tags private packages.** In `.changeset/config.json`:

   ```json
   { "privatePackages": { "version": true, "tag": true } }
   ```

3. **The `version` script syncs the manifests.** It chains a sync step after
   `changeset version`, so the Version Packages PR updates `package.json`,
   `CHANGELOG.md`, every plugin manifest, and the matching marketplace catalog entries
   together.
4. **The `release` script tags instead of publishing.** `changeset publish` runs no
   `npm publish` for a private package. It creates the `<name>@<version>` git tag
   (`v<version>` in a single-package repository).
5. **The release workflow pushes the tag and creates the GitHub release.**
   `changesets/action@v2` runs the `release` script and reads the tags from the CLI's
   output report. It then pushes each tag and creates a GitHub release. Users install
   the plugin from that tag.

## Scripts

[universal-plugin](https://github.com/cyberuni/universal-plugin) does the sync step:

| Repository | Sync step |
|---|---|
| universal-plugin 0.17 or later | `universal-plugin plugin version --from-package` |
| An older universal-plugin | `universal-plugin publish sync-version && universal-plugin plugin build` |
| Has its own version-sync command | That command |

```json
{
  "scripts": {
    "version": "changeset version && universal-plugin plugin version --from-package",
    "release": "changeset publish",
    "cs": "changeset"
  }
}
```

`plugin version --from-package` stamps the `package.json` version into `plugin.json`,
the vendor manifests, the repository's marketplace catalogs, and the skill pins. Add
`--root <dir>` for a plugin in a subdirectory.

## Release workflow

```yaml
- name: Create Release PR or Tag
  uses: changesets/action@v2
  with:
    version-script: pnpm run version
    publish-script: pnpm run release
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Keep `publish-script` even though nothing goes to npm. Without it the action does
nothing after the Version Packages PR merges, and no tag or release ever marks the
version. The job needs `contents: write` and `pull-requests: write`, but not
`id-token: write`.

## Check the setup

```bash
pnpm exec changeset publish-plan --output plan.json && cat plan.json && rm plan.json
```

Every entry must be `"kind": "tag-only"` and name a plugin package. `"kind": "npm"`
means a package is not private. An extra `tag-only` entry is another private workspace
project with a `version`, such as a docs app, that would be tagged on every release.
Remove its `version` field or list it in `"ignore"`.

## Marketplaces in other repositories

A catalog in the same repository that points at the plugin by a relative path only
needs its `version` field updated, and the sync step does that. A marketplace in
another repository that pins the plugin by `ref` or `sha` needs its own update.
Trigger that update from the GitHub release. A release created with `GITHUB_TOKEN` does
not start other workflows, so this needs a PAT or a GitHub App token.

This repository releases its own plugin this way. See its
[release workflow](https://github.com/repobuddy/buddy-changesets/blob/main/.github/workflows/release.yml).
