import * as React from 'react';
import arrayMove from 'array-move';
import { ReferenceValue, EntityType, ContentType } from '../types';
import { ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor';
import { LinkEntityActions } from '../components';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';
import { useLinkActionsProps } from '../components/LinkActions/LinkEntityActions';
import { useCallback } from 'react';
import { CustomEntityCardProps } from './customCardTypes';
import { useEditorPermissions } from './useEditorPermissions';

type ChildProps = {
  entityType: EntityType;
  items: ReferenceValue[];
  isDisabled: boolean;
  setValue: (value: ReferenceValue[]) => void;
  allContentTypes: ContentType[];
  onSortStart: SortStartHandler;
  onSortEnd: SortEndHandler;
  onMove: (oldIndex: number, newIndex: number) => void;
};

type EditorProps = ReferenceEditorProps &
  Omit<ChildProps, 'onSortStart' | 'onSortEnd' | 'onMove'> & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
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
  const { setValue, entityType } = props;
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

  const onCreate = useCallback(
    (id: string, index?: number) => onLinkOrCreate(setValue, entityType, items, [id], index),
    [setValue, items, entityType]
  );

  const onLink = useCallback(
    (ids: string[], index?: number) => onLinkOrCreate(setValue, entityType, items, ids, index),
    [setValue, items, entityType]
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
    (cardProps: CustomEntityCardProps, _, renderDefaultCard) =>
      props.renderCustomCard
        ? props.renderCustomCard(cardProps, linkActionsProps, renderDefaultCard)
        : false,
    [linkActionsProps]
  );

  return (
    <>
      {props.children({
        ...props,
        onSortStart: onSortStart,
        onSortEnd: onSortEnd,
        onMove,
        renderCustomCard: props.renderCustomCard && customCardRenderer,
      })}
      <LinkEntityActions renderCustomActions={props.renderCustomActions} {...linkActionsProps} />
    </>
  );
}

export function MultipleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: EntityType;
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
  }
) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

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
