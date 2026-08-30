# changesets

Gateway for changeset work in a repository that already has [changesets](https://github.com/changesets/changesets) set up. It routes to one of two workflows.

## When it runs

Ask for it directly, or say something like "add a changeset", "add cs", "review the changesets", or "check the changeset wording". It also fits when CI fails for a missing changeset.

To set changesets up in the first place, use **init** instead.

## Modes

| Mode | What it does |
| ---- | ------------ |
| `add` | Works out which packages the current change affects, picks the bump type, and writes the changeset file. |
| `review` | Adds a missing changeset, then reads every pending file in `.changeset/` and checks scope, bump accuracy, breaking-change and migration detail, wording, and markdown. |

`review` is the superset — use it before merging or cutting a release, when pending changesets are already sitting in `.changeset/`.

## What it checks in review mode

- Changesets that should not exist: devDependency bumps, CI and tooling changes, tests, internal refactors, unpublished packages.
- Bump types that do not match the diff, missing packages, and inconsistent `fixed` groups.
- Breaking changes without migration steps.
- Implementation detail, wrong mood, missing backticks, and broken markdown in the body.
- Duplicate or already-released entries.

It edits the files in place and asks first before deleting one or changing a bump type. It never touches `CHANGELOG.md`.

## Sub-skills

The gateway loads these; they are not triggered on their own.

- `add-changeset` — writes the changeset file.
- `review-changesets` — audits the pending changesets.
