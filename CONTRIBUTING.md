# Contributing to Contentful Field Editors

Please take a moment to review this document in order to make the contribution process easy and effective for everyone involved.

> **Correction from the previous version of this file:** this document previously said the test runner was Jest. As of `#2167` (2026-05-28), every package uses **Vitest**. The Jest references below have been replaced; see `docs/ADRs/2026-05-28-vitest-replaces-jest.md` (internal-only) for the migration history.

## 1. Prerequisites

| Tool    | Version                 | Notes                                                                                                                                                            |
| ------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js | `>=20`                  | `package.json` → `engines.node`; `.nvmrc` pins `v22`; `package.json` → `volta.node` pins `22`. Use `nvm use` to match `.nvmrc`.                                  |
| Yarn    | `>=1.21.1` (Classic/v1) | `package.json` → `engines.yarn`; `volta.yarn` pins `1.21.1`. No `packageManager` field is set — see § File-Level Guidance / Notable Findings for the drift flag. |

No `.npmrc` registry token is required for local development beyond what's already in `.npmrc` (`ignore-scripts=true`). CI jobs write a job-local `.npmrc` with a `GITHUB_PACKAGES_*_TOKEN` to publish/install from the private `@contentful` npm scope — not needed for local package installs of public dependencies.

## 2. Getting Started

```bash
git clone https://github.com/contentful/field-editors.git
cd field-editors
yarn
yarn build
```

# source: package.json → scripts.build ("lerna run build --scope=@contentful/\*\*")

You are ready to go. Develop apps from the `apps/` folder, or run the Storybook playground across all components:

```bash
yarn storybook
```

# source: package.json → scripts.storybook ("storybook dev -p 9000"); scripts.start aliases to "yarn storybook"

## 3. Development Workflow

This is a Lerna-managed monorepo (`workspaces: ["packages/**", "apps/**"]`). To develop a single shared package and have it rebuild on change:

```bash
cd packages/_shared
yarn watch
```

# source: packages/\_shared/package.json → scripts.watch

To link a local package build into a locally-running Contentful web application without publishing (relevant for Contentful employees only):

```bash
yarn && yarn build
cd packages/single-line
yarn link
yarn watch
```

Then, in the consuming repository: `yarn link '@contentful/field-editor-single-line'`.

# source: existing CONTRIBUTING.md § "Integration to Contentful web application" (unchanged; command shape verified against packages/single-line/package.json scripts.watch)

To add a new package: create a new directory under `packages/`. Since Lerna manages the workspace, any package script is runnable from the root via `lerna run <script_name>` (or scoped: `lerna run <script> --scope=@contentful/<pkg-name>`).

## 4. Commands

**Development**

| Command          | Source                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `yarn storybook` | `package.json` → `scripts.storybook`                                                              |
| `yarn watch`     | `package.json` → `scripts.watch` ("lerna run --stream watch") — runs every package's watch script |

**Building**

| Command           | Source                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| `yarn build`      | `package.json` → `scripts.build` — builds `@contentful/**`-scoped packages only |
| `yarn build:apps` | `package.json` → `scripts.build:apps` — builds `*-app`-scoped packages          |
| `yarn bootstrap`  | `package.json` → `scripts.bootstrap` ("lerna bootstrap")                        |
| `yarn clean`      | `package.json` → `scripts.clean` ("lerna clean")                                |

**Testing**

| Command                              | Source                                                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn test:ci`                       | `package.json` → `scripts.test:ci` ("lerna run test:ci") — runs `vitest run` in every package                                                                 |
| `cd packages/<name> && yarn test`    | per-package `package.json` → `scripts.test` ("vitest", watch mode)                                                                                            |
| `cd packages/<name> && yarn test:ci` | per-package `package.json` → `scripts.test:ci` ("vitest run")                                                                                                 |
| `yarn test:integration`              | `package.json` → `scripts.test:integration` — starts Storybook then runs `cy:run` against it (`start-server-and-test storybook http://localhost:9000 cy:run`) |
| `yarn cy:open` / `yarn cy:open:ct`   | `package.json` → `scripts.cy:open` / `cy:open:ct` — interactive Cypress (E2E / component mode)                                                                |
| `yarn cy:run` / `yarn cy:run:ct`     | `package.json` → `scripts.cy:run` / `cy:run:ct` — headless Cypress against Chrome                                                                             |

**Linting & Type Checking**

| Command         | Source                                                                              |
| --------------- | ----------------------------------------------------------------------------------- |
| `yarn lint`     | `package.json` → `scripts.lint` ("eslint ./ --ext .js,.jsx,.ts,.tsx")               |
| `yarn lint:md`  | `package.json` → `scripts.lint:md` ("remark --no-stdout --frail _.md _/\*.md")      |
| `yarn tsc`      | `package.json` → `scripts.tsc` ("lerna run tsc") — per-package `tsc -p ./ --noEmit` |
| `yarn prettier` | `package.json` → `scripts.prettier` — writes formatting across `.js/.jsx/.ts/.tsx`  |

**i18n**

| Command                         | Source                                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `yarn extract-translation-keys` | `package.json` → `scripts.extract-translation-keys` ("lingui extract")                                                          |
| `yarn upload-translation-keys`  | `package.json` → `scripts.upload-translation-keys` — runs `tools/extract-new-translation-keys/extract-new-translation-keys.mjs` |

## 5. Testing

- **Framework:** Vitest (`vitest` / `vitest run`), not Jest — corrected as of `#2167` (2026-05-28).
- **Location:** colocated with source, e.g. `packages/single-line/src/SingleLineEditor.test.tsx` next to `SingleLineEditor.tsx`. Glob: `**/*.{test,spec}.{ts,tsx,js,jsx}` (`vitest.shared.ts`).
- **Run all:** `yarn test:ci` (root).
- **Run single package:** `cd packages/<name> && yarn test:ci`, or `yarn test` for watch mode.
- **Shared config:** every `packages/*/vitest.config.ts` calls `createVitestConfig('<package-name>')` from root `vitest.shared.ts`; global setup (Lingui mocks, `@testing-library/jest-dom/vitest`, `cleanup()` after each test) lives in root `vitest.setup.ts`. Environment: `jsdom`; pool: `threads`; `testTimeout: 15000`.
- **Component tests:** Cypress, under `cypress/component/`, run via `yarn cy:run:ct` / `yarn cy:open:ct`. In CI these run against **built** package output (CI runs `yarn build` before `cypress run`), not live TS source across package boundaries.
- **Links:**
  - [`@testing-library/react` documentation](https://testing-library.com/docs/react-testing-library/intro)
  - [Vitest documentation](https://vitest.dev/)

## 6. Code Style & Conventions

- **Language/target:** TypeScript, `target: ES2020`, `module: esnext`, `strict: true` (all strict-family flags enabled: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`). Source: `tsconfig.json`.
- **JSX:** classic `jsx: "react"` (not the automatic runtime) per root `tsconfig.json`; note `packages/rich-text/vitest.config.ts` explicitly forces the SWC React plugin into classic-runtime mode for files using the `/** @jsx jsx */` pragma (`@udecode/plate-test-utils`).
- **Linting:** ESLint (`.eslintrc.js`) extends `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`, `plugin:@typescript-eslint/recommended`, `plugin:lingui/recommended`, plus custom rules: `react-hooks/exhaustive-deps: error`, `@typescript-eslint/no-explicit-any: warn`, `no-restricted-imports` (blocks importing `emotion`, requires `@emotion/css`), `no-console: warn`, and two custom Lingui rules (`custom-lingui/enforce-translation-call-format`, `custom-lingui/enforce-translation-key-naming`) from the local plugin at `tools/eslint-plugin-custom-lingui`.
- **Import order:** enforced by `eslint-plugin-import-helpers` — groups: React imports, then external modules, then parent/sibling/index imports, alphabetized, with a blank line between groups.
- **Formatting:** Prettier (`.prettierrc`), auto-applied on commit — don't hand-format.
- **i18n:** all new user-facing strings must use the Lingui `t` macro (`@lingui/core/macro`) or `<Trans>` (`@lingui/react`), with a default `message` supplied inline (consuming apps may not provide a translation catalog). Translation key naming is enforced by the custom ESLint rule at `tools/eslint-rules/custom/enforce-translation-key-naming.js`.

## 7. Commit Convention

All commits must follow [Conventional Commits](https://github.com/conventional-changelog/commitlint) (`commitlint.config.js` extends `@commitlint/config-conventional`). Use `yarn cm` for the guided wizard (`git-cz` + `cz-lerna-changelog`). Enforced by a Husky commit-msg hook (`.husky/`).

## 8. Branch Strategy & Release Process

- `master` is the release branch. Merges to `master` (after `lint` + `unit-tests` pass) trigger the `release` CircleCI job: `lerna version --no-private --conventional-commits --create-release github --yes` then `lerna publish from-git --yes`.
- Any other branch (after `lint` + `unit-tests` pass) triggers the `prerelease` job: `lerna publish --no-private --canary --preid canary --dist-tag canary --conventional-commits --yes`. To get a testable canary build, open your PR against the `canary` branch (per root `README.md`); the CI trigger condition itself is broader than that (any non-`master` branch), so canary publishes can also happen off other branches — verify against `.circleci/config.yml` if this matters for your workflow.
- Package versions are **independent**, not lockstep (`lerna.json` → `version: "independent"`) — a change to one package does not bump every package's version.

## 9. Pull Requests

- Keep PRs focused in scope; avoid bundling unrelated commits.
- Discuss significant changes first (open an issue) before large feature work.
- `packages/` and `cypress/` changes are reviewed by `@contentful/team-content-authoring-and-publishing`; `apps/` changes by `@contentful/team-marketplace` (`.github/CODEOWNERS`).
- Dependabot PRs are grouped for Lingui packages (minor/patch) and run on a weekly schedule with a 15-day cooldown (`.github/dependabot.yml`).

## 10. CI/CD

| Job               | Trigger                                                    | What it does                                                                                          |
| ----------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `lint`            | every commit                                               | `yarn lint`, `yarn build`, `yarn tsc`                                                                 |
| `unit-tests`      | every commit                                               | `yarn build`, `yarn test:ci`, stores JUnit results from `reports/`                                    |
| `component-tests` | every commit                                               | Cypress component tests (parallelism 3) against a `cypress/browsers` Docker image, after `yarn build` |
| `prerelease`      | any branch except `master`, requires `lint` + `unit-tests` | canary publish (see § Release Process)                                                                |
| `release`         | `master` only, requires `lint` + `unit-tests`              | version bump + npm/GitHub release publish                                                             |

Source: `.circleci/config.yml`. A separate `codeql.yml` GitHub Actions workflow runs CodeQL scanning; `auto-merge.yml`, `labeler.yml`, `stale.yml`, `remove-stale.yml` handle repo hygiene automation (`.github/workflows/`).

## 11. File-Level Guidance

| Path                                                               | Why restricted / notable                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/*/dist/`                                                 | Build output — regenerated by `yarn build`, never hand-edited.                                                                                                                                                                                                                                                                                 |
| `packages/shared` (extensionless file, not a directory)            | Leftover docz-era MDX stub, last touched 2023-06-02, not referenced by Storybook's `stories` glob. Do not edit expecting it to render anywhere.                                                                                                                                                                                                |
| `tools/eslint-plugin-custom-lingui/`, `tools/eslint-rules/custom/` | Custom lint rules enforcing translation-key conventions — read before changing translation-key patterns.                                                                                                                                                                                                                                       |
| `.npmrc` (`ignore-scripts=true`)                                   | Disables install-time lifecycle scripts repo-wide. Added by commit `5876ccbf` ("chore: ignore npm scripts (#1994)", 2025-11-26) — a supply-chain hardening measure (blocks arbitrary `postinstall` scripts from dependencies at install time). Don't remove without understanding that this is a deliberate security control, not an accident. |
