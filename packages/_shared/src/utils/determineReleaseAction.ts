import type {
  ReleaseAction,
  ReleaseV2Entity,
  ReleaseV2EntityWithLocales,
  ReleaseV2Props,
} from '../types';

type DetermineActionResult = {
  releaseAction: ReleaseAction;
  entityItem?: ReleaseV2Entity | ReleaseV2EntityWithLocales;
  addLocales?: string[];
  removeLocales?: string[];
};

function isEntryBasedAction(
  entityItem: ReleaseV2Entity | ReleaseV2EntityWithLocales,
): entityItem is ReleaseV2Entity {
  return (
    'action' in entityItem && (entityItem.action === 'publish' || entityItem.action === 'unpublish')
  );
}

function getLocalesFromEntity(entityItem: ReleaseV2EntityWithLocales): {
  addLocales: string[];
  removeLocales: string[];
} {
  const addLocales = entityItem?.add?.fields?.['*'] ?? [];
  const removeLocales = entityItem?.remove?.fields?.['*'] ?? [];
  return { addLocales, removeLocales };
}

function getLocaleBasedAction(addLocales: string[], removeLocales: string[]): ReleaseAction {
  const hasPublish = addLocales.length > 0;
  const hasUnpublish = removeLocales.length > 0;

  if (hasPublish && !hasUnpublish) {
    return 'publish';
  }

  if (!hasPublish && hasUnpublish) {
    return 'unpublish';
  }

  return 'publish';
}

// Look inside one release and decide what will happen to the requested entry (entry-based vs locale-based)
export function determineReleaseAction(
  entryId: string,
  release?: ReleaseV2Props,
): DetermineActionResult {
  if (!release) {
    return { releaseAction: 'not-in-release' };
  }

  const entityItem = release.entities?.items.find((item) => item.entity.sys.id === entryId);

  if (!entityItem) {
    return { releaseAction: 'not-in-release' };
  }

  // Entry based publishing
  if (isEntryBasedAction(entityItem)) {
    return {
      releaseAction: entityItem.action,
      entityItem,
    };
  }

  // Locale based publishing
  // Pull arrays of locales from add.fields['*'] and remove.fields['*']
  const { addLocales, removeLocales } = getLocalesFromEntity(entityItem);
  // If only addLocales: treat as 'publish'.
  // If only removeLocales: treat as 'unpublish'.
  // If both: defaults to 'publish'
  const releaseAction = getLocaleBasedAction(addLocales, removeLocales);

  return {
    releaseAction,
    entityItem,
    addLocales,
    removeLocales,
  };
}
