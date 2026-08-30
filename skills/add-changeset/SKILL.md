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
- `examples/`, `docs/`, or an ignored package (check `"ignore"` in `.changeset/config.json`)
- A `private: true` package — **unless** the config sets `privatePackages.version`, which means the
  package is released by tag rather than by npm, and its changes are as observable as any published
  package's

A `chore:`, `ci:`, `test:`, or `docs:` commit almost always lands here — but classify from the diff, not from the prefix alone.

Tell the user no changeset is needed and why.

When the changed files are agent configuration — skills, subagents, commands, hooks, or a plugin
manifest — **Agent Configuration as a Published Surface** below extends both lists and overrides the
`docs/` exclusion. It applies to that repo's product, not to the config that steers agents working
in an ordinary code repo.

## Agent Configuration as a Published Surface

When the repo's product is agent configuration — skills, subagents, commands, hooks, MCP servers, a
plugin manifest — the same consumer test applies, but the consumer installs prose. The text *is* the
behavior, so there is no cosmetic tier, and a runtime's plugin cache is keyed by version: content
that ships without a bump never reaches anyone. **Every change to shipped agent config is at least
`patch`.**

### Which files ship

The manifest decides, never the directory name. Read whichever are present — `plugin.json`,
`.claude-plugin/plugin.json`, `.cursor-plugin/`, `.codex-plugin/`, any `marketplace.json` — and take
their path fields (`skills`, `agents`, `commands`, `hooks`, `mcpServers`) as the shipped trees. Fall
back to `package.json` `"files"` when the repo publishes to npm.

Everything outside those trees is repo-local config, not product — `.agents/`, `.claude/`,
`.cursor/`, `.github/`, `AGENTS.md`, `CLAUDE.md`, and any skill whose frontmatter carries
`metadata.internal: true`. No changeset. A repo *may* ship from `.agents/skills`; if its manifest
says so, that tree is product.

Resolve symlinks before counting a file. `.claude/skills` is commonly a generated bridge into the
shipped tree — a change surfacing there is the same change, not a second one.

### Which bump

One question decides: **what would an agent following the new text do differently?**

| The change | Bump |
|---|---|
| Nothing differs, or the same work is done more reliably — sharpened wording, reordered steps, typo, corrected link or example | `patch` |
| Instructions that produced wrong results are fixed — a wrong flag, a dead path, a command that fails, guidance that led the agent astray | `patch` |
| A tool or CLI version referenced in the body moves | `patch` |
| A new skill, subagent, command, hook, or MCP server is added | `minor` |
| An existing skill gains a mode, option, step, or reference file consumers can now use | `minor` |
| A `description` broadens so the skill triggers in situations it did not before | `minor` |
| Guidance is extended to a case it did not handle — another stack, another tool, another harness | `minor` |
| A vendor or harness target is added to the manifest | `minor` |
| A shipped skill, command, agent, or hook is removed or renamed, including the name a user types | `major` |
| A `description` narrows so the skill stops triggering where it used to — it silently stops firing | `major` |
| A default changes so the same request produces a materially different result: different files written, different tool chosen, different output shape | `major` |
| A user-invocable skill becomes internal, or moves behind a gateway | `major` |
| A reference file or script loaded by path is removed or renamed | `major` |
| A new prerequisite appears — a tool, CLI, or harness version consumers may not have | `major` |
| A vendor or harness target is dropped from the manifest | `major` |

The pre-1.0 rule below applies here too: on `0.x`, a break is `minor`.

## Steps

### 1. Detect the setup

Read `.changeset/config.json` to find:
- `"fixed"` — packages that share the exact same version; bumping one bumps all
- `"linked"` — packages that share the highest bump type but keep independent versions
- `"ignore"` — packages excluded from versioning
- `"access"` — `"public"` means scoped packages publish publicly
- `"privatePackages"` — `{ "version": true }` means `private: true` packages are still versioned and
  tagged; the repo releases by tag instead of by npm publish

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

Nearest-`package.json` is the wrong rule for agent config, which routinely sits at the repo root
while the manifest that ships it lives in a package. Map a changed config file to the package whose
manifest declares that tree; fall back to the nearest `package.json` only when no manifest claims it.

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

Use the bump column in **When a Changeset Is Warranted** above — or in **Agent Configuration as a
Published Surface** for shipped agent config — with two adjustments:

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

In a plugin repo, the release also carries the new number from `package.json` into the plugin
manifests — `universal-plugin publish sync-version` then `plugin build`, where that toolchain is in
use. Never hand-edit a `version` field in `plugin.json` or a vendor manifest; it is derived, the same
way `CHANGELOG.md` is.

The gateway's boundaries apply: never edit `CHANGELOG.md`, and never add a changeset to a "Version Packages" PR.

## Verification

- [ ] File exists in `.changeset/` with a descriptive or slug filename
- [ ] Frontmatter lists all affected packages with the correct bump type
- [ ] Every changed agent-config file was called shipped or internal from the manifest, not the path
- [ ] Shipped agent-config changes carry at least a `patch`, lifted where the behavior test says so
- [ ] All packages in any `fixed` group are included together
- [ ] Summary is consumer-focused — no internal file names or commit SHAs
- [ ] Code identifiers are wrapped in backticks
- [ ] Summary ends with a period
- [ ] Breaking changes include migration steps
