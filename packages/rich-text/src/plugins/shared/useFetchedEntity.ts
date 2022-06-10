import { useRef, useEffect } from 'react';

import { Entry, Asset } from '@contentful/app-sdk';
import { useEntities } from '@contentful/field-editor-reference';
import areEqual from 'fast-deep-equal';

interface FetchedEntityProps {
  type: 'Entry' | 'Asset';
  id: string;
  onEntityFetchComplete?: VoidFunction;
}

export function useFetchedEntity({ type, id, onEntityFetchComplete }: FetchedEntityProps) {
  const { entries, assets, getOrLoadEntry, getOrLoadAsset } = useEntities();

  const entity = type === 'Entry' ? entries[id] : assets[id];
  const ref = useRef<Entry | Asset | 'failed' | undefined>(entity);

  // Deep compare the entity value to keep re-rendering to minimal
  useEffect(() => {
    if (!areEqual(ref.current, entity)) {
      ref.current = entity;
    }
  }, [entity]);

  // Fetch the entity if needed
  useEffect(() => {
    (type === 'Entry' ? getOrLoadEntry : getOrLoadAsset)(id);

    // "getOrLoadEntry" and "getOrLoadAsset" instances change with every
    // entity store update causing page lag on initial load
    // TODO: consider rewriting useEntities() hook to avoid that happening in
    // first place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id]);

  useEffect(() => {
    if (ref.current) {
      onEntityFetchComplete?.();
    }
  }, [onEntityFetchComplete, ref]);

  return ref.current;
}
