# TOL-4271 — Normalize react-query loading status across field editors

**Ticket:** [TOL-4271](https://contentful.atlassian.net/browse/TOL-4271)
**Type:** Bug (Medium)
**Date:** 2026-07-10

## Problem

Our packages declare `"@tanstack/react-query": "^4.3.9 || ^5.0.0"` as a peer dep, but four components use a loading-status guard that only matches v4's status strings. Under v5 those components fall through their guard, hit the success branch with `data === undefined`, and crash on `entry.sys`.

react-query v4 status: `'loading' | 'idle' | 'success' | 'error'`.
react-query v5 status: `'pending' | 'success' | 'error'` (`'loading'` renamed to `'pending'`, `'idle'` removed).

The rich-text plugin `FetchingWrappedInlineEntryCard` is the reported crash site. Three sibling inline components have the identical latent bug. Nine already-fixed sites use two drifted variants of the check (`(status as string) === 'pending'` in some, `status === 'pending'` in others; `'idle'` in some, not in others).

## Approach

Add a single helper `isLoadingStatus(status)` to `@contentful/field-editor-shared`'s `react-query` submodule. Replace all 13 inline status checks with it. This fixes the four crashes and normalizes the nine drifted sites in one pass.

Helper signature — takes `string | undefined` so callers with v4-typed or v5-typed unions all pass without casts:

```ts
export function isLoadingStatus(status: string | undefined): boolean {
  return status === 'loading' || status === 'idle' || status === 'pending';
}
```

`'idle'` is kept because two packages (`reference`, `rich-text` shared cards) type against v4 where `'idle'` is a real state. Under v5 the string is unreachable but harmless.

## Files touched

**`packages/_shared`** (new export — minor bump)

- `src/react-query.ts` — add helper export
- `src/isLoadingStatus.ts` — new file with the helper

**Crash fixes (4 sites — patch bumps)**

- `packages/rich-text/src/plugins/EmbeddedEntityInline/FetchingWrappedInlineEntryCard.tsx:124`
- `packages/rich-text/src/plugins/EmbeddedResourceInline/FetchingWrappedResourceInlineCard.tsx:46`
- `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedInlineEntryCard.tsx:124`
- `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedResourceInlineCard.tsx:45`

**Normalization (9 sites — no behavior change)**

- `packages/reference/src/assets/WrappedAssetCard/FetchingWrappedAssetCard.tsx:137`
- `packages/reference/src/entries/WrappedEntryCard/FetchingWrappedEntryCard.tsx:155`
- `packages/rich-text/src/plugins/Hyperlink/useResourceEntityInfo.ts:22`
- `packages/rich-text/src/plugins/shared/FetchingWrappedEntryCard.tsx:134`
- `packages/rich-text/src/plugins/shared/FetchingWrappedAssetCard.tsx:119`
- `packages/rich-text/src/plugins/shared/FetchingWrappedResourceCard.tsx:25`
- `packages/rich-text-alpha/src/components/FetchingWrappedEntryCard.tsx:133`
- `packages/rich-text-alpha/src/components/FetchingWrappedAssetCard.tsx:119`
- `packages/rich-text-alpha/src/components/FetchingWrappedResourceCard.tsx:25`

`FetchingWrappedResourceCard.tsx` (both copies) also checks `data === undefined` in the same guard — that stays, only the status portion goes through the helper.

## Testing

Per crash-fix file: unit test that mocks `useEntity`/`useResource` to return `status: 'pending'` and asserts the loading state renders (no crash on `entry.sys`). Match each package's existing test file conventions.

Normalized files: existing tests must still pass (no behavior change).

## Changesets

- `@contentful/field-editor-shared` — minor (new export)
- `@contentful/field-editor-reference` — patch (internal usage of new helper)
- `@contentful/field-editor-rich-text` — patch (fix + normalization)
- `@contentful/field-editor-rich-text-alpha` — patch (fix + normalization)

## Out of scope

- Refactoring away the `useEntity`/`useResource` type surface to a v5-shaped union
- Bumping the packages' `@tanstack/react-query` dev-dep from v4 to v5
- Any behavior change on `data === undefined` handling in `FetchingWrappedResourceCard`
