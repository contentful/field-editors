import * as React from 'react';
import { useMemo } from 'react';
import { Action, ActionLabels, ContentType, EntityType, FieldExtensionSDK } from '../../types';
import { ReferenceValidations } from '../../utils/fromFieldValidations';
import { LinkActions, LinkActionsProps } from './LinkActions';
import { createEntity, selectMultipleEntities, selectSingleEntity } from './helpers';

type LinkEntityActionsProps = {
  entityType: EntityType;
  canLinkMultiple: boolean;
  sdk: FieldExtensionSDK;
  allContentTypes: ContentType[];
  isDisabled: boolean;
  canCreateEntity: boolean;
  canLinkEntity: boolean;
  validations: ReferenceValidations;
  onCreate: (id: string) => void;
  onLink: (ids: string[]) => void;
  onAction?: (action: Action) => void;
  actionLabels?: Partial<ActionLabels>;
};

export function useLinkActionsProps(props: LinkEntityActionsProps): LinkActionsProps {
  const {
    sdk,
    validations,
    entityType,
    canLinkMultiple,
    canLinkEntity,
    isDisabled,
    canCreateEntity,
    actionLabels,
  } = props;
  let availableContentTypes: ContentType[] = [];

  if (entityType === 'Entry') {
    availableContentTypes = validations.contentTypes
      ? props.allContentTypes.filter((contentType) => {
          return validations.contentTypes?.includes(contentType.sys.id);
        })
      : props.allContentTypes;
  }
  const maxLinksCount = validations.numberOfLinks?.max;
  const value = sdk.field.getValue();
  const linkCount = Array.isArray(value) ? value.length : value ? 1 : 0;
  const isFull = !!maxLinksCount && maxLinksCount <= linkCount;

  const onCreate = React.useCallback(
    async (contentTypeId?: string) => {
      const { entity, slide } = await createEntity({ sdk, entityType, contentTypeId });
      if (!entity) {
        return;
      }
      props.onCreate(entity.sys.id);
      props.onAction &&
        props.onAction({
          type: 'create_and_link',
          entity: entityType,
          entityData: entity,
          slide,
        });
    },
    [sdk, entityType, props.onCreate, props.onAction]
  );

  const onLinkExisting = React.useCallback(async () => {
    const entity = await selectSingleEntity({ sdk, entityType, validations });
    if (!entity) {
      return;
    }
    props.onLink([entity.sys.id]);
    props.onAction &&
      props.onAction({ type: 'select_and_link', entity: entityType, entityData: entity });
  }, [sdk, entityType, props.onLink, props.onAction]);

  const onLinkSeveralExisting = React.useCallback(async () => {
    const entities = await selectMultipleEntities({ sdk, entityType, validations });

    if (!entities || entities.length === 0) {
      return;
    }
    props.onLink(entities.map((item) => item.sys.id));

    entities.forEach((entity) => {
      props.onAction &&
        props.onAction({ type: 'select_and_link', entity: entityType, entityData: entity });
    });
  }, [sdk, entityType, props.onLink, props.onAction]);

  return useMemo(
    () => ({
      entityType,
      canLinkMultiple,
      isDisabled,
      isFull,
      canCreateEntity,
      canLinkEntity,
      contentTypes: availableContentTypes,
      onCreate,
      onLinkExisting: canLinkMultiple ? onLinkSeveralExisting : onLinkExisting,
      actionLabels,
    }),
    [
      entityType,
      canLinkMultiple,
      isDisabled,
      isFull,
      canCreateEntity,
      canLinkEntity,
      actionLabels,
      availableContentTypes.map((ct) => ct.sys.id).join(':'),
      onCreate,
      onLinkExisting,
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
