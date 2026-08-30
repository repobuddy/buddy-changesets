---
name: changesets
description: "Use this skill for changeset work on an existing setup — write a changeset for the current change, or review the pending changesets in `.changeset/` before merging. Triggers on 'add a changeset', 'add cs', a missing-changeset CI failure, 'review the changesets', or 'check the changeset wording'."
---

# Changesets

Gateway for working with changeset files in a repo that already has changesets initialized. Routes to one of two workflows.

## Routing

| The user wants | Mode | Load |
|---|---|---|
| A changeset for the change they just made | `add` | **`add-changeset`** |
| The pending changesets checked, or checked and a missing one added | `review` | **`review-changesets`** |

Pick from what the user asked for:

| Signal | Mode |
|---|---|
| "add a changeset", "add cs", CI reports a missing changeset | `add` |
| "review the changesets", "check the changeset wording", "are the changesets right", pre-merge or pre-release cleanup | `review` |
| Names a mode explicitly (`changesets add`, `changesets review`) | that mode |

`review` is a superset of `add`: it writes a changeset for the current change when one is missing, then audits every file in `.changeset/`. When the request is ambiguous and `.changeset/` already holds pending changesets, prefer `review`.

**Not this skill:**

- Setting up changesets, the release workflow, or migrating off another release tool → use **`init`**
- Versioning or publishing by hand → don't; the release workflow does it (see below)

## Preflight

Both modes require an initialized setup:

```bash
ls .changeset/config.json
```

Missing → tell the user changesets is not set up and offer the **`init`** skill. Do not create `.changeset/` here.

## Boundaries for both modes

- **Never edit `CHANGELOG.md`** — `changeset version` generates it in full.
- **Never add or edit changesets on a "Version Packages" PR** — that branch is regenerated and the change is lost.
- **Never run `changeset version` or `changeset publish` locally** — CI owns both.
