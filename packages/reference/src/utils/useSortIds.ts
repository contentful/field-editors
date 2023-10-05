import React from 'react';

import { arrayMove } from '@dnd-kit/sortable';

import { ReferenceValue, ResourceLink } from '../types';

type Items = (ResourceLink | ReferenceValue)[];

export const useSortIDs = (items: Items) => {
  const sortIDs = React.useRef<{ id: string }[]>([]);

  React.useEffect(() => {
    if (items.length !== sortIDs.current.length) {
      sortIDs.current = items.map((item, index) => ({
        id:
          item.sys.type === 'ResourceLink' ? `${item.sys.urn}-${index}` : `${item.sys.id}-${index}`,
      }));
    }
  }, [items]);

  const rearrangeSortIDs = (oldIndex: number, newIndex: number) => {
    sortIDs.current = arrayMove(sortIDs.current, oldIndex, newIndex);
  };

  return { sortIDs, rearrangeSortIDs };
};
