# TOL-4271 — react-query v5 loading status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix crashes in rich-text inline entry/resource cards when the host app hoists `@tanstack/react-query` v5, by normalizing all in-repo loading-status checks through a single helper that accepts both v4 (`'loading' | 'idle'`) and v5 (`'pending'`) strings.

**Architecture:** New helper `isLoadingStatus(status: string | undefined): boolean` lives in `@contentful/field-editor-shared` under the existing `./react-query` submodule export. All 13 in-repo status checks that guard a loading render are rewritten to call it. Callsite prop/parameter types stay as they are (no signature broadening); the helper's `string | undefined` signature is a caller convenience.

**Tech Stack:** TypeScript, React, `@tanstack/react-query` v4 or v5 (peer dep, both accepted), Vitest, `@testing-library/react`, Lerna independent versioning with `conventionalCommits: true` (patch/minor bumps derived from commit prefixes).

## Global Constraints

- Commit subjects are lowercase (commitlint `subject-case`). Use `fix: [TOL-4271] <lowercase description>` for fix commits, `test: [TOL-4271] ...` for test-only commits, `feat: [TOL-4271] ...` for the helper export (drives the `_shared` minor bump under Lerna conventional commits).
- Prettier + lint-staged run on commit; do not `--no-verify`.
- No `.changeset/` files — this repo uses Lerna conventional commits to compute versions.
- No `package.json` dep changes. Peer-dep range `"@tanstack/react-query": "^4.3.9 || ^5.0.0"` is already in place where needed.
- Helper must accept `string | undefined` so v4-typed callsites (e.g. `reference`, `_shared`'s own `useQuery` re-export) and v5-typed callsites both pass without casts.
- `FetchingWrappedResourceCard` (both copies) keeps its `data === undefined || ...` prefix — helper replaces only the status portion of the guard.
- Only loading-status checks change. `success` / `error` string comparisons stay as-is. No renders refactored into `switch`.

---

## File Structure

**New files (2):**

- `packages/_shared/src/isLoadingStatus.ts` — the helper.
- `packages/_shared/src/isLoadingStatus.test.ts` — unit tests for the helper.

**Modified file — re-export (1):**

- `packages/_shared/src/react-query.ts` — add `export { isLoadingStatus } from './isLoadingStatus';`.

**Modified files — crash fixes (4):**

- `packages/rich-text/src/plugins/EmbeddedEntityInline/FetchingWrappedInlineEntryCard.tsx`
- `packages/rich-text/src/plugins/EmbeddedResourceInline/FetchingWrappedResourceInlineCard.tsx`
- `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedInlineEntryCard.tsx`
- `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedResourceInlineCard.tsx`

**New test files — crash fixes (4):**

- `packages/rich-text/src/plugins/EmbeddedEntityInline/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
- `packages/rich-text/src/plugins/EmbeddedResourceInline/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
- `packages/rich-text-alpha/src/plugins/embeds/components/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
- `packages/rich-text-alpha/src/plugins/embeds/components/__tests__/FetchingWrappedResourceInlineCard.test.tsx`

**Modified files — normalization (9, no behavior change):**

- `packages/reference/src/assets/WrappedAssetCard/FetchingWrappedAssetCard.tsx`
- `packages/reference/src/entries/WrappedEntryCard/FetchingWrappedEntryCard.tsx`
- `packages/rich-text/src/plugins/Hyperlink/useResourceEntityInfo.ts`
- `packages/rich-text/src/plugins/shared/FetchingWrappedEntryCard.tsx`
- `packages/rich-text/src/plugins/shared/FetchingWrappedAssetCard.tsx`
- `packages/rich-text/src/plugins/shared/FetchingWrappedResourceCard.tsx`
- `packages/rich-text-alpha/src/components/FetchingWrappedEntryCard.tsx`
- `packages/rich-text-alpha/src/components/FetchingWrappedAssetCard.tsx`
- `packages/rich-text-alpha/src/components/FetchingWrappedResourceCard.tsx`

**Modified doc (1):**

- `docs/superpowers/plans/…` (this plan) — no runtime effect; committed as part of the initial doc landing.

---

## Task 1: Add `isLoadingStatus` helper + unit tests in `_shared`

**Files:**

- Create: `packages/_shared/src/isLoadingStatus.ts`
- Create: `packages/_shared/src/isLoadingStatus.test.ts`
- Modify: `packages/_shared/src/react-query.ts` (add re-export line)

**Interfaces:**

- Consumes: nothing (leaf helper).
- Produces:
  - Function: `isLoadingStatus(status: string | undefined): boolean` — returns `true` for `'loading' | 'idle' | 'pending'`, else `false`.
  - Re-exported from `@contentful/field-editor-shared/react-query` (bare-import path `@contentful/field-editor-shared` does NOT re-export it — consumers must import from the `/react-query` submodule).

- [ ] **Step 1: Write the failing helper test**

Create `packages/_shared/src/isLoadingStatus.test.ts` with:

```ts
import { describe, expect, test } from 'vitest';

import { isLoadingStatus } from './isLoadingStatus';

describe('isLoadingStatus', () => {
  test.each(['loading', 'idle', 'pending'])('returns true for %s', (status) => {
    expect(isLoadingStatus(status)).toBe(true);
  });

  test.each(['success', 'error'])('returns false for %s', (status) => {
    expect(isLoadingStatus(status)).toBe(false);
  });

  test('returns false for undefined', () => {
    expect(isLoadingStatus(undefined)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @contentful/field-editor-shared test:ci src/isLoadingStatus.test.ts`
Expected: FAIL — module `./isLoadingStatus` not found (or `isLoadingStatus is not a function`).

- [ ] **Step 3: Implement the helper**

Create `packages/_shared/src/isLoadingStatus.ts`:

```ts
export function isLoadingStatus(status: string | undefined): boolean {
  return status === 'loading' || status === 'idle' || status === 'pending';
}
```

- [ ] **Step 4: Add the submodule re-export**

Edit `packages/_shared/src/react-query.ts` to add one line. After the edit the file reads:

```ts
export { SharedQueryClientProvider, useQueryClient, useQuery } from './queryClient';
export * from './hooks/useContentTypes';
export { isLoadingStatus } from './isLoadingStatus';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `yarn workspace @contentful/field-editor-shared test:ci src/isLoadingStatus.test.ts`
Expected: PASS (6 test cases).

- [ ] **Step 6: Type-check the package**

Run: `yarn workspace @contentful/field-editor-shared tsc`
Expected: exit 0, no output.

- [ ] **Step 7: Commit**

```bash
git add packages/_shared/src/isLoadingStatus.ts \
        packages/_shared/src/isLoadingStatus.test.ts \
        packages/_shared/src/react-query.ts
git commit -m "feat: [TOL-4271] export isLoadingStatus helper covering react-query v4 and v5 status strings"
```

The `feat:` prefix drives Lerna's minor bump for `@contentful/field-editor-shared` on the next release.

---

## Task 2: Crash-fix + regression test — `rich-text/EmbeddedEntityInline/FetchingWrappedInlineEntryCard.tsx`

**Files:**

- Create: `packages/rich-text/src/plugins/EmbeddedEntityInline/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
- Modify: `packages/rich-text/src/plugins/EmbeddedEntityInline/FetchingWrappedInlineEntryCard.tsx` (line 124 guard; add import)

**Interfaces:**

- Consumes: `isLoadingStatus` from `@contentful/field-editor-shared/react-query` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Write the failing regression test**

Create `packages/rich-text/src/plugins/EmbeddedEntityInline/__tests__/FetchingWrappedInlineEntryCard.test.tsx`:

```tsx
import * as React from 'react';

import { configure, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    useEntity: () => ({ data: undefined, status: 'pending' }),
    useEntityLoader: () => ({ getEntityScheduledActions: () => Promise.resolve([]) }),
  };
});

vi.mock('@contentful/field-editor-shared/react-query', async () => {
  const actual = await vi.importActual<
    typeof import('@contentful/field-editor-shared/react-query')
  >('@contentful/field-editor-shared/react-query');
  return {
    ...actual,
    useContentType: () => ({ data: undefined }),
  };
});

import { FetchingWrappedInlineEntryCard } from '../FetchingWrappedInlineEntryCard';

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  field: { locale: 'en-US' },
  locales: { default: 'en-US' },
  parameters: { instance: {} },
} as any;

test("renders the loading card when useEntity returns status: 'pending' (react-query v5)", () => {
  const { container } = render(
    <FetchingWrappedInlineEntryCard
      sdk={sdk}
      entryId="entry-id"
      isSelected={false}
      isDisabled={false}
      onEdit={() => {}}
      onRemove={() => {}}
    />,
  );

  // Loading InlineEntryCard renders a skeleton, not the entity title. The
  // pre-fix bug would crash reading `entry.sys` because data is undefined.
  expect(container.querySelector('[data-test-id="cf-ui-skeleton-form"]')).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @contentful/field-editor-rich-text test:ci src/plugins/EmbeddedEntityInline/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
Expected: FAIL — throws `TypeError: Cannot read properties of undefined (reading 'sys')` from `entry.sys.contentType.sys.id` at line 110 of the component (the pre-fix crash).

If the selector `cf-ui-skeleton-form` doesn't match the loading state in Forma36, replace it with `container.querySelector('[data-test-id="cf-ui-skeleton-container"]')` or fall back to asserting the component didn't throw and rendered _something_ other than the full card — the load-bearing check is that the render doesn't crash on `data: undefined`.

- [ ] **Step 3: Apply the crash fix**

Edit `packages/rich-text/src/plugins/EmbeddedEntityInline/FetchingWrappedInlineEntryCard.tsx`.

Add the import (in the block with other `@contentful/field-editor-shared` imports, line 12–15):

```tsx
import {
  SharedQueryClientProvider,
  isLoadingStatus,
  useContentType,
} from '@contentful/field-editor-shared/react-query';
```

Replace the guard at line 124:

```tsx
if (requestStatus === 'loading' || requestStatus === 'idle') {
  return <InlineEntryCard isLoading />;
}
```

with:

```tsx
if (isLoadingStatus(requestStatus)) {
  return <InlineEntryCard isLoading />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn workspace @contentful/field-editor-rich-text test:ci src/plugins/EmbeddedEntityInline/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check the package**

Run: `yarn workspace @contentful/field-editor-rich-text tsc`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-text/src/plugins/EmbeddedEntityInline
git commit -m "fix: [TOL-4271] treat react-query v5 'pending' as loading in inline entry card"
```

---

## Task 3: Crash-fix + regression test — `rich-text/EmbeddedResourceInline/FetchingWrappedResourceInlineCard.tsx`

**Files:**

- Create: `packages/rich-text/src/plugins/EmbeddedResourceInline/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
- Modify: `packages/rich-text/src/plugins/EmbeddedResourceInline/FetchingWrappedResourceInlineCard.tsx` (line 46 guard; add import)

**Interfaces:**

- Consumes: `isLoadingStatus` from `@contentful/field-editor-shared/react-query` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Write the failing regression test**

Create `packages/rich-text/src/plugins/EmbeddedResourceInline/__tests__/FetchingWrappedResourceInlineCard.test.tsx`:

```tsx
import * as React from 'react';

import { configure, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    useResource: () => ({ data: undefined, status: 'pending' }),
  };
});

import { FetchingWrappedResourceInlineCard } from '../FetchingWrappedResourceInlineCard';

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  field: { locale: 'en-US' },
  ids: { entry: 'entry-id' },
  parameters: { instance: {} },
} as any;

const link = {
  linkType: 'Contentful:Entry' as const,
  urn: 'crn:contentful:::content:spaces/s/environments/e/entries/target',
  type: 'ResourceLink' as const,
};

test("renders the loading card when useResource returns status: 'pending' (react-query v5)", () => {
  const { container } = render(
    <FetchingWrappedResourceInlineCard
      link={link as any}
      sdk={sdk}
      isSelected={false}
      isDisabled={false}
      onRemove={() => {}}
    />,
  );

  // Load-bearing: the render must not crash on `entry.sys`. A rendered
  // skeleton is proof that the loading guard fired.
  expect(container.firstChild).not.toBeNull();
  expect(container.textContent).not.toContain('Untitled');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @contentful/field-editor-rich-text test:ci src/plugins/EmbeddedResourceInline/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
Expected: FAIL — the current guard `requestStatus === 'loading' || data === undefined` at line 46 _does_ return early when `data === undefined`, so this exact test might already pass even before the fix. If it does, tighten it: change the mock to `data: { fake: true }, status: 'pending'` and re-run — that will crash on `resource.contentType.name` inside `getEntryTitle` at line 52, faithfully reproducing the v5 bug.

- [ ] **Step 3: Apply the crash fix**

Edit `packages/rich-text/src/plugins/EmbeddedResourceInline/FetchingWrappedResourceInlineCard.tsx`.

Add the import at the top (after the existing `@contentful/field-editor-shared` import at line 7):

```tsx
import { isLoadingStatus } from '@contentful/field-editor-shared/react-query';
```

Replace the guard at line 46:

```tsx
if (requestStatus === 'loading' || data === undefined) {
  return <InlineEntryCard isLoading />;
}
```

with:

```tsx
if (isLoadingStatus(requestStatus) || data === undefined) {
  return <InlineEntryCard isLoading />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn workspace @contentful/field-editor-rich-text test:ci src/plugins/EmbeddedResourceInline/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check the package**

Run: `yarn workspace @contentful/field-editor-rich-text tsc`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-text/src/plugins/EmbeddedResourceInline
git commit -m "fix: [TOL-4271] treat react-query v5 'pending' as loading in inline resource card"
```

---

## Task 4: Crash-fix + regression test — `rich-text-alpha/embeds/components/FetchingWrappedInlineEntryCard.tsx`

**Files:**

- Create: `packages/rich-text-alpha/src/plugins/embeds/components/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
- Modify: `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedInlineEntryCard.tsx` (line 124 guard; add import)

**Interfaces:**

- Consumes: `isLoadingStatus` from `@contentful/field-editor-shared/react-query` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Write the failing regression test**

Create the file. Use the same pattern as Task 2 (copy Task 2's Step 1 test code verbatim except swap the import path):

```tsx
import * as React from 'react';

import { configure, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    useEntity: () => ({ data: undefined, status: 'pending' }),
    useEntityLoader: () => ({ getEntityScheduledActions: () => Promise.resolve([]) }),
  };
});

vi.mock('@contentful/field-editor-shared/react-query', async () => {
  const actual = await vi.importActual<
    typeof import('@contentful/field-editor-shared/react-query')
  >('@contentful/field-editor-shared/react-query');
  return {
    ...actual,
    useContentType: () => ({ data: undefined }),
  };
});

import { FetchingWrappedInlineEntryCard } from '../FetchingWrappedInlineEntryCard';

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  field: { locale: 'en-US' },
  locales: { default: 'en-US' },
  parameters: { instance: {} },
} as any;

test("renders the loading card when useEntity returns status: 'pending' (react-query v5)", () => {
  const { container } = render(
    <FetchingWrappedInlineEntryCard
      sdk={sdk}
      entryId="entry-id"
      isSelected={false}
      isDisabled={false}
      onEdit={() => {}}
      onRemove={() => {}}
    />,
  );

  expect(container.querySelector('[data-test-id="cf-ui-skeleton-form"]')).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @contentful/field-editor-rich-text-alpha test:ci src/plugins/embeds/components/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
Expected: FAIL — crashes reading `entry.sys` (same failure mode as Task 2, same file structure).

- [ ] **Step 3: Apply the crash fix**

Edit `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedInlineEntryCard.tsx`.

Add `isLoadingStatus` to the existing `@contentful/field-editor-shared/react-query` import group (whatever shape it currently has — merge, don't add a second import statement).

Replace the guard at line 124:

```tsx
if (requestStatus === 'loading' || requestStatus === 'idle') {
  return <InlineEntryCard isLoading />;
}
```

with:

```tsx
if (isLoadingStatus(requestStatus)) {
  return <InlineEntryCard isLoading />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn workspace @contentful/field-editor-rich-text-alpha test:ci src/plugins/embeds/components/__tests__/FetchingWrappedInlineEntryCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check the package**

Run: `yarn workspace @contentful/field-editor-rich-text-alpha tsc`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedInlineEntryCard.tsx \
        packages/rich-text-alpha/src/plugins/embeds/components/__tests__/FetchingWrappedInlineEntryCard.test.tsx
git commit -m "fix: [TOL-4271] treat react-query v5 'pending' as loading in alpha inline entry card"
```

---

## Task 5: Crash-fix + regression test — `rich-text-alpha/embeds/components/FetchingWrappedResourceInlineCard.tsx`

**Files:**

- Create: `packages/rich-text-alpha/src/plugins/embeds/components/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
- Modify: `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedResourceInlineCard.tsx` (line 45 guard; add import)

**Interfaces:**

- Consumes: `isLoadingStatus` from `@contentful/field-editor-shared/react-query` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Write the failing regression test**

Same as Task 3's test — copy verbatim, only import path differs. Save to the path shown under Files above.

```tsx
import * as React from 'react';

import { configure, render } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

vi.mock('@contentful/field-editor-reference', async () => {
  const actual = await vi.importActual<typeof import('@contentful/field-editor-reference')>(
    '@contentful/field-editor-reference',
  );
  return {
    ...actual,
    useResource: () => ({ data: { fake: true }, status: 'pending' }),
  };
});

import { FetchingWrappedResourceInlineCard } from '../FetchingWrappedResourceInlineCard';

configure({ testIdAttribute: 'data-test-id' });

const sdk = {
  field: { locale: 'en-US' },
  ids: { entry: 'entry-id' },
  parameters: { instance: {} },
} as any;

const link = {
  linkType: 'Contentful:Entry' as const,
  urn: 'crn:contentful:::content:spaces/s/environments/e/entries/target',
  type: 'ResourceLink' as const,
};

test("renders the loading card when useResource returns status: 'pending' with data present (react-query v5)", () => {
  const { container } = render(
    <FetchingWrappedResourceInlineCard
      link={link as any}
      sdk={sdk}
      isSelected={false}
      isDisabled={false}
      onRemove={() => {}}
    />,
  );

  // The current guard falls through on 'pending' because it only checks
  // 'loading'. `data` is truthy here, so `data === undefined` also doesn't
  // catch it. Without the fix, this crashes accessing `resource.contentType`.
  expect(container.firstChild).not.toBeNull();
});
```

Note: this uses `data: { fake: true }` (truthy) intentionally so `data === undefined` doesn't short-circuit the guard. That's what makes the test _actually reproduce_ the v5 bug.

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn workspace @contentful/field-editor-rich-text-alpha test:ci src/plugins/embeds/components/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
Expected: FAIL — throws inside `getEntryTitle` reading properties on the fake resource.

- [ ] **Step 3: Apply the crash fix**

Edit `packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedResourceInlineCard.tsx`.

Add the import at the top (colocate with other `@contentful/field-editor-shared` imports):

```tsx
import { isLoadingStatus } from '@contentful/field-editor-shared/react-query';
```

Replace the guard at line 45:

```tsx
if (requestStatus === 'loading' || data === undefined) {
  return <InlineEntryCard isLoading />;
}
```

with:

```tsx
if (isLoadingStatus(requestStatus) || data === undefined) {
  return <InlineEntryCard isLoading />;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn workspace @contentful/field-editor-rich-text-alpha test:ci src/plugins/embeds/components/__tests__/FetchingWrappedResourceInlineCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Type-check the package**

Run: `yarn workspace @contentful/field-editor-rich-text-alpha tsc`
Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add packages/rich-text-alpha/src/plugins/embeds/components/FetchingWrappedResourceInlineCard.tsx \
        packages/rich-text-alpha/src/plugins/embeds/components/__tests__/FetchingWrappedResourceInlineCard.test.tsx
git commit -m "fix: [TOL-4271] treat react-query v5 'pending' as loading in alpha inline resource card"
```

---

## Task 6: Normalize 9 already-fixed status checks to use `isLoadingStatus`

Behavior is unchanged (verified during grilling: no site with these checks passes `enabled: false` to its driving hook, so the `'idle'` string is already unreachable in practice and adding it via the helper is redundant-but-harmless). This task only removes drift between three inline variants and consolidates the pattern.

**Files:**

- Modify: `packages/reference/src/assets/WrappedAssetCard/FetchingWrappedAssetCard.tsx`
- Modify: `packages/reference/src/entries/WrappedEntryCard/FetchingWrappedEntryCard.tsx`
- Modify: `packages/rich-text/src/plugins/Hyperlink/useResourceEntityInfo.ts`
- Modify: `packages/rich-text/src/plugins/shared/FetchingWrappedEntryCard.tsx`
- Modify: `packages/rich-text/src/plugins/shared/FetchingWrappedAssetCard.tsx`
- Modify: `packages/rich-text/src/plugins/shared/FetchingWrappedResourceCard.tsx`
- Modify: `packages/rich-text-alpha/src/components/FetchingWrappedEntryCard.tsx`
- Modify: `packages/rich-text-alpha/src/components/FetchingWrappedAssetCard.tsx`
- Modify: `packages/rich-text-alpha/src/components/FetchingWrappedResourceCard.tsx`

**Interfaces:**

- Consumes: `isLoadingStatus` from `@contentful/field-editor-shared/react-query` (Task 1).
- Produces: no new exports.

- [ ] **Step 1: Rewrite the guards**

For each file, add an import (colocate with other `@contentful/field-editor-shared` imports):

```ts
import { isLoadingStatus } from '@contentful/field-editor-shared/react-query';
```

Then replace the guard as follows (line numbers were current at time of writing — search the file for the exact original string rather than jumping to a line):

**File — original guard → replacement**

- `packages/reference/src/assets/WrappedAssetCard/FetchingWrappedAssetCard.tsx` (~line 137):
  `if (status === 'loading' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/reference/src/entries/WrappedEntryCard/FetchingWrappedEntryCard.tsx` (~line 155):
  `if (status === 'loading' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/rich-text/src/plugins/Hyperlink/useResourceEntityInfo.ts` (~line 22):
  `if (status === 'loading' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/rich-text/src/plugins/shared/FetchingWrappedEntryCard.tsx` (~line 134):
  `if (status === 'loading' || status === 'idle' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/rich-text/src/plugins/shared/FetchingWrappedAssetCard.tsx` (~line 119):
  `if (status === 'loading' || status === 'idle' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/rich-text/src/plugins/shared/FetchingWrappedResourceCard.tsx` (~line 25):
  `if (props.data === undefined || props.status === 'loading' || props.status === 'pending') {` → `if (props.data === undefined || isLoadingStatus(props.status)) {`

- `packages/rich-text-alpha/src/components/FetchingWrappedEntryCard.tsx` (~line 133):
  `if (status === 'loading' || status === 'idle' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/rich-text-alpha/src/components/FetchingWrappedAssetCard.tsx` (~line 119):
  `if (status === 'loading' || status === 'idle' || (status as string) === 'pending') {` → `if (isLoadingStatus(status)) {`

- `packages/rich-text-alpha/src/components/FetchingWrappedResourceCard.tsx` (~line 25):
  `if (props.data === undefined || props.status === 'loading' || props.status === 'pending') {` → `if (props.data === undefined || isLoadingStatus(props.status)) {`

- [ ] **Step 2: Run all touched packages' full test suites**

```bash
yarn workspace @contentful/field-editor-reference test:ci
yarn workspace @contentful/field-editor-rich-text test:ci
yarn workspace @contentful/field-editor-rich-text-alpha test:ci
```

Expected: all pass. If any existing test fails, stop and investigate — normalization was supposed to be behavior-preserving.

- [ ] **Step 3: Type-check all touched packages**

```bash
yarn workspace @contentful/field-editor-reference tsc
yarn workspace @contentful/field-editor-rich-text tsc
yarn workspace @contentful/field-editor-rich-text-alpha tsc
```

Expected: exit 0 for each.

- [ ] **Step 4: Commit**

```bash
git add packages/reference packages/rich-text packages/rich-text-alpha
git commit -m "fix: [TOL-4271] normalize react-query loading-status checks to accept v5 'pending'"
```

The `fix:` prefix drives Lerna patch bumps for all three affected packages.

---

## Task 7: Whole-repo verification

**Files:** none modified.

**Interfaces:** none.

- [ ] **Step 1: Run each affected package's full test suite**

```bash
yarn workspace @contentful/field-editor-shared test:ci
yarn workspace @contentful/field-editor-reference test:ci
yarn workspace @contentful/field-editor-rich-text test:ci
yarn workspace @contentful/field-editor-rich-text-alpha test:ci
```

Expected: all pass.

- [ ] **Step 2: Run type-check across the four affected packages**

```bash
yarn workspace @contentful/field-editor-shared tsc
yarn workspace @contentful/field-editor-reference tsc
yarn workspace @contentful/field-editor-rich-text tsc
yarn workspace @contentful/field-editor-rich-text-alpha tsc
```

Expected: exit 0 for each.

- [ ] **Step 3: Lint the affected packages**

```bash
yarn workspace @contentful/field-editor-shared lint
yarn workspace @contentful/field-editor-reference lint
yarn workspace @contentful/field-editor-rich-text lint
yarn workspace @contentful/field-editor-rich-text-alpha lint
```

Expected: exit 0 for each.

- [ ] **Step 4: Sanity-search that no `(status as string) === 'pending'` remnants slipped through**

Run: `rg -n "\(status as string\)\s*===\s*'pending'" packages/`
Expected: no matches.

Also: `rg -n "status\s*===\s*'loading'" packages/reference/src packages/rich-text/src packages/rich-text-alpha/src`
Expected: no matches (all guards should go through `isLoadingStatus` now, except in the helper itself which lives in `_shared`).

- [ ] **Step 5: No commit — this task only verifies.** If any step failed, fix and amend the offending task's commit, then re-run this task.

---

## Self-Review

Checked against spec `docs/superpowers/specs/2026-07-10-tol-4271-react-query-v5-loading-status-design.md`:

- **Helper file + export + tests** — Task 1
- **4 crash-fix sites** — Tasks 2–5, each with a regression test that mocks a `'pending'` status
- **9 normalization sites** — Task 6, batched (no behavior change so no per-site test)
- **`FetchingWrappedResourceCard` keeps `data === undefined ||` prefix** — Task 6 (both copies)
- **Prop type of `InternalEntryCard.status` NOT broadened** — Task 6 changes only the guard, not the type
- **Testing regime (helper unit tests + 4 crash-site tests)** — Tasks 1 + 2–5
- **Commit prefixes drive Lerna bumps** — Task 1 uses `feat:` (minor for `_shared`), Tasks 2–5 use `fix:` (patch for `rich-text` / `rich-text-alpha`), Task 6 uses `fix:` (patch for all three)
- **Whole-repo verification** — Task 7 (tests, type-check, lint, remnant search)

No placeholders, no "similar to Task N" without concrete code, no TBDs. Types are consistent (`isLoadingStatus` signature stays identical across every task that consumes it).
