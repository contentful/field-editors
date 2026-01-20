# Query Keys - Synchronization Guide

This directory contains query key factories that **must stay in sync** with the `user_interface` repository to enable React Query cache sharing between applications.

## Why This Matters

When field editors and the Contentful web app (user_interface) use the **same query keys**, React Query can share cached data between them. This:

- Reduces duplicate API calls
- Keeps data in sync across applications
- Improves performance

## Source of Truth

The **user_interface** repository is the source of truth for query key structure:

- Repository: `contentful/user_interface`
- Location: `src/javascripts/core/react-query/cma/`

## How to Keep In Sync

### When Adding New Query Keys

1. **Check user_interface first**: Look for the corresponding hook in `user_interface/src/javascripts/core/react-query/cma/[entity]/`
2. **Copy the key factory**: Copy the `createGet[Entity]Key` function structure
3. **Add to queryKeys.ts**: Add it to our centralized file with a comment linking to the source
4. **Import and use**: Import from `../queryKeys` instead of defining inline

### Example

```ts
// ❌ DON'T: Define inline (hard to keep in sync)
const queryKey = ['contentTypes', spaceId];

// ✅ DO: Import from centralized queryKeys.ts
import { createGetManyContentTypesKey } from '../queryKeys';
const queryKey = createGetManyContentTypesKey(spaceId, environmentId, { limit: 1000 });
```

## Current Synchronized Keys

| Entity                  | user_interface Source                                                                                                                                                            | Our Location   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Content Types (getMany) | [`cma/contentType/useGetManyContentTypes.ts`](https://github.com/contentful/user_interface/blob/main/src/javascripts/core/react-query/cma/contentType/useGetManyContentTypes.ts) | `queryKeys.ts` |

## Verification Checklist

When updating query keys, verify:

- ✅ Array structure matches exactly
- ✅ Parameter order is identical
- ✅ Conditional logic (e.g., omitting empty params) is the same
- ✅ Space and environment IDs are included
- ✅ Query parameters are included in the key when provided

## Future Improvements

Propose a shared `@contentful/query-keys` package that both repositories can depend on, eliminating the need for manual synchronization.
