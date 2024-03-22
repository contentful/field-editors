import React, { useCallback, useState } from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import { ReferenceValue, ResourceLink } from '../types';

type Items = (ResourceLink<string> | ReferenceValue)[];

export const useSortIDs = (items: Items) => {
  const ids = (items || []).map((item, index) => {
    const { type } = item.sys;
    return {
      id: type === 'ResourceLink' ? `${item.sys.urn}-${index}` : `${item.sys.id}-${index}`,
    };
  });
  const [sortIDs, setSortIDs] = useState<{ id: string }[]>(ids);

  React.useEffect(() => {
    if (items.length !== sortIDs.length) {
      const ids = items.map((item, index) => {
        const { type } = item.sys;
        return {
          id: type === 'ResourceLink' ? `${item.sys.urn}-${index}` : `${item.sys.id}-${index}`,
        };
      });
      setSortIDs(ids);
    }
  }, [items, sortIDs.length]);

  const rearrangeSortIDs = useCallback(
    (oldIndex: number, newIndex: number) => {
      const newSortIDs = arrayMove(sortIDs, oldIndex, newIndex);
      setSortIDs(newSortIDs);
    },
    [sortIDs]
  );

  return { sortIDs, rearrangeSortIDs };
};
