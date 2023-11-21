import * as React from 'react';
import { useCallback } from 'react';

import { LinkEntityActions } from '../components/index.js';
import { useLinkActionsProps } from '../components/LinkActions/LinkEntityActions.js';
import { ContentType, ContentEntityType, ReferenceValue } from '../types.js';
import { CustomEntityCardProps } from './customCardTypes.js';
import { ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor.js';
import { useEditorPermissions } from './useEditorPermissions.js';

type ChildProps = {
  entityId: string;
  entityType: ContentEntityType;
  isDisabled: boolean;
  setValue: (value: ReferenceValue | null | undefined) => void;
  allContentTypes: ContentType[];
  renderCustomCard?: ReferenceEditorProps['renderCustomCard'];
  hasCardEditActions: boolean;
  hasCardRemoveActions?: boolean;
};

type EditorProps = ReferenceEditorProps &
  ChildProps & {
    children: (props: ReferenceEditorProps & ChildProps) => React.ReactElement;
  };

function Editor(props: EditorProps) {
  const { setValue, entityType } = props;
  const editorPermissions = useEditorPermissions(props);

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

  const linkActionsProps = useLinkActionsProps({
    ...props,
    canLinkMultiple: false,
    editorPermissions,
    onCreate,
    onLink,
  });
  // Inject card actions props into the given custom card renderer
  const customCardRenderer = useCallback(
    (cardProps: CustomEntityCardProps, _, renderDefaultCard) =>
      props.renderCustomCard
        ? props.renderCustomCard(cardProps, linkActionsProps, renderDefaultCard)
        : false,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO: Evaluate the dependencies
    [linkActionsProps]
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
    entityType: ContentEntityType;
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
  hasCardRemoveActions: true,
};
