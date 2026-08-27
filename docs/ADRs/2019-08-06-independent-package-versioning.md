# Independent package versioning via Lerna

## Status

Accepted

## Context

`field-editors` is a monorepo publishing roughly 20 independently-consumable npm packages (`@contentful/field-editor-single-line`, `@contentful/field-editor-rich-text`, `@contentful/field-editor-shared`, etc.), each with its own semver lifecycle, consumed both by Contentful's main web application and by third-party Contentful Apps.

## Decision

Lerna is configured with `"version": "independent"` in `lerna.json` (root workspaces config: `"workspaces": ["packages/**", "apps/**"]` in `package.json`). This has been in place since effectively the beginning of the repository — the second commit on record, `a5eb6582` ("Dropdown field editor (#4)"), already carries `lerna.json` with `version: independent`.

**Context not found for the original rationale** — no historical record explaining the choice at inception (2019-08-06) was found. This predates any traceable design discussion available to this research pass.

The choice is consistent with the repo's structure: packages are released and consumed independently (a fix to `@contentful/field-editor-date` should not force a version bump on `@contentful/field-editor-rich-text`), so lockstep/fixed versioning would create unnecessary noise for consumers pinning specific package versions.

## Consequences

- Each package's `CHANGELOG.md` and version number move independently; consumers must track per-package versions rather than a single monorepo version.
- The release job (`.circleci/config.yml` → `release` job) runs `lerna version --no-private --conventional-commits --create-release github --yes` followed by `lerna publish from-git --yes`, which only bumps/publishes packages with changes since the last tag.
- `lerna.json`'s `ignoreChanges` (`*.md`, `*.mdx`, `**/*.spec.*`, `**/*.stories.*`, `**/__fixtures__/**`, `**/__tests__/**`) prevents doc/test-only changes from triggering a version bump — this is an explicit, evidenced refinement of the base decision, not the original decision itself.
