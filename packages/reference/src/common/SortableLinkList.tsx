import React from 'react';

import tokens from '@contentful/f36-tokens';
import { DndContext } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { css, cx } from 'emotion';

import { ReferenceEditorProps } from './ReferenceEditor';

const styles = {
  container: css({
    position: 'relative',
  }),
  item: css({
    position: 'relative',
    marginBottom: tokens.spacingM,
  }),
  isDragging: css({
    zIndex: tokens.zIndexModal,
  }),
  dragHandle: css({
    display: 'flex',
  }),
};
type SortableContainerChildProps<IType> = Pick<
  SortableLinkListProps<IType>,
  'items' | 'isDisabled'
> & {
  item: IType;
  index: number;
  DragHandle?: (props: { drag: React.ReactElement }) => React.ReactElement;
};

type SortableLinkListProps<T> = ReferenceEditorProps & {
  items: T[];
  isDisabled: boolean;
  children: (props: SortableContainerChildProps<T>) => React.ReactElement;
  onMove?: (oldIndex: number, newIndex: number) => void;
  className?: string;
};

interface SortableLinkProps<T> {
  id: string;
  items: T[];
  item: T;
  isDisabled?: boolean;
  index: number;
  children: (props: SortableContainerChildProps<T>) => React.ReactElement;
}

const SortableLink = <T extends { sys: any }>({
  id,
  items,
  item,
  isDisabled = false,
  index,
  children,
}: SortableLinkProps<T>) => {
  const { listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: transform ? CSS.Transform.toString({ ...transform, scaleX: 1, scaleY: 1 }) : '',
    transition,
  };

  const DragHandle = (props: { drag: React.ReactElement }) => {
    const SortableDragHandle = () => props.drag;
    return (
      <div ref={setActivatorNodeRef} className={styles.dragHandle} {...listeners}>
        <SortableDragHandle />
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cx(styles.item, { [styles.isDragging]: isDragging })}
    >
      {children({
        items,
        isDisabled,
        item,
        index,
        DragHandle: isDisabled ? undefined : DragHandle,
      })}
    </div>
  );
};

export const SortableLinkList = <T extends { sys: any }>({
  items,
  isDisabled,
  className,
  children,
  onMove,
}: SortableLinkListProps<T>) => {
  const itemsMap = React.useMemo(
    () => items.map((item, index) => ({ id: `${item.sys.id}-${index}` })),
    [items]
  );

  const onDragEnd = React.useCallback(
    ({ active, over }) => {
      if (active && over && active.id !== over.id) {
        const oldIndex = itemsMap.findIndex((item) => item.id === active.id);
        const newIndex = itemsMap.findIndex((item) => item.id === over.id);
        onMove?.(oldIndex, newIndex);
      }
    },
    [itemsMap, onMove]
  );
  return (
    <DndContext onDragEnd={onDragEnd}>
      <SortableContext items={itemsMap}>
        <div className={cx(styles.container, className)}>
          {items.map((item, index) => {
            const id = `${item.sys.urn ?? item.sys.id}-${index}`;
            return (
              <SortableLink<T>
                key={id}
                id={id}
                items={items}
                item={item}
                isDisabled={isDisabled}
                index={index}
              >
                {children}
              </SortableLink>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
