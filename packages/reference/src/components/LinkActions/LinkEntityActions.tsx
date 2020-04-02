import * as React from 'react';
import {
  Asset,
  Entry,
  FieldExtensionSDK,
  ReferenceEntityType,
  Action,
  ContentType
} from '../../types';
import { ReferenceValidations } from '../../utils/fromFieldValidations';
import { LinkActions } from './LinkActions';

async function createEntity(props: {
  sdk: FieldExtensionSDK;
  entityType: ReferenceEntityType;
  contentTypeId?: string;
}) {
  if (props.entityType === 'Entry') {
    if (!props.contentTypeId) {
      return {};
    }
    const { entity, slide } = await props.sdk.navigator.openNewEntry<Entry>(props.contentTypeId, {
      slideIn: true
    });
    return { entity, slide };
  } else {
    const { entity, slide } = await props.sdk.navigator.openNewAsset<Asset>({
      slideIn: true
    });
    return { entity, slide };
  }
}

async function selectSingleEntity(props: {
  sdk: FieldExtensionSDK;
  entityType: ReferenceEntityType;
  validations: ReferenceValidations;
}) {
  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectSingleEntry<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: props.validations.contentTypes
    });
  } else {
    return props.sdk.dialogs.selectSingleAsset<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups
    });
  }
}

async function selectMultipleEntities(props: {
  sdk: FieldExtensionSDK;
  entityType: ReferenceEntityType;
  validations: ReferenceValidations;
}) {
  if (props.entityType === 'Entry') {
    return await props.sdk.dialogs.selectMultipleEntries<Entry>({
      locale: props.sdk.field.locale,
      contentTypes: props.validations.contentTypes
    });
  } else {
    return props.sdk.dialogs.selectMultipleAssets<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups
    });
  }
}

export function LinkEntityActions(props: {
  entityType: ReferenceEntityType;
  sdk: FieldExtensionSDK;
  allContentTypes: ContentType[];
  disabled: boolean;
  multiple: boolean;
  canCreateEntity: boolean;
  validations: ReferenceValidations;
  onCreate: (id: string) => void;
  onLink: (ids: string[]) => void;
  onAction?: (action: Action) => void;
}) {
  let availableContentTypes: ContentType[] = [];

  if (props.entityType === 'Entry') {
    availableContentTypes = props.validations.contentTypes
      ? props.allContentTypes.filter(contentType => {
          return props.validations.contentTypes?.includes(contentType.sys.id);
        })
      : props.allContentTypes;
  }

  const onCreate = React.useCallback(async (contentTypeId?: string) => {
    const { entity, slide } = await createEntity({
      sdk: props.sdk,
      entityType: props.entityType,
      contentTypeId
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
        slide
      });
  }, []);

  const onLinkExisting = React.useCallback(async () => {
    const entity = await selectSingleEntity({
      sdk: props.sdk,
      entityType: props.entityType,
      validations: props.validations
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
      validations: props.validations
    });

    if (!entities || entities.length === 0) {
      return;
    }
    props.onLink(entities.map(item => item.sys.id));

    entities.forEach(entity => {
      props.onAction &&
        props.onAction({ type: 'select_and_link', entity: props.entityType, entityData: entity });
    });
  }, []);

  return (
    <LinkActions
      entityType={props.entityType}
      multiple={props.multiple}
      disabled={props.disabled}
      canCreateEntity={props.canCreateEntity}
      contentTypes={availableContentTypes}
      onCreate={onCreate}
      onLinkExisting={props.multiple ? onLinkSeveralExisting : onLinkExisting}
    />
  );
}
