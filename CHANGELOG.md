# buddy-changesets

## 2.0.0

### Major Changes

- 7340dfe: Rename the `init` skill to `init-changesets`. Update any trigger or reference that names `init` directly.

### Minor Changes

- bb7e309: Default the `changesets` skill to `add` mode when the request names no mode. Ask for `review` explicitly to audit the pending changesets.
