---
name: init
description: "Use this skill when setting up changesets, adding release CI, upgrading the Changesets CLI across a major, or migrating from another release tool. Also when a release job fails with a Changesets CLI/action version mismatch."
---

# Initialize Changesets

## When to use

- First-time changesets setup in a repo (single package or monorepo)
- Adding or fixing the CI release workflow (`changesets/action` on GitHub, or direct `version`/`publish` elsewhere)
- Migrating from semantic-release, release-it, lerna, release-please, or similar tools
- Upgrading the CLI across a major, or fixing a `changesets/action` ↔ CLI version mismatch

Trigger phrases: `'add changesets'`, `'set up releases'`, `'configure versioning'`, `'upgrade changesets'`, shared `<org>/.github` release workflow.

**Not this skill:**

- Adding or reviewing a changeset on the current PR → use **`changesets`**
- GitHub branch protection / Dependabot only → use **`setup-github-repo`**

## Workflow

### 1. Detect and gate

**Detect automatically** (do not ask if the filesystem answers it):

| Check | How |
|---|---|
| Package manager | `pnpm-lock.yaml`, `bun.lock`/`bun.lockb`, `yarn.lock`, `package-lock.json` |
| Monorepo | `pnpm-workspace.yaml`, `workspaces` in root `package.json`, or `bun.workspace.ts` |
| Agent plugin repo | root `plugin.json`, `.claude-plugin/`, or `.agents/universal-plugin.json` — the product is skills and commands installed from a marketplace, and the repo may publish nothing to npm |
| Already initialized | `.changeset/` directory exists |
| CLI major | `@changesets/cli` range in root `package.json` |
| Action major | `changesets/action@` ref in the release workflow — follow a `uses:` to the shared workflow first |
| CI platform | `.github/workflows/` → GitHub Actions; `.gitlab-ci.yml` → GitLab; `.circleci/config.yml` → CircleCI; `bitbucket-pipelines.yml` → Bitbucket; `azure-pipelines.yml` → Azure; `Jenkinsfile` → Jenkins; `.travis.yml` → Travis; `.drone.yml` → Drone; none → ask |

**Competing release tools** — check `package.json` deps and config files:

| Tool | Detection |
|---|---|
| semantic-release | dep or `.releaserc*` / `release.config.*` / `"release"` in `package.json` |
| release-it | dep or `.release-it.*` / `"release-it"` in `package.json` |
| standard-version | dep or `.versionrc*` / `"standard-version"` in `package.json` |
| beachball | dep or `beachball.config.json` |
| release-please | `release-please-config.json` / `.release-please-manifest.json` |
| auto (Intuit) | dep or `.autorc*` |
| Nx Release | `nx` in deps and `"release"` in `nx.json` |
| lerna | `lerna.json` |
| bumpp | dep |
| changelogen | dep |

**Early exits:**

| Condition | Action |
|---|---|
| `.changeset/` already exists | Skip step 2; audit config/scripts/CI only |
| CLI major ≠ action major, or CLI still v2 | Read `references/migration/cli-v3-upgrade.md` and upgrade — see the pairing table in step 5. Do not re-run init |
| Competing tool detected | Ask: migrate to changesets? **No** → stop. **Yes** → load that tool's migration reference, apply removal, then continue |
| Non-GitHub CI and user expects a Version Packages PR | Explain that pattern is GitHub-only; proceed with the common non-GitHub pattern or stop |

**Ask the user:**

1. Shared workflow in `<org-or-user>/.github`? **Yes** → Option B in step 5. **No** → inline workflow.
2. Monorepo: any `fixed` groups (same version always)?
3. Any packages to `ignore` (private/internal, not published)?
4. Plugin repo with nothing on npm: confirm the release is a tag and a marketplace update rather
   than an `npm publish`.

### 2. Initialize

Skip if `.changeset/` already exists.

```bash
# pnpm
pnpm dlx @changesets/cli@3 init

# bun
bunx @changesets/cli@3 init

# npm / yarn
npx @changesets/cli@3 init
```

Creates `.changeset/config.json` and `.changeset/README.md`.

### 3. Configure `.changeset/config.json`

Replace the generated config. Set `baseBranch` to the repo's default branch if not `main`.

**Single package:**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@4.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main"
}
```

**Monorepo with grouped packages:**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@4.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "public",
  "baseBranch": "main",
  "fixed": [["package-a", "package-b"]],
  "linked": [],
  "ignore": ["internal-tools"],
  "updateInternalDependencies": "patch"
}
```

**Agent plugin repo (no npm publish):**

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "baseBranch": "main",
  "privatePackages": { "version": true, "tag": true }
}
```

Changesets versions a project it never publishes, but it only ever writes a `package.json` — that is
where the number lives. A plugin repo without one needs a minimal file, nothing more:

```json
{
  "name": "my-plugin",
  "private": true,
  "version": "0.0.1"
}
```

`privatePackages` then lets changesets bump and tag it; the tag is what triggers the real release.
Leave `"access"` out — nothing publishes to npm.

Key decisions:

- `"access": "public"` — required to publish scoped packages (`@scope/name`) publicly
- `"fixed"` — packages that must share the exact same version
- `"linked"` — packages that share the highest bump type but keep independent versions
- `"ignore"` — excluded from changeset versioning (e.g. `examples`, internal CLIs)
- `"commit": false` — default; CI/action controls commits
- `"privatePackages"` — `{ "version": true, "tag": true }` versions and tags a `private: true`
  project so a non-npm release can hang off the tag

### 4. Add scripts to `package.json`

```json
{
  "scripts": {
    "version": "changeset version",
    "release": "changeset publish",
    "cs": "changeset"
  }
}
```

If a build must run before publish: `"release": "<pm> build && changeset publish"`.

**Plugin repo:** there is no `release` script — nothing goes to npm. Instead `version` chains the
step that carries the released number out of `package.json` into the plugin manifests, which are
derived and must never be hand-edited. Detect the toolchain rather than assuming one: where
`.agents/universal-plugin.json` exists, that step is

```json
{
  "scripts": {
    "version": "changeset version && universal-plugin publish sync-version && universal-plugin plugin build",
    "cs": "changeset"
  }
}
```

Otherwise use whatever command the repo already has for propagating the version to its manifests.

### 5. CI release workflow

#### The CLI and the action must match majors

`changesets/action` refuses a mismatched CLI:

```
Error: This version of the Changesets action is designed to work with Changesets CLI v3.
Changesets CLI v2 is not supported; use Changesets action v1 instead, which is compatible with CLI v2.
```

| `@changesets/cli` | `changesets/action` | Input names |
|---|---|---|
| v2 | `@v1` | `version:`, `publish:`, `commit:`, `GITHUB_TOKEN` env var |
| v3 | `@v2` | `version-script:`, `publish-script:`, `commit-message:`, `github-token:` input |

The renamed inputs are **silently ignored** under the wrong major, so a half-done bump leaves the action running with no publish script. Change both sides in one commit.

New repos get **CLI v3 + action v2**. Staying on v2 is not a safe hold: npm 12 changed `npm info --json` to emit an array, and CLI 2.x reads `.versions` off the parsed object — it comes back `undefined`, every version looks unpublished, and the release republishes into npm's E403.

#### GitHub Actions — Option A (inline)

Create `.github/workflows/release.yml`:

```yaml
name: release
on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      # Insert package manager setup here (see below)

      - run: <install-command>
      - run: <build-command>        # remove if no build step

      - name: Create Release PR or Publish
        uses: changesets/action@v2
        with:
          version-script: <pm> run version
          publish-script: <pm> run release
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Plugin repo:** drop the `publish-script:` input and `NPM_TOKEN` (`publish:` on action v1). With the
version script alone the action opens the Version Packages PR, and merging it tags the release; the
marketplace update is a separate job triggered on that tag.

Replace `<pm>` and `<install-command>` from step 1. **Package manager setup:**

pnpm:

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: pnpm
```

bun:

```yaml
- uses: oven-sh/setup-bun@v2
- uses: actions/setup-node@v4
  with:
    node-version: 22
```

npm/yarn:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
    cache: npm   # or: yarn
```

**Token note:** `GITHUB_TOKEN` is enough for most repos. If branch protection requires CI on the **Version Packages** PR, use a PAT with `repo` scope as `RELEASE_TOKEN` and pass it as the action's `github-token:` input.

#### GitHub Actions — Option B (shared workflow)

In `<user-or-org>/.github`, create `.github/workflows/release-changeset.yml`:

```yaml
name: release-changeset
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '22'
    outputs:
      published:
        description: 'Whether packages were published'
        value: ${{ jobs.release.outputs.published }}

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    runs-on: ubuntu-latest
    outputs:
      published: ${{ steps.changesets.outputs.published }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      # Add package manager setup, install, build
      - name: Create Release PR or Publish
        id: changesets
        uses: changesets/action@v2
        with:
          version-script: <pm> run version
          publish-script: <pm> run release
          github-token: ${{ secrets.GITHUB_TOKEN }}
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

In each consuming repo:

```yaml
name: release
on:
  push:
    branches: [main]

jobs:
  release:
    uses: <user-or-org>/.github/.github/workflows/release-changeset.yml@main
    secrets: inherit
```

**A shared workflow makes the action version a fleet-wide decision.** Bumping `changesets/action` here breaks the release job in every consumer still on the old CLI, and the failure surfaces in *their* repos, not this one — each on its next push to `main`, not at merge time. Bump the consumers' CLI in the same pass.

#### Other CI platforms

Load the common non-GitHub pattern, then the detected platform's file — both listed in References.

### 6. Secrets

- `NPM_TOKEN` — npm automation token, from the npm account's access-token settings; not needed by a
  plugin repo that publishes nothing to npm
- `RELEASE_TOKEN` — optional GitHub PAT, only if branch protection blocks the Version Packages PR

### 7. Verify and hand off

Assert the pairing first — the one check that catches a setup which looks complete and fails on its first release:

```bash
jq -r '.devDependencies["@changesets/cli"] // .dependencies["@changesets/cli"]' package.json
grep -rn 'changesets/action@' .github/workflows/   # follow a `uses:` to the shared workflow first
```

`cli ^3` needs `action@v2` with the `-script` input names; `cli ^2` needs `action@v1`. A mismatch is the failure, whatever else is green.

```bash
npx changeset add --empty
ls .changeset/
gh workflow list   # GitHub only
```

On an existing repo with pending changesets, confirm they still parse — this is what proves an upgrade did not strand a release:

```bash
<pm> exec changeset status
```

Tell the user that changeset files are added via the **`changesets`** skill, and that versions and `CHANGELOG.md` on the Version Packages PR are generated — never hand-edited.

## Anti-patterns

- Preloading reference files before detection matches them
- Duplicating `add-changeset`'s bump-type and summary rules here
- Setting `"commit": true` when CI runs `changesets/action`
- Promising a Version Packages PR on non-GitHub CI
- Hand-editing a version in `plugin.json` or a vendor manifest, or running a plugin CLI's own
  `version` command in a changesets repo — it picks a number changesets is about to pick again

## References

Load one row only, when step 1 detection matches it.

| Detected tool | Migration reference |
|---|---|
| semantic-release | `references/migration/semantic-release.md` |
| release-it | `references/migration/release-it.md` |
| standard-version | `references/migration/standard-version.md` |
| beachball | `references/migration/beachball.md` |
| release-please | `references/migration/release-please.md` |
| auto (Intuit) | `references/migration/auto.md` |
| Nx Release | `references/migration/nx-release.md` |
| lerna | `references/migration/lerna.md` |
| bumpp | `references/migration/bumpp.md` |
| changelogen | `references/migration/changelogen.md` |

Non-GitHub CI — read `references/ci/_common.md` first, then the platform file.

| Detected platform | CI reference |
|---|---|
| GitLab | `references/ci/gitlab.md` |
| CircleCI | `references/ci/circleci.md` |
| Bitbucket | `references/ci/bitbucket.md` |
| Azure Pipelines | `references/ci/azure-pipelines.md` |
| Jenkins | `references/ci/jenkins.md` |
| Travis CI | `references/ci/travis.md` |
| Drone | `references/ci/drone.md` |

- Changesets docs — <https://github.com/changesets/changesets>
