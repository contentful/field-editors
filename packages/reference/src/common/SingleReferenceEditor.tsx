import * as React from 'react';
import { useCallback } from 'react';

import { useContentTypes } from '@contentful/field-editor-shared/react-query';

import { LinkActionsProps, LinkEntityActions } from '../components';
import { useLinkActionsProps } from '../components/LinkActions/LinkEntityActions';
import { ContentType, ContentEntityType, ReferenceValue } from '../types';
import { CustomCardRenderer, CustomEntityCardProps, DefaultCardRenderer } from './customCardTypes';
import { SharedQueryClientProvider } from './queryClient';
import { ReferenceEditor, ReferenceEditorProps } from './ReferenceEditor';
import { useEditorPermissions } from './useEditorPermissions';

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
    [setValue, entityType],
  );
  const onLink = useCallback(
    (ids: string[]) => {
      const [id] = ids;
      setValue({ sys: { type: 'Link', linkType: entityType, id } });
    },
    [setValue, entityType],
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

  if (!props.entityId) {
    return (
      <LinkEntityActions renderCustomActions={props.renderCustomActions} {...linkActionsProps} />
    );
  }

  return props.children({
    ...props,
    renderCustomCard: props.renderCustomCard && customCardRenderer,
    addReferenceToRelease: props.addReferenceToRelease,
  });
}

export function SingleReferenceEditor(
  props: ReferenceEditorProps & {
    entityType: ContentEntityType;
    children: (props: ChildProps) => React.ReactElement;
  },
) {
  return (
    <SharedQueryClientProvider>
      <SingleReferenceEditorInner {...props} />
    </SharedQueryClientProvider>
  );
}

function SingleReferenceEditorInner(
  props: ReferenceEditorProps & {
    entityType: ContentEntityType;
    children: (props: ChildProps) => React.ReactElement;
  },
) {
  const { contentTypes: allContentTypes } = useContentTypes(props.sdk);

  return (
    <ReferenceEditor<ReferenceValue> {...props}>
      {({ value, setValue, disabled, externalReset }) => {
        return (
          <Editor
            {...props}
            key={`${externalReset}-reference`}
            entityId={value ? value?.sys?.id : ''}
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
