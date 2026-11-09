---
"buddy-changesets": minor
---

`init-changesets` now sets up a full release for an agent plugin that is not published to npm. `changeset version` syncs the plugin and vendor manifests and the marketplace catalog entries, using universal-plugin, the repo's own command, or the bundled `scripts/sync-plugin-version.mjs`. `changeset publish` creates the git tag and GitHub release. The skill used to tell plugin repos to drop the publish script, so no version was ever tagged.
