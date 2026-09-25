# buddy-changesets

The plugin itself: skills for AI agents to work with [changesets](https://github.com/changesets/changesets).

| Skill | Description |
| ----- | ----------- |
| **changesets** | Gateway for an existing setup. `add` writes a changeset for the current change; `review` also audits every pending changeset for scope, bump accuracy, and wording. |
| **init-changesets** | Set up changesets in a new or existing repository, including the CI release workflow and migration off another release tool. |

`changesets` loads the `add-changeset` and `review-changesets` sub-skills; install them alongside it.

This package is not published to npm. It is distributed from this repository's
`packages/buddy-changesets` subdirectory — see the [repository readme](../../readme.md)
for install commands, and the [website](https://repobuddy.github.io/buddy-changesets)
for the full documentation.
