import * as React from 'react';
import { useCallback } from 'react';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';

import { FieldConnector } from '@contentful/field-editor-shared';
import arrayMove from 'array-move';
import deepEqual from 'deep-equal';

import { EntityProvider } from '../common/EntityStore';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SortableLinkList } from '../common/SortableLinkList';
import { CombinedLinkActions } from '../components';
import { ResourceLink } from '../types';
import { EntryRoute } from './Cards/ContentfulEntryCard';
import { ResourceCard } from './Cards/ResourceCard';
import { useResourceLinkActions } from './useResourceLinkActions';

type ChildProps = {
  items: ResourceLink[];
  isDisabled: boolean;
  setValue: (value: ResourceLink[]) => void;
  onSortStart: SortStartHandler;
  onSortEnd: SortEndHandler;
  onMove: (oldIndex: number, newIndex: number) => void;
  onRemoteItemAtIndex: (index: number) => void;
};

type EditorProps = ReferenceEditorProps &
  Omit<ChildProps, 'onSortStart' | 'onSortEnd' | 'onMove' | 'onRemoteItemAtIndex'> & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
    apiUrl: string;
  };

function ResourceEditor(props: EditorProps) {
  const { setValue, items, apiUrl } = props;

  const onSortStart: SortStartHandler = useCallback((_, event) => event.preventDefault(), []);
  const onSortEnd: SortEndHandler = useCallback(
    ({ oldIndex, newIndex }) => {
      const newItems = arrayMove(items, oldIndex, newIndex);
      setValue(newItems);
    },
    [items, setValue]
  );
  const onMove = useCallback(
    (oldIndex, newIndex) => {
      const newItems = arrayMove(items, oldIndex, newIndex);
      setValue(newItems);
    },
    [items, setValue]
  );

  const onRemoteItemAtIndex = useCallback(
    (index) => {
      setValue(items.filter((_v, i) => i !== index));
    },
    [items, setValue]
  );

  const { dialogs, field } = props.sdk;
  const linkActionsProps = useResourceLinkActions({
    dialogs,
    field,
    apiUrl,
  });

  return (
    <>
      {props.children({
        ...props,
        onSortStart,
        onSortEnd,
        onMove,
        onRemoteItemAtIndex,
      })}
      <CombinedLinkActions {...linkActionsProps} />
    </>
  );
}

// provides memoized callbacks bound to a given item
function WithPerItemCallbacks({
  listLength,
  index,
  onMove,
  onRemoteItemAtIndex,
  children,
}: {
  listLength: number;
  index: number;
  onMove: (oldIndex: number, newIndex: number) => void;
  onRemoteItemAtIndex: (index: number) => void;
  children: (props: {
    onMoveTop: VoidFunction | undefined;
    onMoveBottom: VoidFunction | undefined;
    onRemove: VoidFunction | undefined;
  }) => React.ReactNode;
}) {
  const handleMoveTop = React.useMemo(
    () => (index > 0 ? () => onMove(index, 0) : undefined),
    [index, onMove]
  );
  const handleMoveBottom = React.useMemo(
    () => (index < listLength - 1 ? () => onMove(index, listLength - 1) : undefined),
    [index, onMove, listLength]
  );
  const handleRemove = useCallback(() => onRemoteItemAtIndex(index), [index, onRemoteItemAtIndex]);

  return (
    <>
      {children({
        onMoveBottom: handleMoveBottom,
        onMoveTop: handleMoveTop,
        onRemove: handleRemove,
      })}
    </>
  );
}

const EMPTY_ARRAY: ResourceLink[] = [];

export function MultipleResourceReferenceEditor(
  props: ReferenceEditorProps & {
    apiUrl: string;
    getEntryRouteHref: (entryRoute: EntryRoute) => string;
  }
) {
  return (
    <EntityProvider sdk={props.sdk}>
      <FieldConnector<ResourceLink[]>
        throttle={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
        isEqualValues={deepEqual}>
        {({ value, disabled, setValue, externalReset }) => {
          return (
            <ResourceEditor
              {...props}
              items={value || EMPTY_ARRAY}
              isDisabled={disabled}
              setValue={setValue}
              key={`${externalReset}-list`}>
              {(editorProps) => (
                <SortableLinkList<ResourceLink> {...editorProps}>
                  {({ item, isDisabled, DragHandle, index }) => (
                    <WithPerItemCallbacks
                      index={index}
                      onMove={editorProps.onMove}
                      onRemoteItemAtIndex={editorProps.onRemoteItemAtIndex}
                      listLength={value?.length || 0}>
                      {({ onMoveBottom, onMoveTop, onRemove }) => (
                        <ResourceCard
                          index={index}
                          resourceLink={item}
                          isDisabled={isDisabled}
                          renderDragHandle={DragHandle}
                          onMoveTop={onMoveTop}
                          onMoveBottom={onMoveBottom}
                          onRemove={onRemove}
                          getEntryRouteHref={props.getEntryRouteHref}
                        />
                      )}
                    </WithPerItemCallbacks>
                  )}
                </SortableLinkList>
              )}
            </ResourceEditor>
          );
        }}
      </FieldConnector>
    </EntityProvider>
  );
}
