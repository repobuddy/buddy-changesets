# buddy-changesets

Skills for AI agents to work with [changesets](https://github.com/changesets/changesets) — the versioning and changelog tool for JavaScript/TypeScript packages.

Documentation: <https://repobuddy.github.io/buddy-changesets>

## Skills

| Skill | Description |
| ----- | ----------- |
| **changesets** | Gateway for an existing setup. `add` writes a changeset for the current change; `review` also audits every pending changeset for scope, bump accuracy, and wording. |
| **init-changesets** | Set up changesets in a new or existing repository, including the CI release workflow and migration off another release tool. |

`changesets` loads the `add-changeset` and `review-changesets` sub-skills; install them alongside it.

## Installation

The plugin lives in `packages/buddy-changesets` and is installed straight from this
repository — it is not published to npm.

```bash
# Install all skills globally
npx skills add repobuddy/buddy-changesets --all -g

# Install a specific skill
npx skills add repobuddy/buddy-changesets --skill changesets -g

# Install for a specific agent
npx skills add repobuddy/buddy-changesets --skill changesets -a claude-code -g
```

For Claude Code, add the marketplace and install the plugin:

```text
/plugin marketplace add repobuddy/buddy-changesets
/plugin install buddy-changesets@repobuddy-buddy-changesets-local
```

## Repository layout

```text
apps/web/                    Astro Starlight documentation site (GitHub Pages)
packages/buddy-changesets/   the plugin: manifests, vendor manifests, skills
```

## Development

```bash
pnpm install
pnpm web dev      # run the docs site locally
pnpm cs           # write a changeset
```
