# AGENTS.md

Agent-first routing table for `field-editors`, Contentful's monorepo of built-in entry-field editor React components (`@contentful/field-editor-*`).

## Where to look

| What you need                | Where to look                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| How this repo is structured  | [ARCHITECTURE.md](./ARCHITECTURE.md)                                                   |
| How to build/test/run        | [CONTRIBUTING.md](./CONTRIBUTING.md)                                                   |
| Why past decisions were made | `docs/ADRs/` (internal-only; not present in the public repo — see the team for access) |
| What this repo does          | [README.md](./README.md)                                                               |
| PR review rules              | [.bito/guidelines/](./.bito/guidelines/)                                               |

## Guardrails

- **Two owning teams, one repo.** `packages/` and `cypress/` are owned by `@contentful/team-content-authoring-and-publishing`; `apps/` (example/demo apps) is owned by `@contentful/team-marketplace` (`.github/CODEOWNERS`). Don't assume one team for the whole tree.
- **Compilation is SWC, not Babel.** Build scripts run `swc src --config-file ../../.swcrc`. `@babel/*` packages exist in root `devDependencies` but no config file in the repo references them — do not wire Babel back in without asking; treat as possibly dead.
- **Test runner is Vitest, not Jest.** Every package's `test`/`test:ci` script runs `vitest`/`vitest run`. If you find prose elsewhere in this repo referring to Jest, it is stale.
- **No Turborepo.** There is no `turbo.json` and no `turbo` CLI dependency. Monorepo task caching goes through Lerna, which uses Nx (`nx.json`) internally. Don't add Turborepo config.
- **`packages/shared` is not a directory** — it's a single extensionless file, a leftover docz-era MDX stub not matched by Storybook's `stories` glob. Do not treat it as current documentation.
- **CI builds before testing.** Both the `unit-tests` and `component-tests` CircleCI jobs run `yarn build` before running tests — Cypress component tests exercise built `dist/` output and its declared dependencies, not live `src/` imports across packages.
- **CircleCI Node image is pinned** (`cimg/node:22.22.3`) — do not bump the CI Node major version casually; a prior attempt at a newer major caused CI crashes under the test runner's worker pool.

## Safety & Permissions

- Do not remove `@babel/*` devDependencies, the `mocha` root devDependency, or `packages/shared` without explicit team confirmation — flagged as possibly-dead but not verified beyond this repo's own history.
- Do not alter `.circleci/config.yml` release/prerelease job behavior (version bumping, npm publish target, `canary` dist-tag) without asking — it drives real package publishes.
- Do not add new user-facing strings without a Lingui `t`/`<Trans>` call and default `message` — enforced by ESLint but easy to route around with `// eslint-disable`.

## Verification

```bash
yarn && yarn build && yarn lint && yarn tsc && yarn test:ci
```
