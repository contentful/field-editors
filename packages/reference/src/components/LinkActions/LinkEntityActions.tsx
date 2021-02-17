import * as React from 'react';
import { useMemo } from 'react';
import { Action, ActionLabels, EntityType, FieldExtensionSDK } from '../../types';
import { LinkActions, LinkActionsProps } from './LinkActions';
import { createEntity, selectMultipleEntities, selectSingleEntity } from './helpers';
import { EditorPermissions } from '../../common/useEditorPermissions';

type LinkEntityActionsProps = {
  entityType: EntityType;
  canLinkMultiple: boolean;
  sdk: FieldExtensionSDK;
  isDisabled: boolean;
  editorPermissions: EditorPermissions;
  onCreate: (id: string, index?: number) => void;
  onLink: (ids: string[], index?: number) => void;
  onAction?: (action: Action) => void;
  actionLabels?: Partial<ActionLabels>;
};

export function useLinkActionsProps(props: LinkEntityActionsProps): LinkActionsProps {
  const { sdk, editorPermissions, entityType, canLinkMultiple, isDisabled, actionLabels } = props;

  const maxLinksCount = editorPermissions.validations.numberOfLinks?.max;
  const value = sdk.field.getValue();
  const linkCount = Array.isArray(value) ? value.length : value ? 1 : 0;
  const isFull = !!maxLinksCount && maxLinksCount <= linkCount;
  const isEmpty = linkCount === 0;

  const onCreate = React.useCallback(
    async (contentTypeId?: string, index?: number) => {
      const { entity, slide } = await createEntity({ sdk, entityType, contentTypeId });
      if (!entity) {
        return;
      }
      props.onCreate(entity.sys.id, index);
      props.onAction &&
        props.onAction({
          type: 'create_and_link',
          entity: entityType,
          entityData: entity,
          slide,
          index,
        });
    },
    [sdk, entityType, props.onCreate, props.onAction]
  );

  const onLinkExisting = React.useCallback(
    async (index?: number) => {
      const entity = await selectSingleEntity({
        sdk,
        entityType,
        editorPermissions,
      });
      if (!entity) {
        return;
      }
      props.onLink([entity.sys.id], index);
      props.onAction &&
        props.onAction({ type: 'select_and_link', entity: entityType, entityData: entity, index });
    },
    [sdk, entityType, props.onLink, props.onAction]
  );

  const onLinkSeveralExisting = React.useCallback(
    async (index?: number) => {
      const entities = await selectMultipleEntities({
        sdk,
        entityType,
        editorPermissions,
      });

      if (!entities || entities.length === 0) {
        return;
      }
      props.onLink(
        entities.map((item) => item.sys.id),
        index
      );

      entities.forEach((entity) => {
        props.onAction &&
          props.onAction({
            type: 'select_and_link',
            entity: entityType,
            entityData: entity,
            index,
          });
      });
    },
    [sdk, entityType, props.onLink, props.onAction]
  );

  return useMemo(
    () => ({
      entityType,
      canLinkMultiple,
      isDisabled,
      isEmpty,
      isFull,
      canCreateEntity: editorPermissions.canCreateEntity,
      canLinkEntity: editorPermissions.canLinkEntity,
      contentTypes: editorPermissions.creatableContentTypes,
      onCreate,
      onEntryCreated: props.onCreate,
      onLinkExisting: canLinkMultiple ? onLinkSeveralExisting : onLinkExisting,
      onEntryLinked: props.onLink,
      actionLabels,
    }),
    [
      entityType,
      canLinkMultiple,
      isDisabled,
      isEmpty,
      isFull,
      editorPermissions.canCreateEntity,
      editorPermissions.canLinkEntity,
      actionLabels,
      editorPermissions.creatableContentTypes.map((ct) => ct.sys.id).join(':'),
      onCreate,
      props.onCreate,
      onLinkExisting,
      props.onLink,
      onLinkSeveralExisting,
    ]
  );
}

export function LinkEntityActions({
  renderCustomActions,
  ...props
}: LinkActionsProps & {
  renderCustomActions?: (props: LinkActionsProps) => React.ReactElement;
}) {
  const renderLinkActions = renderCustomActions
    ? renderCustomActions
    : (props: LinkActionsProps) => <LinkActions {...props} />;

  return renderLinkActions(props);
}
