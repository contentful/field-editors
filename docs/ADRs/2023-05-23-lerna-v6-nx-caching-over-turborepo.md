# Lerna v6 (Nx-backed caching) replaces Turborepo

## Status

Accepted

## Context

The monorepo previously used Turborepo for task orchestration/caching across packages (git commit `e882f9fb`, "build: use turborepo (#973)", plus a `fb8169b2` "chore: add turbo file" commit). Turborepo received routine version bumps as late as commit `5af3abaa` ("chore: bump turbo from 1.10.1 to 2.0.3 (#1674)").

## Decision

Commit `99a20eba` ("chore: lerna migrate to v6[NONE] (#1402)", 2023-05-23) migrates the monorepo to Lerna v6, which ships with built-in Nx-powered task running and caching. `nx.json` (with `targetDefaults` for `build`, `dev`, `test:ci`, `integration`, `tsc`, each with `cache: true` where applicable) first appears alongside this migration and is still present and current in the repo today. Follow-up commit `2e68b83d` ("chore: upgrade lerna to latest [] (#1634)") continues on this path.

`turbo.json` no longer exists anywhere in the current tree, and no `package.json` script (root or per-package) invokes `turbo` directly. Root scripts (`build`, `watch`, `tsc`, `test:ci`) all route through `lerna run <script>`.

An organization-wide platform initiative around the same time standardized frontend monorepos on
Lerna+Nx over Turborepo (better cache-hit performance, plus retained Lerna semver/publish support that
Nx alone doesn't provide). field-editors' migration (PR #1402) followed that low-cost migration path
(Nx layers under Lerna without changing `package.json` scripts) rather than being a field-editors-specific
tradeoff analysis — the repo converged on the platform's chosen default rather than continuing to maintain
Turborepo independently. The detailed comparative benchmarking behind that platform decision is documented
internally, not reproduced here.

## Consequences

- Build/test caching is now driven by `nx.json` `targetDefaults`, consumed transparently through `lerna run <target>` — an agent working in this repo should not add a `turbo.json` back or assume Turborepo commands (`turbo run ...`) work; they will not, because the `turbo` CLI is not a dependency.
- Cache invalidation behavior is governed by Nx's default file-hashing (`namedInputs.default: ["{projectRoot}/**/*", "sharedGlobals"]`) via `nx.json`, not by any Turborepo-specific config.
