# SWC replaces Babel for package compilation

## Status

Accepted

## Context

Each `packages/*` package builds three outputs (`dist/cjs`, `dist/esm`, `dist/types`) via per-package `build:cjs` / `build:esm` / `build:types` scripts. Prior to this decision the toolchain relied on Babel (`@babel/core`, `@babel/preset-env`, `@babel/preset-react`, etc. — still present in root `devDependencies` today).

## Decision

Git commit `de9878fb` ("feat: setup swc compilation (#1413)", 2023-06-02) introduces SWC (`@swc/core`, `@swc/cli`) as the compiler, configured via the root `.swcrc`. The commit message states the rationale directly:

> a) lower bundle size
> b) faster performance
> c) better treeshaking

Today, `packages/*/package.json` build scripts invoke `swc src --config-file ../../.swcrc -d dist/cjs|dist/esm` (verified in `packages/single-line/package.json`). Storybook's webpack config (`.storybook/main.ts`) also uses `swc-loader`, not `babel-loader`.

## Consequences

- **`@babel/*` packages in root `devDependencies` (`@babel/core`, `@babel/eslint-parser`, `@babel/plugin-proposal-class-properties`, `@babel/plugin-proposal-nullish-coalescing-operator`, `@babel/plugin-proposal-optional-chaining`, `@babel/plugin-syntax-dynamic-import`, `@babel/plugin-syntax-flow`, `@babel/plugin-transform-runtime`, `@babel/preset-env`, `@babel/preset-react`) are `[POSSIBLY DEAD CONFIG]`.** No `.babelrc`/`babel.config.*` file exists in the repo, and no config file found (`.storybook/main.ts`, `.eslintrc.js`, `vitest.shared.ts`, CI config) references any `@babel/*` package. `.eslintrc.js` uses `@typescript-eslint/parser`, not `@babel/eslint-parser`. This should be confirmed with the team and, if genuinely unused, removed — flagged in the Phase 1 gap list (Needs Confirmation category) rather than removed unilaterally by this discovery pass.
- Type declarations are still emitted via `tsc --outDir dist/types --emitDeclarationOnly` (TypeScript compiler, not SWC) — SWC replaced the JS/TS _transpilation_ step only, not type-checking or `.d.ts` generation.
- `@lingui/swc-plugin` (added later, see Lingui decision in `decisions.md`) depends on the SWC pipeline being in place — the i18n toolchain is now coupled to this decision.
