# agent-changesets

Skills for AI agents to work with [changesets](https://github.com/changesets/changesets) — the versioning and changelog tool for JavaScript/TypeScript packages.

## Skills

| Skill | Description |
| ----- | ----------- |
| **changesets** | Gateway for an existing setup. `add` writes a changeset for the current change; `review` also audits every pending changeset for scope, bump accuracy, and wording. |
| **init** | Set up changesets in a new or existing repository, including the CI release workflow and migration off another release tool. |

`changesets` loads the `add-changeset` and `review-changesets` sub-skills; install them alongside it.

## Installation

```bash
# Install all skills globally
npx skills add repobuddy/agent-changesets --all -g

# Install a specific skill
npx skills add repobuddy/agent-changesets --skill changesets -g

# Install for a specific agent
npx skills add repobuddy/agent-changesets --skill changesets -a claude-code -g
```
