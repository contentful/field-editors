# Test runner migration: Jest → Vitest

## Status

Accepted

## Context

Prior to this decision, packages used Jest as the unit test runner (evidenced by the migration commit itself referencing `jest.config.js` removal, `jest.setup.js`, `jest.spyOn`, and `@testing-library/jest-dom/extend-expect`). The build toolchain had already moved to SWC (see `2023-06-02-swc-for-compilation.md`) and Vite/`@vitejs/plugin-react-swc` tooling was already a natural fit given the SWC-based pipeline.

## Decision

Git commit `3e29f973` ("chore: migrate test runner from jest to vitest (#2167)", dated 2026-05-28) performs a full migration in a single squashed PR with a documented sub-commit sequence:

1. Add `vitest`, `@vitejs/plugin-react-swc`, `jsdom` as dependencies (Jest left in place initially).
2. Add a shared `vitest.shared.ts` exporting `createVitestConfig(packageName)`, consumed by every per-package `vitest.config.ts`.
3. Port `jest.setup.js` → `vitest.setup.ts` (mirrors the existing Lingui mocks).
4. Pilot the migration on `packages/single-line` first (rename `jest.spyOn` → `vi.spyOn`, switch to `@testing-library/jest-dom/vitest`, remove `packages/single-line/jest.config.js`).
5. Roll the same recipe to every other package one at a time (`_test`, `_shared`, `boolean`, `checkbox`, `date`, `default-field-editors`, `dropdown`, `json`, `list`, `location`, `markdown`, `multiple-line`, `number`, `radio`, `rating`, `reference`, `rich-text`, `rich-text-alpha`, `slug`, `tags`, `url`, `validation-errors`).
6. Remove all Jest configuration and dependencies globally; replace `eslint-plugin-jest` with `@vitest/eslint-plugin`.
7. Follow-up CI tuning: switch to the `threads` pool ("to avoid fork worker timeouts in CI"), raise `testTimeout` to 15s, drop unused Cypress `parallelism`, and downgrade the CircleCI Node image from 24 to 22 ("to avoid v8 crashes on circleci").

No single-sentence "why Vitest" statement exists in the commit message or in any research pass for this repo. [INFERRED] The most likely driver, based on the mechanical evidence, is toolchain consolidation: Vitest uses the same Vite/SWC-based transform pipeline the repo had already adopted for builds and Storybook, removing a second, separately-configured (Babel/ts-jest-adjacent) transform pipeline that Jest required.

## Consequences

- **`CONTRIBUTING.md` in the target repo currently says "We use [Jest] and [Testing Library] for writing unit tests" — this is stale as of this migration.** Every package's `test`/`test:ci` script now runs `vitest` / `vitest run`, not Jest. This is flagged in the Phase 1 gap/notable-findings list and should be corrected when this ADR and the CONTRIBUTING.md draft are reviewed.
- Global mocks (Lingui `t`, `plural`, `i18n`) live in one shared `vitest.setup.ts`, referenced by `vitest.shared.ts`'s `createVitestConfig`, rather than being duplicated per package.
- `packages/rich-text/vitest.config.ts` and `packages/reference/vitest.config.ts` override `process.env.TZ = 'UTC'` for timezone-sensitive date assertions — this is a per-package Vitest config override, not related to application runtime config.
- CI pinned to Node 22 (not 24) specifically because of a v8 crash observed with Vitest's worker pool on CircleCI — an agent should not "helpfully" bump the CircleCI Node image without checking this history first.
