---
title: add-changeset
description: Sub-skill that writes the changeset file and owns the criteria for what warrants one.
---

:::note
A sub-skill. The [`changesets`](/buddy-changesets/skills/changesets/) gateway calls it in
`add` mode, and [`review-changesets`](/buddy-changesets/skills/review-changesets/) calls
it when a pending changeset is missing. It does not trigger on its own.
:::

A changeset declares which packages a change affects, the semver bump type, and a
user-facing summary. It lives as a markdown file in `.changeset/` and CI consumes it to
version and publish.

## When a changeset is warranted

One test decides it: **can a consumer of the published package observe this change?**

| The change | Bump |
| ---------- | ---- |
| Fixes a bug in a published package | `patch` |
| Adds a new exported function, class, option, or command | `minor` |
| Removes or renames public API, or breaks existing usage | `major` |
| Moves a runtime `dependencies` range in a way that changes behavior, peer requirements, or the minimum supported version | `patch` |

Not warranted — the skill says so and stops, and in review the changeset is deleted:

- `devDependencies` bumps and lockfile churn
- CI/CD, build-process, or development tooling only
- Tests, fixtures, or Storybook stories
- Internal refactors with no API or behavior change
- `examples/`, `docs/`, or a package listed under `"ignore"` in `.changeset/config.json`
- A `private: true` package — unless the config sets `privatePackages.version`, which
  means the package is released by tag rather than by npm, and its changes are as
  observable as any published package's

A `chore:`, `ci:`, `test:`, or `docs:` commit almost always lands in that second list —
but the skill classifies from the diff, not from the prefix.

## The body

The summary becomes a `CHANGELOG.md` entry verbatim, so it is written for the consumer:
what changed and what to do about it, not how it was implemented. A breaking change
carries its migration steps.
