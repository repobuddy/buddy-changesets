---
name: add-changeset
description: "Internal skill: write a changeset file for the current change. Called by the `changesets` gateway in `add` mode, and by `review-changesets` when a pending changeset is missing."
user-invocable: false
---

# Add Changeset

Called by the **`changesets`** gateway. It has already confirmed `.changeset/config.json` exists.

A changeset declares which packages are affected by a change, the semver bump type, and a user-facing summary. It lives as a markdown file in `.changeset/` and is consumed automatically by CI to version and publish packages.

## When a Changeset Is Warranted

One test decides it: **can a consumer of the published package observe this change?** These criteria are also what **`review-changesets`** checks pending changesets against.

**Warranted:**

| The change | Bump |
|---|---|
| Fixes a bug in a published package | `patch` |
| Adds a new exported function, class, option, or command | `minor` |
| Removes or renames public API, or breaks existing usage | `major` |
| Moves a runtime `dependencies` range in a way that changes behavior, peer requirements, or the minimum supported version | `patch` |

**Not warranted** — say so and stop, or in review, the changeset is deleted:

- `devDependencies` bumps, lockfile churn
- CI/CD, build-process, or development tooling only
- Tests, fixtures, or Storybook stories
- Internal refactors with no API or behavior change
- `examples/`, `docs/`, or a `private: true` package (also check `"ignore"` in `.changeset/config.json`)

A `chore:`, `ci:`, `test:`, or `docs:` commit almost always lands here — but classify from the diff, not from the prefix alone.

Tell the user no changeset is needed and why.

## Steps

### 1. Detect the setup

Read `.changeset/config.json` to find:
- `"fixed"` — packages that share the exact same version; bumping one bumps all
- `"linked"` — packages that share the highest bump type but keep independent versions
- `"ignore"` — packages excluded from versioning
- `"access"` — `"public"` means scoped packages publish publicly

### 2. Identify affected packages

First, determine which changes to look at:

```bash
# Check for staged changes
git diff --cached --name-only

# Check for unstaged changes
git diff --name-only
```

**Scope selection rules (in priority order):**

1. **Staged changes exist** → use `git diff --cached --name-only`
2. **Only unstaged changes exist** → use `git diff --name-only`
3. **No local changes** → compare HEAD to base branch: `git diff --name-only origin/main...HEAD`

In a monorepo (has `pnpm-workspace.yaml`, `workspaces` in root `package.json`, or `bun.workspace.ts`), map changed files to their owning package (find nearest `package.json` above each changed file). Apply `fixed` group rules: if any package in a fixed group is affected, all are.

In a single-package repo, the root package is always the affected package.

### 2a. Extract context from commit messages

When scope is **no local changes** (case 3), also read recent commits for context:

```bash
# Commits on this branch not yet on base
git log origin/main..HEAD --oneline
```

Parse conventional commit prefixes to inform bump type and summary:

| Prefix | Implication |
|---|---|
| `feat:` / `feat(scope):` | at least `minor` |
| `fix:` / `fix(scope):` | at least `patch` |
| `BREAKING CHANGE:` footer or `!` after type | `major` |
| `chore:`, `ci:`, `test:`, `docs:` | no changeset needed |

Use the commit message body / subject as a starting point for the changeset summary, rewritten to be user-facing (imperative mood, no implementation details).

### 3. Determine bump type

Use the bump column in **When a Changeset Is Warranted** above, with two adjustments:

> **Pre-1.0 rule:** For packages on `0.x`, use `minor` for breaking changes — this is standard semver for pre-release packages. Only assign `major` to packages at `1.0.0` or higher.

All members of a `fixed` group carry the same bump type. When unsure between minor and patch, ask the user.

### 4. Write the changeset file

Choose a descriptive kebab-case filename that reflects the change (e.g. `fix-button-accessibility.md`, `add-retry-option.md`). Fall back to a random two-word slug (adjective + animal, e.g. `fuzzy-wolves`) when no obvious name fits or to avoid a conflict. Do not use the `changeset` CLI — write the file directly.

```markdown
---
"package-name": patch
---

Add `retry` option to fetch client.
```

- Filename: `.changeset/<name>.md`
- Each affected package gets one line in the frontmatter: `"<name>": <major|minor|patch>`
- For packages in a `fixed` group, list every package in the group with the same bump type
- The body is the user-facing summary (see summary rules below)

**Body rules** — the body appears verbatim in `CHANGELOG.md`, so it is written to a changelog's standard. **`review-changesets`** audits pending changesets against this same list.

*Substance:*
- User-facing: describe the effect, not the implementation
- Concise: one line for an ordinary change. No restated context, no hedging, no "this PR" framing
- Bullets only for migration steps or genuinely separate changes
- No internal file names, function internals, commit SHAs, or PR numbers

*Prose:*
- Imperative mood: "Add support for X", not "Added" or "Adds"
- Complete sentences ending with a period (`.`)
- Correct grammar and spelling; consistent product and API capitalization

*Markdown:*
- Backticks around every code element: package names, exports, options, props, CLI flags, file paths, and values
- Fenced code blocks carry a language tag
- No heading levels — the changelog supplies its own structure
- Lists render as lists; no stray indentation turning a paragraph into a code block
- Descriptive link text, and links that resolve

Good: `Add \`retry\` option to fetch client.`
Bad: `Updated fetchClient.ts to handle retries in the error handler`

**Breaking changes** — a `major` (or a `0.x` break) must give the old behavior, the new behavior, and the steps between them:

```markdown
---
"package-name": major
---

Remove deprecated `oldOption` config key. Use `newOption` instead.

Migration:
- Replace `oldOption: true` with `newOption: true`
```

### 5. Commit the changeset

Only commit the changeset automatically when there were **no local changes** at the start (scope case 3 — branch diff). In that case:

```bash
git add .changeset/
git commit -m "docs: add changeset"
```

If staged or unstaged changes existed (scope cases 1 or 2), tell the user the changeset file has been created and let them include it in their own commit.

## What Happens Next (don't intervene)

Once the changeset is merged to the base branch, the CI release workflow (`changesets/action`) will automatically:
1. Open or update a **"Version Packages"** PR that bumps `package.json` versions and updates `CHANGELOG.md`
2. When that PR is merged, publish to npm and create GitHub releases

The gateway's boundaries apply: never edit `CHANGELOG.md`, and never add a changeset to a "Version Packages" PR.

## Verification

- [ ] File exists in `.changeset/` with a descriptive or slug filename
- [ ] Frontmatter lists all affected packages with the correct bump type
- [ ] All packages in any `fixed` group are included together
- [ ] Summary is consumer-focused — no internal file names or commit SHAs
- [ ] Code identifiers are wrapped in backticks
- [ ] Summary ends with a period
- [ ] Breaking changes include migration steps
