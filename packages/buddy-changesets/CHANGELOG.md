# buddy-changesets

## 3.0.0

### Major Changes

- aedffea: Change the `init-changesets` default release workflow on GitHub to npm trusted publishing: the generated workflow no longer passes `NPM_TOKEN`, and the skill now tells you to register a trusted publisher on npm. `NPM_TOKEN` stays documented as a legacy fallback for other CI platforms. Also fix the plugin-repo config `$schema` to `@changesets/config@4.0.0`.

### Minor Changes

- c3d76b5: Move the plugin into `packages/buddy-changesets` and publish the documentation at <https://repobuddy.github.io/buddy-changesets>.
  
  The repository is now a pnpm monorepo: the plugin lives in `packages/buddy-changesets`, and the docs site lives in `apps/web`. The marketplace catalogs at the repository root point at the new plugin directory, so `npx skills add repobuddy/buddy-changesets` and the Claude Code, Cursor, Codex, and Copilot CLI marketplace sources keep working unchanged. The plugin's `homepage` now points at the documentation site.

### Patch Changes

- aedffea: Rename the internal `add-changeset` sub-skill to `write-changeset` so it no longer collides with other plugins' skill of the same name. The `changesets` gateway and its `add` mode are unchanged.

## 2.0.0

### Major Changes

- 7340dfe: Rename the `init` skill to `init-changesets`. Update any trigger or reference that names `init` directly.

### Minor Changes

- bb7e309: Default the `changesets` skill to `add` mode when the request names no mode. Ask for `review` explicitly to audit the pending changesets.
