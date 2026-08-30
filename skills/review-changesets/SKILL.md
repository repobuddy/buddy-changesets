---
name: review-changesets
description: "Internal skill: review the pending changesets in `.changeset/` for scope, accuracy, and wording, adding a missing one first. Called by the `changesets` gateway in `review` mode."
user-invocable: false
---

# Review Changesets

Called by the **`changesets`** gateway. It has already confirmed `.changeset/config.json` exists.

Every pending changeset in `.changeset/` becomes a `CHANGELOG.md` entry verbatim at the next release. This skill is the last chance to catch a wrong bump, a leaked implementation detail, or an entry that should not ship at all.

## Workflow

### 1. Load the criteria

Load **`add-changeset`**. It owns the criteria this skill audits against — what warrants a changeset, which bump type, and the body rules. Do not restate or re-derive them here; a rule that needs changing gets changed there.

Then run it for the current change, so a missing changeset is written before the review. If it concludes no changeset is needed, say so and continue — reviewing what is already pending is still worthwhile.

Skip the writing half only when the user asked to review the existing files and nothing else.

### 2. Gather the pending changesets

```bash
ls .changeset/*.md
```

Ignore `README.md` and `config.json`. Read every remaining file, and read `.changeset/config.json` for the `fixed`, `linked`, and `ignore` groups.

Get the changes those files are meant to describe:

```bash
git log origin/main..HEAD --oneline
git diff --name-only origin/main...HEAD
```

Substitute the repo's actual base branch when it is not `main`.

### 3. Check each changeset

Four checks. The first two apply `add-changeset`'s criteria to a file that already exists; the last two are review-only — they need the whole set of pending files, which the author of any single changeset could not see.

**Does it belong?** Apply `add-changeset`'s **When a Changeset Is Warranted**. A changeset whose change fails that test gets deleted — most often one covering only a `devDependencies` bump, CI or tooling, tests, or an internal refactor. A runtime `dependencies` bump that does qualify usually still needs rewriting to say what changed for the consumer rather than which version moved.

**Is the body up to standard?** Apply `add-changeset`'s **Body rules** and its breaking-change requirement. Fix what falls short; leave a body that already meets the bar alone rather than rewording it for style.

**Is it accurate?** This is what a review can check and the author could not — the file against what actually landed:

- The described change happened, and happened in the packages listed in the frontmatter
- Nothing described was later reverted, dropped, or never landed
- The bump type still matches the final diff, not the intent at the time of writing
- Every affected package is listed, and all members of a `fixed` group carry the same bump
- Package names in the frontmatter match `package.json` exactly

**Is it redundant?** Across the pending set and the released history:

- Two pending changesets describing the same change get merged into one
- A changeset whose change was already released, or which duplicates an entry now in `CHANGELOG.md`, gets deleted

### 4. Report and apply

Report the findings grouped by file, each with the proposed edit:

```text
.changeset/fuzzy-wolves.md
  - bump: patch → minor (adds the `retry` option, a new public API)
  - body: wrap `retry` in backticks; drop "in fetchClient.ts"

.changeset/lucky-pandas.md
  - delete: covers only a devDependency bump of `vitest`
```

Apply edits directly. Confirm before deleting a file or changing a bump type — both change what ships.

Do not stage or commit; leave the changes for the user's own commit unless they ask otherwise.

## Verification

- [ ] Every file in `.changeset/` was read, not just the ones touched on this branch
- [ ] Each remaining changeset passes `add-changeset`'s warranted test and body rules
- [ ] Bump types match the final diff, with `fixed` groups consistent
- [ ] Duplicate and already-released entries are gone
- [ ] Deletions and bump changes were confirmed with the user
- [ ] `CHANGELOG.md` was not touched
