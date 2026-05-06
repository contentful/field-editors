# Agent Guide — field-editors (team-marketplace paths)

## What This Repo Is
Monorepo of Contentful field editor React components (`packages/`) and example Contentful apps (`apps/`). The `packages/` are published to npm and used across Contentful's UI and by external developers.

**team-marketplace owns only the `apps/` subdirectory.** Do not modify packages in `packages/` — those are owned by other teams.

## Ownership
`@contentful/team-marketplace` (partial — `apps/` subtree only)

## What We Own: the `apps/` Directory

Five example Contentful apps that demonstrate field editor usage:

| App | What it demonstrates |
|-----|---------------------|
| `apps/singleline-app/` | Single-line text field editor |
| `apps/markdown-app/` | Markdown editor |
| `apps/rich-text-app/` | Rich text editor |
| `apps/multiple-references-app/` | Entry/asset reference picker |
| `apps/entry-app-collapsible/` | Collapsible entry editor |

These are **reference implementations** — standalone Contentful apps that wrap the field editor packages from `packages/`. They are not published to npm; they are deployed directly to the Contentful app registry.

## How `apps/` Differs from `packages/`

| | `packages/` | `apps/` (ours) |
|-|-------------|----------------|
| Ownership | Other teams | team-marketplace |
| Published | npm (`@contentful/field-editor-*`) | Contentful app registry only |
| Build | Lerna + TypeScript | react-scripts (CRA-based) |
| Tests | Vitest + Storybook | react-scripts test |
| Deploy | `lerna publish` | `yarn upload-ci` |

## Sharp Edges & Invariants

- **Do not edit `packages/`** — those are not ours. If a field editor package change is needed to support an `apps/` change, open a PR with the owning team.
- **CRA build system** — apps use `react-scripts` (Create React App), not Vite. Do not migrate to Vite without a plan.
- **Yarn workspaces** — this monorepo uses Yarn (not npm or pnpm).
- **CI deploy requires env vars** — `yarn upload-ci` reads `CONTENTFUL_ORG_ID`, `CONTENTFUL_APP_DEF_ID`, and `CONTENTFUL_ACCESS_TOKEN` from CI environment.

## Never / Always

- **Never** modify files outside `apps/` — `packages/` is not our responsibility.
- **Never** use npm or pnpm in this repo — it uses Yarn.
- **Always** test with `yarn test` inside the specific app directory before opening a PR.
- **Always** run `yarn build` in the app to verify the production build compiles before deploying.
