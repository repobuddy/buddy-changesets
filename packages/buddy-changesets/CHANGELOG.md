# buddy-changesets

## 3.1.0

### Minor Changes

- 6906bf6: `init-changesets` now sets up a full release for an agent plugin that is not published to npm. `changeset version` syncs the plugin and vendor manifests and the marketplace catalog entries, through universal-plugin's `plugin version --from-package` or the repo's own command. `changeset publish` creates the git tag and GitHub release. The skill used to tell plugin repos to drop the publish script, so no version was ever tagged.

## 3.0.1

### Patch Changes

- 97ec407: `init-changesets` now pins the CLI it fetches for `changeset init` to an exact version, the same in every package manager's command. After init, it runs the installed `changeset` binary through the repository's package manager instead of fetching an unpinned copy with `npx`.
- 6bb6c4b: `write-changeset` no longer sends a `docs:` or `chore:` commit that changes shipped agent configuration to "no changeset needed". `init-changesets` dates its note on npm 12's `npm info --json` output.

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
