---
"buddy-changesets": major
---

Change the `init-changesets` default release workflow on GitHub to npm trusted publishing: the generated workflow no longer passes `NPM_TOKEN`, and the skill now tells you to register a trusted publisher on npm. `NPM_TOKEN` stays documented as a legacy fallback for other CI platforms. Also fix the plugin-repo config `$schema` to `@changesets/config@4.0.0`.
