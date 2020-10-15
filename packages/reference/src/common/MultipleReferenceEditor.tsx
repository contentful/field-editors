import * as React from 'react';
import arrayMove from 'array-move';
import { ReferenceValue, EntityType, ContentType } from '../types';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { CustomEntryCardProps, ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor';
import { LinkEntityActions } from '../components';
import { SortEndHandler, SortStartHandler } from 'react-sortable-hoc';
import { useLinkActionsProps } from '../components/LinkActions/LinkEntityActions';
import { useCallback } from 'react';
import { useEntityPermissions } from './useEntityPermissions';

type ChildProps = {
  entityType: EntityType;
  items: ReferenceValue[];
  isDisabled: boolean;
  setValue: (value: ReferenceValue[]) => void;
  allContentTypes: ContentType[];
  onSortStart: SortStartHandler;
  onSortEnd: SortEndHandler;
};

type EditorProps = ReferenceEditorProps &
  Omit<ChildProps, 'onSortStart' | 'onSortEnd'> & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
  };

function onLinkOrCreate(
  setValue: ChildProps['setValue'],
  entityType: ChildProps['entityType'],
  items: ChildProps['items'],
  ids: string[],
  index?: number
): void {
  const links: ReferenceValue[] = ids.map((id) => ({
    sys: { type: 'Link', linkType: entityType, id },
  }));
  const newItems = Array.from(items);
  newItems.splice(index !== undefined ? index : items.length, 0, ...links);
  setValue(newItems);
}

function Editor(props: EditorProps) {
  const { items, setValue, entityType } = props;
  const { canCreateEntity, canLinkEntity } = useEntityPermissions(props);

  const onSortStart: SortStartHandler = useCallback((_, event) => event.preventDefault(), []);
  const onSortEnd: SortEndHandler = useCallback(
    ({ oldIndex, newIndex }) => {
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

  const validations = fromFieldValidations([
    ...props.sdk.field.validations,
    ...(props.sdk.field.items?.validations ?? []),
  ]);
  const linkActionsProps = useLinkActionsProps({
    ...props,
    canLinkMultiple: true,
    validations,
    canCreateEntity,
    canLinkEntity,
    onCreate,
    onLink,
  });
  const customCardRenderer = useCallback(
    (cardProps: CustomEntryCardProps, _, renderDefaultCard) =>
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
        const items = value || [];
        return (
          <Editor
            {...props}
            items={items}
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
