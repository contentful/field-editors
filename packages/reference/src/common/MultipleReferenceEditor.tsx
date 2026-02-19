import * as React from 'react';
import { useCallback } from 'react';

import { useContentTypes } from '@contentful/field-editor-shared/react-query';
import { DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import { LinkActionsProps, LinkEntityActions } from '../components';
import { useLinkActionsProps } from '../components/LinkActions/LinkEntityActions';
import { ReferenceValue, ContentEntityType, ContentType } from '../types';
import { useSortIDs } from '../utils/useSortIDs';
import { CustomCardRenderer, CustomEntityCardProps, DefaultCardRenderer } from './customCardTypes';
import { SharedQueryClientProvider } from './queryClient';
import { ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor';
import { useEditorPermissions } from './useEditorPermissions';

type ChildProps = {
  entityType: ContentEntityType;
  items: ReferenceValue[];
  isDisabled: boolean;
  setValue: (value: ReferenceValue[]) => void;
  allContentTypes: ContentType[];
  onSortStart: (event: DragStartEvent) => void;
  onSortEnd: ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => void;
  onMove: (oldIndex: number, newIndex: number) => void;
};

type EditorProps = ReferenceEditorProps &
  Omit<ChildProps, 'onSortStart' | 'onSortEnd' | 'onMove'> & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
    setIndexToUpdate?: React.Dispatch<React.SetStateAction<number | undefined>>;
  };

function onLinkOrCreate(
  setValue: ChildProps['setValue'],
  entityType: ChildProps['entityType'],
  items: ChildProps['items'],
  ids: string[],
  index = items.length,
): void {
  const links: ReferenceValue[] = ids.map((id) => ({
    sys: { type: 'Link', linkType: entityType, id },
  }));
  const newItems = Array.from(items);
  newItems.splice(index, 0, ...links);
  setValue(newItems);
}

const emptyArray: ReferenceValue[] = [];
const nullableValue = { sys: { id: 'null-value' } };

function Editor(props: EditorProps) {
  const { setValue, entityType, onSortingEnd, setIndexToUpdate } = props;
  const editorPermissions = useEditorPermissions(props);

  const items = React.useMemo(() => {
    return (
      (props.items || [])
        // If null values have found their way into the persisted
        // value for the multiref field, replace them with an object
        // that has the shape of a Link to make the missing entry/asset
        // card render
        .map((link) => link || nullableValue)
    );
  }, [props.items]);

  const { rearrangeSortIDs } = useSortIDs(items);

  const onSortStart = useCallback(() => {
    document.body.classList.add('grabbing');
  }, []);

  const onSortEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      // custom callback that is invoked *before* we sort the array
      // e.g. in Compose we want to sort the references in the referenceMap before re-rendering drag and drop
      onSortingEnd && onSortingEnd({ oldIndex, newIndex });
      const newItems = arrayMove(items, oldIndex, newIndex);
      setValue(newItems);
      setIndexToUpdate && setIndexToUpdate(undefined);
      document.body.classList.remove('grabbing');
    },
    [items, onSortingEnd, setIndexToUpdate, setValue],
  );

  const onMove = useCallback(
    (oldIndex: number, newIndex: number) => {
      const newItems = arrayMove(items, oldIndex, newIndex);
      rearrangeSortIDs(oldIndex, newIndex);
      setValue(newItems);
    },
    [items, rearrangeSortIDs, setValue],
  );

  const onCreate = useCallback(
    (id: string, index?: number) => onLinkOrCreate(setValue, entityType, items, [id], index),
    [setValue, items, entityType],
  );

  const onLink = useCallback(
    (ids: string[], index?: number) => onLinkOrCreate(setValue, entityType, items, ids, index),
    [setValue, items, entityType],
  );

  const linkActionsProps = useLinkActionsProps({
    ...props,
    canLinkMultiple: true,
    editorPermissions,
    onCreate,
    onLink,
    itemsLength: items.length,
  });

  const customCardRenderer = useCallback(
    (
      cardProps: CustomEntityCardProps,
      _: LinkActionsProps,
      renderDefaultCard: DefaultCardRenderer,
    ) =>
      props.renderCustomCard
        ? props.renderCustomCard(cardProps, linkActionsProps, renderDefaultCard)
        : false,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
    [linkActionsProps],
  ) as CustomCardRenderer;

  return (
    <>
      {props.children({
        ...props,
        onSortStart,
        onSortEnd,
        onMove,
        renderCustomCard: props.renderCustomCard && customCardRenderer,
      })}
      <LinkEntityActions renderCustomActions={props.renderCustomActions} {...linkActionsProps} />
    </>
  );
}

export function MultipleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: ContentEntityType;
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
    setIndexToUpdate?: React.Dispatch<React.SetStateAction<number | undefined>>;
  },
) {
  return (
    <SharedQueryClientProvider>
      <MultipleReferenceEditorInner {...props} />
    </SharedQueryClientProvider>
  );
}

function MultipleReferenceEditorInner(
  props: ReferenceEditorProps & {
    entityType: ContentEntityType;
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
    setIndexToUpdate?: React.Dispatch<React.SetStateAction<number | undefined>>;
  },
) {
  const { contentTypes: allContentTypes } = useContentTypes(props.sdk);

  return (
    <ReferenceEditor<ReferenceValue[]> {...props}>
      {({ value, disabled, setValue, externalReset }) => {
        return (
          <Editor
            {...props}
            items={value || emptyArray}
            isDisabled={disabled}
            setValue={setValue}
            key={`${externalReset}-list`}
            allContentTypes={allContentTypes}
          />
        );
      }}
    </ReferenceEditor>
  );
}

MultipleReferenceEditor.defaultProps = {
  hasCardEditActions: true,
};
