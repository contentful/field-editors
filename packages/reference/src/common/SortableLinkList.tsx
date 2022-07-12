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
    marginRight: tokens.spacingM,
  }),
};

type SortableContainerChildProps<IType> = SortableLinkListProps<IType> & {
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
          key={`${item.sys.id ?? item.sys.urn}-${index}`}
          index={index}>
          {props.children({
            ...props,
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
  return <SortableLinkListInternal {...props} children={props.children} />;
}
