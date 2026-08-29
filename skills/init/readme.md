# init

Sets up [changesets](https://github.com/changesets/changesets) in a repository: initializes `.changeset/`, writes the config, adds the version/release scripts, and creates the CI release workflow. Also migrates a repo off another release tool.

## When it runs

Ask for it directly, or say something like "add changesets", "set up releases", or "configure versioning". It also fits when the release workflow is missing or broken, or when you want to move from semantic-release, release-it, lerna, release-please, or a similar tool.

To add a changeset to an existing setup, use **add-changeset** instead.

## What it does

1. Detects the package manager, monorepo layout, CI platform, and any competing release tool from the filesystem — it asks only what the files cannot answer.
2. Offers to migrate if another release tool is present, and stops if you decline.
3. Runs `changeset init` (skipped when `.changeset/` already exists) and writes `.changeset/config.json`, including `fixed`, `linked`, and `ignore` groups for a monorepo.
4. Adds `version`, `release`, and `cs` scripts to `package.json`.
5. Writes the release workflow — an inline GitHub Actions workflow, a shared one in your `<org>/.github` repo, or the equivalent for GitLab, CircleCI, Bitbucket, Azure Pipelines, Jenkins, Travis, or Drone.
6. Tells you which secrets to add and verifies the setup.

## What you need

- A repository with at least one `package.json`.
- An npm automation token stored as `NPM_TOKEN` in the CI secrets, for publishing.
- On GitHub, a PAT stored as `RELEASE_TOKEN` only if branch protection blocks the Version Packages PR.

## References

The skill reads these on demand — one migration file per detected tool, one CI file per detected platform. It never loads them all.

- `references/migration/` — semantic-release, release-it, standard-version, beachball, release-please, auto, Nx Release, lerna, bumpp, changelogen
- `references/ci/` — `_common.md` plus GitLab, CircleCI, Bitbucket, Azure Pipelines, Jenkins, Travis, Drone
