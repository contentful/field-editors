# Query Keys - Synchronization Guide

This directory contains query key factories for React Query cache management.

## Why This Matters

Consistent query keys enable:

- Reduced duplicate API calls
- Better data synchronization
- Improved performance

## Best Practices

### When Adding New Query Keys

1. **Use centralized keys**: Add new key factories to `queryKeys.ts`
2. **Follow naming conventions**: Use `createGet[Entity]Key` pattern
3. **Import and use**: Import from `../queryKeys` instead of defining inline

### Example

```ts
// ❌ DON'T: Define inline (hard to keep in sync)
const queryKey = ['contentTypes', spaceId];

// ✅ DO: Import from centralized queryKeys.ts
import { createGetManyContentTypesKey } from '../queryKeys';
const queryKey = createGetManyContentTypesKey(spaceId, environmentId, { limit: 1000 });
```

## Available Query Keys

See `queryKeys.ts` for all available query key factories.

## Verification Checklist

When updating query keys, verify:

- ✅ Array structure is consistent
- ✅ Parameter order is logical
- ✅ Conditional logic (e.g., omitting empty params) is applied
- ✅ Space and environment IDs are included
- ✅ Query parameters are included in the key when provided
