import * as React from 'react';
import { Asset, FieldExtensionSDK, Action } from '../types';
import { ReferenceValidations } from '../utils/fromFieldValidations';
import { LinkActions } from '../components';

export function LinkAssetActions(props: {
  sdk: FieldExtensionSDK;
  disabled: boolean;
  multiple: boolean;
  canCreateAsset: boolean;
  validations: ReferenceValidations;
  onCreate: (entry: Asset) => void;
  onLink: (entries: Asset[]) => void;
  onAction?: (action: Action) => void;
}) {
  const onCreate = React.useCallback(async () => {
    const { entity, slide } = await props.sdk.navigator.openNewAsset<Asset>({
      slideIn: true
    });
    if (!entity) {
      return;
    }
    props.onCreate(entity);
    props.onAction &&
      props.onAction({ type: 'create_and_link', entity: 'Asset', entityData: entity, slide });
  }, []);

  const onLinkExisting = React.useCallback(async () => {
    const entity = await props.sdk.dialogs.selectSingleAsset<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups
    });
    if (!entity) {
      return;
    }
    props.onLink([entity]);
    props.onAction &&
      props.onAction({ type: 'select_and_link', entity: 'Asset', entityData: entity });
  }, []);

  const onLinkSeveralExisting = React.useCallback(async () => {
    const entities = await props.sdk.dialogs.selectMultipleAssets<Asset>({
      locale: props.sdk.field.locale,
      mimetypeGroups: props.validations.mimetypeGroups
    });

    if (!entities || entities.length === 0) {
      return;
    }
    props.onLink(entities);

    entities.forEach(entity => {
      props.onAction &&
        props.onAction({ type: 'select_and_link', entity: 'Asset', entityData: entity });
    });
  }, []);

  return (
    <LinkActions
      entityType="asset"
      multiple={props.multiple}
      disabled={props.disabled}
      canCreateEntity={props.canCreateAsset}
      contentTypes={[]}
      onCreate={onCreate}
      onLinkExisting={props.multiple ? onLinkSeveralExisting : onLinkExisting}
    />
  );
}
