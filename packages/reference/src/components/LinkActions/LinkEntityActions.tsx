import * as React from 'react';
import {
  Asset,
  Entry,
  FieldExtensionSDK,
  EntityType,
  Action,
  ContentType,
  ActionLabels,
} from '../../types';
import { ReferenceValidations } from '../../utils/fromFieldValidations';
import { LinkActions, LinkActionsProps } from './LinkActions';

async function createEntity(props: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  contentTypeId?: string;
}) {
  if (props.entityType === 'Entry') {
    if (!props.contentTypeId) {
      return {};
    }
    const { entity, slide } = await props.sdk.navigator.openNewEntry<Entry>(props.contentTypeId, {
      slideIn: true,
    });
    return { entity, slide };
  } else {
    const { entity, slide } = await props.sdk.navigator.openNewAsset<Asset>({
      slideIn: true,
    });
    return { entity, slide };
  }
}

async function selectSingleEntity(props: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  validations: ReferenceValidations;
}) {
  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectSingleEntry<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: props.validations.contentTypes,
    });
  } else {
    return props.sdk.dialogs.selectSingleAsset<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups,
    });
  }
}

async function selectMultipleEntities(props: {
  sdk: FieldExtensionSDK;
  entityType: EntityType;
  validations: ReferenceValidations;
}) {
  const value = props.sdk.field.getValue();

  const linkCount = Array.isArray(value) ? value.length : value ? 1 : 0;

  // TODO: Why not always set `min: 1` by default? Does it make sense to enforce
  //  user to select as many entities as the field's "min" requires? What if e.g.
  // "min" is 4 and the user wants to insert 2 entities first, then create 2 new ones?
  const min = Math.max((props.validations.numberOfLinks?.min || 1) - linkCount, 1);
  // TODO: Consider same for max. If e.g. "max" is 4, we disable the button if the
  //  user wants to select 5 but we show no information why the button is disabled.
  const max = (props.validations.numberOfLinks?.max || +Infinity) - linkCount;

  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectMultipleEntries<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: props.validations.contentTypes,
      min,
      max,
    });
  } else {
    return props.sdk.dialogs.selectMultipleAssets<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups,
      min,
      max,
    });
  }
}

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
  renderCustomActions?: (props: LinkActionsProps) => React.ReactElement;
  actionLabels?: Partial<ActionLabels>;
};

export function LinkEntityActions(props: LinkEntityActionsProps) {
  let availableContentTypes: ContentType[] = [];

  if (props.entityType === 'Entry') {
    availableContentTypes = props.validations.contentTypes
      ? props.allContentTypes.filter((contentType) => {
          return props.validations.contentTypes?.includes(contentType.sys.id);
        })
      : props.allContentTypes;
  }

  const onCreate = React.useCallback(async (contentTypeId?: string) => {
    const { entity, slide } = await createEntity({
      sdk: props.sdk,
      entityType: props.entityType,
      contentTypeId,
    });
    if (!entity) {
      return;
    }
    props.onCreate(entity.sys.id);
    props.onAction &&
      props.onAction({
        type: 'create_and_link',
        entity: props.entityType,
        entityData: entity,
        slide,
      });
  }, []);

  const onLinkExisting = React.useCallback(async () => {
    const entity = await selectSingleEntity({
      sdk: props.sdk,
      entityType: props.entityType,
      validations: props.validations,
    });
    if (!entity) {
      return;
    }
    props.onLink([entity.sys.id]);
    props.onAction &&
      props.onAction({ type: 'select_and_link', entity: props.entityType, entityData: entity });
  }, []);

  const onLinkSeveralExisting = React.useCallback(async () => {
    const entities = await selectMultipleEntities({
      sdk: props.sdk,
      entityType: props.entityType,
      validations: props.validations,
    });

    if (!entities || entities.length === 0) {
      return;
    }
    props.onLink(entities.map((item) => item.sys.id));

    entities.forEach((entity) => {
      props.onAction &&
        props.onAction({ type: 'select_and_link', entity: props.entityType, entityData: entity });
    });
  }, []);

  const linkActionProps = {
    entityType: props.entityType,
    canLinkMultiple: props.canLinkMultiple,
    isDisabled: props.isDisabled,
    canCreateEntity: props.canCreateEntity,
    canLinkEntity: props.canLinkEntity,
    contentTypes: availableContentTypes,
    onCreate: onCreate,
    onLinkExisting: props.canLinkMultiple ? onLinkSeveralExisting : onLinkExisting,
    actionLabels: props.actionLabels,
  };

  return props.renderCustomActions ? (
    props.renderCustomActions(linkActionProps)
  ) : (
    <LinkActions {...linkActionProps} />
  );
}
