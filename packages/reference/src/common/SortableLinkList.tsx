import React from 'react';
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

import tokens from '@contentful/f36-tokens';
import { css, cx } from 'emotion';

import { ReferenceEditorProps } from './ReferenceEditor';

const styles = {
  container: css({
    position: 'relative',
  }),
  item: css({
    marginBottom: tokens.spacingM,
  }),
};
type SortableContainerChildProps<IType> = Pick<
  SortableLinkListProps<IType>,
  'items' | 'isDisabled'
> & {
  item: IType;
  index: number;
  DragHandle?: typeof DragHandle;
};

type SortableLinkListProps<T> = ReferenceEditorProps & {
  items: T[];
  isDisabled: boolean;
  children: (props: SortableContainerChildProps<T>) => React.ReactElement;

  className?: string;
};

const DragHandle = (props: { drag: React.ReactElement }) => {
  const SortableDragHandle = SortableHandle(() => props.drag);
  return <SortableDragHandle />;
};

const SortableLink = SortableElement((props: { children: React.ReactElement }) => (
  <div className={styles.item}>{props.children}</div>
));

const SortableLinkListInternal = SortableContainer((props: SortableLinkListProps<any>) => {
  return (
    <div className={cx(styles.container, props.className)}>
      {props.items.map((item, index) => (
        <SortableLink
          disabled={props.isDisabled}
          key={`${item.sys.urn ?? item.sys.id}-${index}`}
          index={index}>
          {props.children({
            items: props.items,
            isDisabled: props.isDisabled,
            item,
            index,
            DragHandle: props.isDisabled ? undefined : DragHandle,
          })}
        </SortableLink>
      ))}
    </div>
  );
});

// HOC does not support generics, so we mimic it via additional component
export function SortableLinkList<T>(props: SortableLinkListProps<T> & SortableContainerProps) {
  return <SortableLinkListInternal {...props}>{props.children}</SortableLinkListInternal>;
}
