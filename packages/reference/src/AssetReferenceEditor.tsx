import * as React from 'react';
import deepEqual from 'deep-equal';
import { FieldConnector } from '@contentful/field-editor-shared';
import { AssetCard } from '@contentful/forma-36-react-components';
import { ViewType, AssetReferenceValue, FieldExtensionSDK, Asset, Action } from './types';
import { LinkActions } from './LinkActions/LinkActions';
import { MissingEntityCard } from './MissingEntityCard/MissingEntityCard';
import { FetchedWrappedAssetCard } from './WrappedAssetCard/WrappedAssetCard';
import { fromFieldValidations, ReferenceValidations } from './utils/fromFieldValidations';
import { AssetsProvider, useAssets } from './EntityStore/EntityStore';

export interface AssetReferenceEditorProps {
  /**
   * is the field disabled initially
   */
  isInitiallyDisabled: boolean;

  sdk: FieldExtensionSDK;

  viewType: ViewType;

  getAssetUrl?: (assetId: string) => string;

  onAction?: (action: Action) => void;

  parameters: {
    instance: {
      canCreateAsset: boolean;
    };
  };
}

type SingleAssetReferenceEditorProps = AssetReferenceEditorProps & {
  value: AssetReferenceValue | null | undefined;
  disabled: boolean;
  setValue: (value: AssetReferenceValue | null | undefined) => void;
  validations: ReferenceValidations;
};

function LinkSingleAssetReference(props: SingleAssetReferenceEditorProps) {
  const { disabled, sdk, setValue } = props;

  return (
    <LinkActions
      entityType="asset"
      multiple={false}
      contentTypes={[]}
      disabled={disabled}
      canCreateEntity={props.parameters.instance.canCreateAsset}
      onCreate={async () => {
        const { entity } = await sdk.navigator.openNewAsset<Asset>({
          slideIn: { waitForClose: true }
        });
        if (!entity) {
          return;
        }
        setValue({
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: entity.sys.id
          }
        });
        props.onAction &&
          props.onAction({ type: 'create_and_link', entity: 'Asset', entityData: entity });
      }}
      onLinkExisting={async () => {
        const entity = await sdk.dialogs.selectSingleAsset<Asset>({
          locale: props.sdk.field.locale,
          mimetypeGroups: props.validations.mimetypeGroups
        });
        if (!entity) {
          return;
        }
        setValue({
          sys: {
            type: 'Link',
            linkType: 'Asset',
            id: entity.sys.id
          }
        });
        props.onAction &&
          props.onAction({ type: 'select_and_link', entity: 'Asset', entityData: entity });
      }}
    />
  );
}

function SingleAssetReferenceEditor(props: SingleAssetReferenceEditorProps) {
  const { value, sdk, disabled } = props;

  const { loadAsset, assets } = useAssets();

  React.useEffect(() => {
    if (value) {
      loadAsset(value.sys.id);
    }
  }, [value?.sys.id]);

  React.useEffect(() => {
    const unsubscribe = sdk.navigator.onSlideInNavigation(({ oldSlideLevel, newSlideLevel }) => {
      if (value?.sys.id) {
        if (oldSlideLevel > newSlideLevel) {
          loadAsset(value.sys.id);
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [sdk, value?.sys.id]);

  if (!value) {
    return <LinkSingleAssetReference {...props} />;
  }

  const asset = assets[value.sys.id];

  if (asset === 'failed') {
    return (
      <MissingEntityCard
        entityType="asset"
        disabled={props.disabled}
        onRemove={() => {
          props.setValue(null);
        }}
      />
    );
  }

  if (asset === undefined) {
    return <AssetCard size="default" isLoading title="" src="" href="" />;
  }

  return (
    <FetchedWrappedAssetCard
      disabled={disabled}
      size="default"
      readOnly={false}
      href={props.getAssetUrl ? props.getAssetUrl(value.sys.id) : ''}
      localeCode={props.sdk.field.locale}
      defaultLocaleCode={props.sdk.locales.default}
      asset={asset}
      onRender={() => {
        props.onAction && props.onAction({ type: 'rendered', entity: 'Asset' });
      }}
      onEdit={() => {
        sdk.navigator.openAsset(value.sys.id, { slideIn: true });
        props.onAction &&
          props.onAction({ entity: 'Asset', type: 'edit', id: value.sys.id, contentTypeId: '' });
      }}
      onRemove={() => {
        props.setValue(null);
        props.onAction &&
          props.onAction({ entity: 'Asset', type: 'delete', id: value.sys.id, contentTypeId: '' });
      }}
    />
  );
}

export function AssetReferenceEditor(props: AssetReferenceEditorProps) {
  const validations = fromFieldValidations(props.sdk.field.validations);

  return (
    <AssetsProvider sdk={props.sdk}>
      <FieldConnector<AssetReferenceValue>
        throttle={0}
        field={props.sdk.field}
        isInitiallyDisabled={props.isInitiallyDisabled}
        isEqualValues={(value1, value2) => {
          return deepEqual(value1, value2);
        }}>
        {({ value, setValue, disabled, externalReset }) => {
          return (
            <SingleAssetReferenceEditor
              key={`single-asset-${externalReset}`}
              {...props}
              validations={validations}
              disabled={disabled}
              value={value}
              setValue={setValue}
            />
          );
        }}
      </FieldConnector>
    </AssetsProvider>
  );
}

AssetReferenceEditor.defaultProps = {
  isInitiallyDisabled: true
};
