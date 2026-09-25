---
title: review-changesets
description: Sub-skill that audits the pending changesets for scope, accuracy, and wording before a release.
---

:::note
A sub-skill. The [`changesets`](/buddy-changesets/skills/changesets/) gateway calls it in
`review` mode. It does not trigger on its own.
:::

Every pending changeset in `.changeset/` becomes a `CHANGELOG.md` entry verbatim at the
next release. This is the last chance to catch a wrong bump, a leaked implementation
detail, or an entry that should not ship at all.

## Workflow

1. **Load the criteria.** It loads [`add-changeset`](/buddy-changesets/skills/add-changeset/),
   which owns what warrants a changeset, which bump type, and the body rules, then runs it
   for the current change so a missing changeset is written before the review.
2. **Gather the pending set.** Every `.md` file in `.changeset/` except `README.md`, plus
   the `fixed`, `linked`, and `ignore` groups from `config.json`, plus the commits and the
   diff against the base branch.
3. **Check each changeset** — does it belong, is the bump accurate, is the body up to
   standard, is it redundant against another pending or already-released entry.

It edits files in place, and asks first before deleting one or changing a bump type. It
never touches `CHANGELOG.md`.
