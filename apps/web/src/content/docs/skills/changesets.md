---
title: changesets
description: Gateway skill for changeset work in a repository that already has changesets set up.
---

Gateway for changeset work in a repository that already has
[changesets](https://github.com/changesets/changesets) set up. It routes to one of two
workflows.

## When it runs

Ask for it directly, or say something like "add a changeset", "add cs", "review the
changesets", or "check the changeset wording". It also fits when CI fails for a missing
changeset.

To set changesets up in the first place, use
[`init-changesets`](/buddy-changesets/skills/init-changesets/) instead.

## Modes

| Mode | What it does |
| ---- | ------------ |
| `add` | Works out which packages the current change affects, picks the bump type, and writes the changeset file. |
| `review` | Adds a missing changeset, then reads every pending file in `.changeset/` and checks scope, bump accuracy, breaking-change and migration detail, wording, and markdown. |

`add` is the default when the request names no mode. `review` is the superset — ask for
it before merging or cutting a release, when pending changesets are already sitting in
`.changeset/`.

## What review mode checks

Two checks reuse the rules [`add-changeset`](/buddy-changesets/skills/add-changeset/)
writes to, so a changeset is reviewed against the standard it was authored to:

- **Does it belong** — deletes changesets covering only devDependency bumps, CI and
  tooling, tests, internal refactors, or unpublished packages.
- **Is the body up to standard** — implementation detail, wrong mood, missing backticks,
  broken markdown, breaking changes with no migration steps.

Two are review-only, needing the whole pending set and the final diff:

- **Is it accurate** — bump types against what actually landed, reverted work still
  described, missing packages, inconsistent `fixed` groups.
- **Is it redundant** — duplicate or already-released entries.

It edits the files in place and asks first before deleting one or changing a bump type.
It never touches `CHANGELOG.md`.

## Sub-skills

The gateway loads these; they are not triggered on their own.

- [`add-changeset`](/buddy-changesets/skills/add-changeset/) — writes the changeset file,
  and owns the criteria.
- [`review-changesets`](/buddy-changesets/skills/review-changesets/) — audits the pending
  changesets, loading `add-changeset` for those criteria rather than restating them.
