import { useEffect, useState } from 'react';

import { Entry, Asset } from '@contentful/app-sdk';
import { useEntities } from '@contentful/field-editor-reference';
import areEqual from 'fast-deep-equal';

interface FetchedEntityProps {
  type: 'Entry' | 'Asset';
  id: string;
  onEntityFetchComplete?: VoidFunction;
}

export function useFetchedEntity({ type, id, onEntityFetchComplete }: FetchedEntityProps) {
  const { entries, assets, getEntry, getAsset } = useEntities();

  console.log('useFetchedEntity:', { type, id, onEntityFetchComplete });
  console.log('useEntities:', { entries, assets, getEntry, getAsset });

  const store = type === 'Entry' ? entries : assets;
  console.log('store:', { store });
  const [entity, setEntity] = useState<Entry | Asset | 'failed' | undefined>(store?.[id]);

  // Deep compare the entity value to keep re-rendering to minimal
  useEffect(() => {
    if (!store || !store[id]) {
      return;
    }
    const newValue = store[id];

    if (!areEqual(entity, newValue)) {
      setEntity(newValue);
    }
  }, [store, entity, id]);

  // Fetch the entity if needed
  useEffect(() => {
    (type === 'Entry' ? getEntry : getAsset)(id);

    // "getEntry" and "getAsset" instances change with every
    // entity store update causing page lag on initial load
    // TODO: consider rewriting useEntities() hook to avoid that happening in
    // first place.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: explain this disable
  }, [type, id]);

  useEffect(() => {
    if (entity) {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, entity]);

  return entity;
}
