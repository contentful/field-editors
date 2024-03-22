import * as React from 'react';
import { useCallback } from 'react';

import { FieldConnector } from '@contentful/field-editor-shared';
import { DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import deepEqual from 'deep-equal';
import noop from 'lodash/noop';

import { EntityProvider } from '../common/EntityStore';
import { ReferenceEditorProps } from '../common/ReferenceEditor';
import { SortableLinkList } from '../common/SortableLinkList';
import { CombinedLinkEntityActions } from '../components/LinkActions/LinkEntityActions';
import { ResourceLink } from '../types';
import { EntryRoute } from './Cards/ContentfulEntryCard';
import { ResourceCard } from './Cards/ResourceCard';
import { useResourceLinkActions } from './useResourceLinkActions';

type ChildProps = {
  items: ResourceLink<string>[];
  isDisabled: boolean;
  setValue: (value: ResourceLink<string>[]) => void;
  onSortStart: (event: DragStartEvent) => void;
  onSortEnd: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
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

  const onSortStart = () => noop();
  const onSortEnd = useCallback(
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
      <CombinedLinkEntityActions
        {...linkActionsProps}
        renderCustomActions={props.renderCustomActions}
      />
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

const EMPTY_ARRAY: ResourceLink<string>[] = [];

export function MultipleResourceReferenceEditor(
  props: ReferenceEditorProps & {
    apiUrl: string;
    getEntryRouteHref: (entryRoute: EntryRoute) => string;
  }
) {
  return (
    <EntityProvider sdk={props.sdk}>
      <FieldConnector<ResourceLink<string>[]>
        debounce={0}
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
              renderCustomActions={props.renderCustomActions}
              key={`${externalReset}-list`}>
              {(editorProps) => (
                <SortableLinkList<ResourceLink<string>> {...editorProps}>
                  {({ item, isDisabled, DragHandle, index }) => (
                    <WithPerItemCallbacks
                      key={index}
                      index={index}
                      onMove={editorProps.onMove}
                      onRemoteItemAtIndex={editorProps.onRemoteItemAtIndex}
                      listLength={value?.length || 0}>
                      {({ onMoveBottom, onMoveTop, onRemove }) => (
                        <ResourceCard
                          key={index}
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
