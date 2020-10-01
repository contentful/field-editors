import * as React from 'react';
import { ContentType, EntityType, ReferenceValue } from '../types';
import { LinkEntityActions } from '../components';
import {
  CustomActionProps,
  CustomEntryCardProps,
  ReferenceEditor,
  ReferenceEditorProps,
} from './ReferenceEditor';
import { useLinkActionsProps } from '../components/LinkActions/LinkEntityActions';
import { useCallback } from 'react';
import { fromFieldValidations } from '../utils/fromFieldValidations';
import { useEntityPermissions } from './useEntityPermissions';

type ChildProps = {
  entityId: string;
  entityType: EntityType;
  isDisabled: boolean;
  setValue: (value: ReferenceValue | null | undefined) => void;
  allContentTypes: ContentType[];
  renderCustomCard?: (
    props: CustomEntryCardProps,
    linkActionsProps: CustomActionProps,
    renderDefaultCard: (props?: CustomEntryCardProps) => React.ReactElement
  ) => React.ReactElement | false;
  hasCardEditActions: boolean;
};

type EditorProps = ReferenceEditorProps &
  ChildProps & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
  };

function Editor(props: EditorProps) {
  const { setValue, entityType } = props;
  const { canCreateEntity, canLinkEntity } = useEntityPermissions(props);

  const onCreate = useCallback(
    (id: string) => void setValue({ sys: { type: 'Link', linkType: entityType, id } }),
    [setValue, entityType]
  );
  const onLink = useCallback(
    (ids: string[]) => {
      const [id] = ids;
      setValue({ sys: { type: 'Link', linkType: entityType, id } });
    },
    [setValue, entityType]
  );

  const validations = fromFieldValidations(props.sdk.field.validations);
  const linkActionsProps = useLinkActionsProps({
    ...props,
    canLinkMultiple: false,
    validations,
    canCreateEntity,
    canLinkEntity,
    onCreate,
    onLink,
  });
  const customCardRenderer = useCallback(
    (cardProps: CustomEntryCardProps, linkActionsProps, renderDefaultCard) =>
      props.renderCustomCard
        ? props.renderCustomCard(cardProps, linkActionsProps, renderDefaultCard)
        : false,
    []
  );

  if (!props.entityId) {
    return (
      <LinkEntityActions renderCustomActions={props.renderCustomActions} {...linkActionsProps} />
    );
  }

  return props.children({
    ...props,
    renderCustomCard: props.renderCustomCard && customCardRenderer,
  });
}

export function SingleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: EntityType;
    children: (props: ChildProps) => React.ReactElement;
  }
) {
  const allContentTypes = props.sdk.space.getCachedContentTypes();

  return (
    <ReferenceEditor<ReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        return (
          <Editor
            {...props}
            key={`${externalReset}-reference`}
            entityId={value ? value.sys.id : ''}
            isDisabled={disabled}
            setValue={setValue}
            allContentTypes={allContentTypes}
          />
        );
      }}
    </ReferenceEditor>
  );
}

SingleReferenceEditor.defaultProps = {
  hasCardEditActions: true,
};
