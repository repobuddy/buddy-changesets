---
title: Install
description: Install the buddy-changesets skills or plugin into your agent.
---

The plugin lives in the `packages/buddy-changesets` directory of the
[repository](https://github.com/repobuddy/buddy-changesets) and is installed straight
from git. It is not published to npm.

## With `npx skills`

```sh
# every skill, for every detected agent, installed globally
npx skills add repobuddy/buddy-changesets --all -g

# one skill
npx skills add repobuddy/buddy-changesets --skill changesets -g

# one skill, one agent
npx skills add repobuddy/buddy-changesets --skill changesets -a claude-code -g
```

Install `changesets` together with its `add-changeset` and `review-changesets`
sub-skills — the gateway loads them, and neither triggers on its own.

## As a Claude Code plugin

```text
/plugin marketplace add repobuddy/buddy-changesets
/plugin install buddy-changesets@repobuddy-buddy-changesets-local
```

Cursor, Codex, and GitHub Copilot CLI read the vendor manifests in the same package —
add the repository as a marketplace source in your client, or use `npx skills` above.

## Verify

Ask the agent to add a changeset in a repository that has `.changeset/config.json`. It
should classify the diff, pick a bump, and write a file into `.changeset/` — or tell you
no changeset is warranted and why.
