---
name: review-changesets
description: "Internal skill: review the pending changesets in `.changeset/` for scope, accuracy, and wording, adding a missing one first. Called by the `changesets` gateway in `review` mode."
---

# Review Changesets

Called by the **`changesets`** gateway. It has already confirmed `.changeset/config.json` exists.

Every pending changeset in `.changeset/` becomes a `CHANGELOG.md` entry verbatim at the next release. This skill is the last chance to catch a wrong bump, a leaked implementation detail, or an entry that should not ship at all.

## Workflow

### 1. Add the missing changeset first

Load **`add-changeset`** and run it for the current change. If it concludes no changeset is needed, say so and continue to step 2 — reviewing what is already pending is still worthwhile.

Skip this step only when the user asked to review the existing files and nothing else.

### 2. Gather the pending changesets

```bash
ls .changeset/*.md
```

Ignore `README.md` and `config.json`. Read every remaining file, and read `.changeset/config.json` for the `fixed`, `linked`, and `ignore` groups.

Get the changes each one is meant to describe:

```bash
git log origin/main..HEAD --oneline
git diff --name-only origin/main...HEAD
```

Substitute the repo's actual base branch when it is not `main`.

### 3. Review each changeset

Apply the checks below. For each finding, note the file, what is wrong, and the fix.

**Should it exist at all?** Delete the file when the change it describes is invisible to consumers:

| Delete when the changeset covers only | Because |
|---|---|
| `devDependencies` bumps | Consumers never install them |
| Lockfile, CI, or build-tooling changes | No published artifact changes |
| Tests, fixtures, or Storybook stories | Not shipped |
| Internal refactors with no API or behavior change | Nothing for a consumer to act on |
| Docs, examples, or a `private: true` package | Not published, or not part of the package contract |

A runtime `dependencies` bump that changes behavior, peer ranges, or the minimum supported version stays — rewrite it to say what changed for the consumer, not which version bumped.

**Is it accurate?** Compare the body against the actual diff and commits:

- The described change actually happened, and happened in the packages listed in the frontmatter
- No changes are described that were reverted, dropped, or never landed
- The bump type matches the change: `major` for a break, `minor` for new public API, `patch` for a fix. Packages on `0.x` use `minor` for breaks
- Every affected package is listed, and all members of a `fixed` group carry the same bump
- Package names in the frontmatter match `package.json` exactly

**Does it carry breaking-change and migration information?** A `major` (or a `0.x` break) needs the old behavior, the new behavior, and the steps to move between them. A body that says only what was removed is incomplete.

**Is it concise?** One line for an ordinary change. Cut restated context, hedging, and "this PR" framing. Bullets are for migration steps and genuinely separate changes only.

**Is the prose right?**

- Imperative mood — "Add support for X", not "Added" or "Adds"
- User-facing effect, not implementation — no file names, function internals, commit SHAs, or PR numbers
- Complete sentences, ending with a period
- Correct grammar, spelling, and consistent product and API capitalization

**Is the markdown right?**

- Backticks around every code element: package names, exports, options, props, CLI flags, file paths, and values
- Fenced code blocks carry a language tag
- Lists and headings render as markdown — no stray indentation making a paragraph a code block
- No heading levels in the body; the changelog supplies its own structure
- Link text is descriptive, and links resolve

**Is it redundant?** Two pending changesets describing the same change get merged into one. A changeset whose change was already released, or which duplicates an entry now in `CHANGELOG.md`, gets deleted.

For the full authoring rules, load **`add-changeset`**.

### 4. Report and apply

Report the findings grouped by file, each with the proposed edit:

```text
.changeset/fuzzy-wolves.md
  - bump: patch → minor (adds the `retry` option, a new public API)
  - body: wrap `retry` in backticks; drop "in fetchClient.ts"

.changeset/lucky-pandas.md
  - delete: covers only a devDependency bump of `vitest`
```

Apply edits directly. Confirm before deleting a file or changing a bump type — both change what ships. Leave a changeset alone when it is already correct, and say so rather than rewording it for style.

Do not stage or commit; leave the changes for the user's own commit unless they ask otherwise.

## Verification

- [ ] Every file in `.changeset/` was read, not just the ones touched on this branch
- [ ] Each remaining changeset describes a consumer-visible change
- [ ] Bump types match the actual diff, with `fixed` groups consistent
- [ ] Breaking changes carry migration steps
- [ ] Code elements are in backticks; summaries are imperative and end with a period
- [ ] Deletions and bump changes were confirmed with the user
- [ ] `CHANGELOG.md` was not touched
