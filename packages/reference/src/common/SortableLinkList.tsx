import React from 'react';

import tokens from '@contentful/f36-tokens';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, SortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { css, cx } from 'emotion';

import { useSortIDs } from '../utils/useSortIDs';
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
  sortingStrategy?: SortingStrategy;
  onSortStart?: (event: DragStartEvent) => void;
  onSortEnd?: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
  className?: string;
};

interface SortableLinkProps<T extends { sys: any }> {
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

  const DragHandle = React.useCallback(
    (props: { drag: React.ReactElement }) => {
      const SortableDragHandle = () => props.drag;
      return (
        <div ref={setActivatorNodeRef} className={styles.dragHandle} {...listeners}>
          <SortableDragHandle />
        </div>
      );
    },
    [listeners, setActivatorNodeRef]
  );

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
  onSortStart,
  onSortEnd,
  updateBeforeSortStart,
  sortingStrategy,
}: SortableLinkListProps<T>) => {
  const { sortIDs, rearrangeSortIDs } = useSortIDs(items);

  const onSortStartHandler = React.useCallback(
    (event: DragStartEvent) => {
      const index = sortIDs.findIndex((item) => item.id === event.active.id);
      updateBeforeSortStart?.({ index });
      onSortStart?.(event);
    },
    [updateBeforeSortStart, onSortStart, sortIDs]
  );

  const onSortEndHandler = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (active && over && active.id !== over.id) {
        const oldIndex = sortIDs.findIndex((item) => item.id === active.id);
        const newIndex = sortIDs.findIndex((item) => item.id === over.id);
        rearrangeSortIDs(oldIndex, newIndex);
        onSortEnd?.({ oldIndex, newIndex });
      }
    },
    [onSortEnd, sortIDs, rearrangeSortIDs]
  );

  return (
    <DndContext onDragStart={onSortStartHandler} onDragEnd={onSortEndHandler}>
      <SortableContext items={sortIDs} strategy={sortingStrategy}>
        <div className={cx(styles.container, className)}>
          {items.map((item, index) => {
            const id = sortIDs[index]?.id;

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
