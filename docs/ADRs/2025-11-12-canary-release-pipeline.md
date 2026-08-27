# Canary release pipeline on the `canary` branch

## Status

Accepted

## Context

Consumers of `@contentful/field-editor-*` packages (primarily the main Contentful web application) sometimes need to test unreleased changes before they land on `master` and get published as a normal release.

## Decision

Git commit `f1b5d5f2` ("feat: setup canary releases (#1978)", dated 2025-11-12) adds a `prerelease` CI job. Per `.circleci/config.yml`:

- The `prerelease` job runs on every branch except `master` (`filters.branches.ignore: master`), requires `lint` and `unit-tests` to pass, and runs `yarn lerna publish --no-private --canary --preid canary --dist-tag canary --conventional-commits --yes`.
- The `release` job runs only on `master`, requires the same checks, and runs `yarn lerna version --no-private --conventional-commits --create-release github --yes` followed by `yarn lerna publish from-git --yes`.
- README.md documents the consumer-facing workflow: open a PR against `canary` (not `master`); on merge, CI builds a version like `1.2.3-canary.123.abc1234` and publishes it to npm under the `canary` dist-tag.

Follow-up fix commits (`de7b11c5` "chore: Fix `canary` pre-release CI script", `f2befc4c` "build: fix canary version on CI prerelease job") indicate the initial rollout needed CI stabilization after launch.

## Consequences

- Every non-master branch push triggers a canary publish attempt (gated on lint/unit-tests passing) — this means canary versions accumulate for any active PR branch, not just an explicit "canary" branch as the README's simplified description might suggest. Verify this against `.circleci/config.yml`'s actual `filters` before treating README's step-by-step as the literal trigger condition.
- Canary versions are explicitly documented as "temporary and intended for testing only" (README) — not for pinning in production dependencies.
